// Dynamic API Base URL configuration
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('std_custom_api_url');
    if (custom) return custom.replace(/\/+$/, '');

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/v1';
    }
    // If accessing via local network Wi-Fi (e.g. 192.168.1.x)
    if (/^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname)) {
      return `http://${window.location.hostname}:5000/v1`;
    }
    // Production Render Web Service / default
    return `${window.location.origin}/v1`;
  }
  return 'http://localhost:5000/v1';
};

export const BASE_URL = getBaseUrl();

const getAuthHeaders = () => {
  const token = localStorage.getItem('std_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function safeFetchJson(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    let json = {};
    if (text && text.trim().length > 0) {
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error('BACKEND_NOT_CONNECTED');
      }
    }

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('std_token');
        localStorage.removeItem('std_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(json.message || `Request failed with status ${res.status}`);
    }
    return json;
  } catch (err) {
    if (err.message === 'BACKEND_NOT_CONNECTED' || err.name === 'TypeError') {
      return { _fallback: true, originalError: err.message };
    }
    throw err;
  }
}

// Fallback demo fixtures for seamless offline/preview stability
const FALLBACK_SHOPS = [
  {
    id: '6ad70c091134263f4ce70e06',
    name: 'Gupta Kirana & Daily Needs',
    shopName: 'Gupta Kirana & Daily Needs',
    category: 'grocery',
    description: 'Fresh wheat, pulses, dairy, oils & all daily essentials',
    phone: '9820012345',
    isOpen: true,
    rating: 4.9,
    deliveryRadiusKm: 5,
  },
  {
    id: '6ad70c0a1134263f4ce70e0c',
    name: 'Kisan Fresh Sabzi & Fruit Mandi',
    shopName: 'Kisan Fresh Sabzi & Fruit Mandi',
    category: 'fruits_vegetables',
    description: 'Daily fresh organic fruits and farm-picked green vegetables',
    phone: '9820098765',
    isOpen: true,
    rating: 4.8,
    deliveryRadiusKm: 3,
  },
  {
    id: '6ad70c0a1134263f4ce70e11',
    name: 'Sanjeevani Medicos & Healthcare',
    shopName: 'Sanjeevani Medicos & Healthcare',
    category: 'pharmacy',
    description: 'Prescription medicines, baby care & first aid essentials',
    phone: '9820067890',
    isOpen: true,
    rating: 5.0,
    deliveryRadiusKm: 6,
  },
];

const FALLBACK_PRODUCTS = [
  {
    id: '6ad70c091134263f4ce70e07',
    name: 'Aashirvaad Shudh Chakki Atta',
    price: 245,
    mrp: 275,
    unit: 'kg',
    category: 'grocery',
    stock: 50,
    isAvailable: true,
  },
  {
    id: '6ad70c091134263f4ce70e08',
    name: 'Amul Taaza Homogenised Milk',
    price: 66,
    mrp: 72,
    unit: 'liter',
    category: 'dairy',
    stock: 35,
    isAvailable: true,
  },
  {
    id: '6ad70c091134263f4ce70e09',
    name: 'Amul Salted Butter 500g',
    price: 275,
    mrp: 290,
    unit: 'gm',
    category: 'dairy',
    stock: 20,
    isAvailable: true,
  },
  {
    id: '6ad70c091134263f4ce70e0a',
    name: 'Tata Salt Vaccum Evaporated 1kg',
    price: 28,
    mrp: 30,
    unit: 'packet',
    category: 'grocery',
    stock: 80,
    isAvailable: true,
  },
];

export const api = {
  // === AUTHENTICATION (CLONED PASSPORT JWT) ===
  async checkPhone(phone) {
    const res = await safeFetchJson(`${BASE_URL}/auth/check-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    if (res._fallback) {
      const savedUser = localStorage.getItem(`user_${phone}`);
      return { exists: !!savedUser, role: savedUser ? JSON.parse(savedUser).role : null };
    }
    return res;
  },

  async login(credentials) {
    const res = await safeFetchJson(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (res._fallback) {
      const user = {
        id: `user_${Date.now()}`,
        name: credentials.phone || 'User',
        phone: credentials.phone || '9876543210',
        role: credentials.phone?.startsWith('98') ? 'dukandar' : 'customer',
      };
      return {
        user,
        tokens: { access: { token: `demo_jwt_token_${Date.now()}` } },
      };
    }
    return res;
  },

  async register(data) {
    const res = await safeFetchJson(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res._fallback) {
      const user = {
        id: `user_${Date.now()}`,
        name: data.name,
        phone: data.phone,
        role: data.role || 'customer',
        shopName: data.shopName || '',
      };
      localStorage.setItem(`user_${data.phone}`, JSON.stringify(user));
      return {
        user,
        tokens: { access: { token: `demo_jwt_token_${Date.now()}` } },
      };
    }
    return res;
  },

  async getMe() {
    return safeFetchJson(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
  },

  logout() {
    localStorage.removeItem('std_token');
    localStorage.removeItem('std_user');
  },

  // === GEO-RADIUS DISCOVERY & SHOPS ===
  async getNearbyShops(lng = 77.209, lat = 28.6139) {
    const res = await safeFetchJson(`${BASE_URL}/shops/nearby?lng=${lng}&lat=${lat}`);
    if (res._fallback || !Array.isArray(res) || res.length === 0) {
      return FALLBACK_SHOPS;
    }
    return res;
  },

  async getMyShop() {
    const res = await safeFetchJson(`${BASE_URL}/shops/me`, {
      headers: getAuthHeaders(),
    });
    if (res._fallback) {
      return FALLBACK_SHOPS[0];
    }
    return res;
  },

  async updateMyShop(shopData) {
    return safeFetchJson(`${BASE_URL}/shops/me`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(shopData),
    });
  },

  // === INVENTORY & PRODUCTS ===
  async getProducts(shopId, category) {
    const query = category && category !== 'All' && category !== 'all'
      ? `?shopId=${shopId}&category=${category}`
      : `?shopId=${shopId}`;
    const res = await safeFetchJson(`${BASE_URL}/products${query}`);
    if (res._fallback || !Array.isArray(res) || res.length === 0) {
      return FALLBACK_PRODUCTS;
    }
    return res;
  },

  async getMyProducts() {
    const res = await safeFetchJson(`${BASE_URL}/products/my-inventory`, {
      headers: getAuthHeaders(),
    });
    if (res._fallback || !Array.isArray(res)) {
      return JSON.parse(localStorage.getItem('std_local_inventory') || JSON.stringify(FALLBACK_PRODUCTS));
    }
    return res;
  },

  async createProduct(productData) {
    const res = await safeFetchJson(`${BASE_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    if (res._fallback) {
      const local = JSON.parse(localStorage.getItem('std_local_inventory') || JSON.stringify(FALLBACK_PRODUCTS));
      const newProd = { ...productData, id: `prod_${Date.now()}`, isAvailable: true };
      local.unshift(newProd);
      localStorage.setItem('std_local_inventory', JSON.stringify(local));
      return newProd;
    }
    return res;
  },

  async updateProduct(id, productData) {
    return safeFetchJson(`${BASE_URL}/products/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
  },

  async deleteProduct(id) {
    return safeFetchJson(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  // === COMBOS & COUPONS ===
  async getCombos(shopId) {
    const res = await safeFetchJson(`${BASE_URL}/combos?shopId=${shopId}`);
    return Array.isArray(res) ? res : [];
  },

  async getMyCombos() {
    const res = await safeFetchJson(`${BASE_URL}/combos/my-combos`, {
      headers: getAuthHeaders(),
    });
    return Array.isArray(res) ? res : [];
  },

  async createCombo(data) {
    return safeFetchJson(`${BASE_URL}/combos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  async deleteCombo(id) {
    return safeFetchJson(`${BASE_URL}/combos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  async getCoupons(shopId) {
    const res = await safeFetchJson(`${BASE_URL}/coupons?shopId=${shopId}`);
    return Array.isArray(res) ? res : [];
  },

  async getMyCoupons() {
    const res = await safeFetchJson(`${BASE_URL}/coupons/my-coupons`, {
      headers: getAuthHeaders(),
    });
    return Array.isArray(res) ? res : [];
  },

  async createCoupon(data) {
    return safeFetchJson(`${BASE_URL}/coupons`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  async deleteCoupon(id) {
    return safeFetchJson(`${BASE_URL}/coupons/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  // === ORDERS & LIVE DISPATCH QUEUE ===
  async createOrder(orderData) {
    const res = await safeFetchJson(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
    if (res._fallback) {
      const order = {
        id: `ord_${Date.now()}`,
        orderNumber: `STD-${Date.now().toString(36).toUpperCase()}`,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        status: 'pending',
        deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString(),
        createdAt: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('std_customer_orders') || '[]');
      existing.unshift(order);
      localStorage.setItem('std_customer_orders', JSON.stringify(existing));
      return order;
    }
    return res;
  },

  async getMyOrders() {
    const res = await safeFetchJson(`${BASE_URL}/orders/my-orders`, {
      headers: getAuthHeaders(),
    });
    if (res._fallback || !Array.isArray(res)) {
      return JSON.parse(localStorage.getItem('std_customer_orders') || '[]');
    }
    return res;
  },

  async getDukandarOrders() {
    const res = await safeFetchJson(`${BASE_URL}/orders/dukandar-orders`, {
      headers: getAuthHeaders(),
    });
    if (res._fallback || !Array.isArray(res)) {
      return JSON.parse(localStorage.getItem('std_dukandar_orders') || '[]');
    }
    return res;
  },

  async updateOrderStatus(orderId, status) {
    return safeFetchJson(`${BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
  },

  async verifyDeliveryOtp(orderId, otp) {
    return safeFetchJson(`${BASE_URL}/orders/${orderId}/verify-otp`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ otp }),
    });
  },
};
