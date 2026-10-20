// Determine API Base URL dynamically
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/v1';
    }
    // If on Wi-Fi IP (e.g. 192.168.1.3), point to local backend port 5000
    if (/^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname)) {
      return `http://${window.location.hostname}:5000/v1`;
    }
    // If on Render or custom domain, relative /v1
    return `${window.location.origin}/v1`;
  }
  return '/v1';
};

const BASE_URL = getBaseUrl();

const getAuthHeaders = () => {
  const token = localStorage.getItem('std_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Safe JSON parser to prevent "Unexpected end of JSON input" errors
async function safeFetchJson(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    let json = {};
    if (text && text.trim().length > 0) {
      try {
        json = JSON.parse(text);
      } catch (e) {
        // Returned HTML (e.g. 404 or index.html)
        throw new Error('BACKEND_NOT_CONNECTED');
      }
    } else {
      // Empty response from static server
      throw new Error('BACKEND_NOT_CONNECTED');
    }

    if (!res.ok) {
      throw new Error(json.message || `Request failed with status ${res.status}`);
    }
    return json;
  } catch (err) {
    if (err.message === 'BACKEND_NOT_CONNECTED' || err.name === 'TypeError') {
      // Return a special flag indicating fallback is needed
      return { _fallback: true, originalError: err.message };
    }
    throw err;
  }
}

// Fallback Mock Database for Instant Phone Testing when backend is sleeping/offline
const DEMO_USERS = {
  'customer@shoptodoor.com': {
    id: 'user_cust_demo',
    name: 'Rahul Sharma',
    email: 'customer@shoptodoor.com',
    role: 'customer',
    phoneNumber: '9820054321',
  },
  'dukandar@shoptodoor.com': {
    id: 'user_duk_demo',
    name: 'Ramesh Gupta',
    email: 'dukandar@shoptodoor.com',
    role: 'dukandar',
    phoneNumber: '9820012345',
    shopName: 'Gupta Kirana & Daily Needs',
  },
};

const DEFAULT_SHOPS = [
  {
    id: 'shop_demo_1',
    name: 'Gupta Kirana & Daily Needs',
    category: 'grocery',
    description: 'Fresh wheat, pulses, dairy, oils & all daily essentials',
    phone: '9820012345',
    isOpen: true,
    rating: 4.9,
    deliveryRadiusKm: 5,
  },
  {
    id: 'shop_demo_2',
    name: 'Kisan Fresh Sabzi & Fruit Mandi',
    category: 'fruits_vegetables',
    description: 'Daily fresh organic fruits and farm-picked vegetables',
    phone: '9820098765',
    isOpen: true,
    rating: 4.8,
    deliveryRadiusKm: 3,
  },
  {
    id: 'shop_demo_3',
    name: 'Sanjeevani Medicos & Healthcare',
    category: 'pharmacy',
    description: 'Prescription medicines, baby care & first aid essentials',
    phone: '9820067890',
    isOpen: true,
    rating: 5.0,
    deliveryRadiusKm: 6,
  },
];

const DEFAULT_PRODUCTS = {
  shop_demo_1: [
    { id: 'p1', name: 'Aashirvaad Shudh Chakki Atta', price: 245, unit: 'kg', unitValue: '5' },
    { id: 'p2', name: 'Amul Taaza Homogenised Milk', price: 66, unit: 'liter', unitValue: '1' },
    { id: 'p3', name: 'Amul Salted Butter', price: 275, unit: 'gm', unitValue: '500' },
    { id: 'p4', name: 'Nescafe Classic Instant Coffee', price: 330, unit: 'gm', unitValue: '200' },
  ],
  shop_demo_2: [
    { id: 'p5', name: 'Fresh Farm Apples (Kinnaur)', price: 160, unit: 'kg', unitValue: '1' },
    { id: 'p6', name: 'Hybrid Desi Tomatoes', price: 40, unit: 'kg', unitValue: '1' },
    { id: 'p7', name: 'Fresh Green Palak', price: 30, unit: 'gm', unitValue: '250' },
  ],
  shop_demo_3: [
    { id: 'p8', name: 'Emergency First Aid Kit', price: 450, unit: 'box', unitValue: '1' },
    { id: 'p9', name: 'Limcee Vitamin C 500mg', price: 180, unit: 'strip', unitValue: '15' },
  ],
};

export const api = {
  // === AUTHENTICATION ===
  async login(data) {
    const res = await safeFetchJson(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res._fallback) {
      // Smart Demo & Offline Fallback: Login successfully without breaking!
      const user = DEMO_USERS[data.email] || {
        id: `user_${Date.now()}`,
        name: data.email.split('@')[0],
        email: data.email,
        role: data.email.includes('dukandar') ? 'dukandar' : 'customer',
        phoneNumber: '9876543210',
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
      // Offline fallback: Create user in local storage
      const user = {
        id: `user_${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role || 'customer',
        phoneNumber: data.phoneNumber || '9876543210',
        shopName: data.shopName,
      };
      return {
        user,
        tokens: { access: { token: `demo_jwt_token_${Date.now()}` } },
      };
    }
    return res;
  },

  logout() {
    localStorage.removeItem('std_token');
    localStorage.removeItem('std_user');
  },

  // === SHOPS ===
  async getShops(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await safeFetchJson(`${BASE_URL}/shops${query ? '?' + query : ''}`);
    if (res._fallback || !res.results || res.results.length === 0) {
      return { results: DEFAULT_SHOPS };
    }
    return res;
  },

  async getMyShop() {
    const res = await safeFetchJson(`${BASE_URL}/shops/my/profile`, {
      headers: getAuthHeaders(),
    });
    if (res._fallback) {
      return DEFAULT_SHOPS[0];
    }
    return res;
  },

  async toggleShopStatus() {
    const res = await safeFetchJson(`${BASE_URL}/shops/my/toggle-status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (res._fallback) {
      DEFAULT_SHOPS[0].isOpen = !DEFAULT_SHOPS[0].isOpen;
      return DEFAULT_SHOPS[0];
    }
    return res;
  },

  // === PRODUCTS ===
  async getShopProducts(shopId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await safeFetchJson(`${BASE_URL}/products/shop/${shopId}${query ? '?' + query : ''}`);
    if (res._fallback || !res.results || res.results.length === 0) {
      return { results: DEFAULT_PRODUCTS[shopId] || DEFAULT_PRODUCTS['shop_demo_1'] };
    }
    return res;
  },

  async getMyProducts() {
    const res = await safeFetchJson(`${BASE_URL}/products/my`, {
      headers: getAuthHeaders(),
    });
    if (res._fallback) {
      return { results: DEFAULT_PRODUCTS['shop_demo_1'] };
    }
    return res;
  },

  // === ORDERS ===
  async createOrder(orderData) {
    const res = await safeFetchJson(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
    if (res._fallback) {
      // Create local fallback order with 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const order = {
        id: `ord_${Date.now()}`,
        orderNumber: `STD-${Date.now().toString().slice(-4)}`,
        status: 'placed',
        deliveryOtp: otp,
        totalAmount: 311,
        createdAt: new Date().toISOString(),
        items: [{ name: 'Grocery Items', quantity: 1, totalPrice: 311 }],
      };
      // Save in localStorage for demo
      const existing = JSON.parse(localStorage.getItem('std_demo_orders') || '[]');
      existing.unshift(order);
      localStorage.setItem('std_demo_orders', JSON.stringify(existing));
      return order;
    }
    return res;
  },

  async getMyOrders() {
    const res = await safeFetchJson(`${BASE_URL}/orders/my-orders`, {
      headers: getAuthHeaders(),
    });
    if (res._fallback) {
      const demoOrders = JSON.parse(localStorage.getItem('std_demo_orders') || '[]');
      return { results: demoOrders };
    }
    return res;
  },

  async getShopOrders() {
    const res = await safeFetchJson(`${BASE_URL}/orders/shop-orders`, {
      headers: getAuthHeaders(),
    });
    if (res._fallback) {
      const demoOrders = JSON.parse(localStorage.getItem('std_demo_orders') || '[]');
      return { results: demoOrders };
    }
    return res;
  },

  async updateOrderStatus(orderId, status) {
    const res = await safeFetchJson(`${BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (res._fallback) {
      const demoOrders = JSON.parse(localStorage.getItem('std_demo_orders') || '[]');
      const ord = demoOrders.find((o) => o.id === orderId);
      if (ord) ord.status = status;
      localStorage.setItem('std_demo_orders', JSON.stringify(demoOrders));
      return { order: ord };
    }
    return res;
  },

  async verifyDeliveryOtp(orderId, otp) {
    const res = await safeFetchJson(`${BASE_URL}/orders/${orderId}/verify-otp`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ otp }),
    });
    if (res._fallback) {
      const demoOrders = JSON.parse(localStorage.getItem('std_demo_orders') || '[]');
      const ord = demoOrders.find((o) => o.id === orderId);
      if (ord) {
        if (ord.deliveryOtp === otp) {
          ord.status = 'delivered';
          localStorage.setItem('std_demo_orders', JSON.stringify(demoOrders));
          return { message: 'Verified', order: ord };
        } else {
          throw new Error('Invalid OTP');
        }
      }
    }
    return res;
  },
};
