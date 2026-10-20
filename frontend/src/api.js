// Determine API Base URL dynamically
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  // If running in browser and on Render or custom domain, use relative /v1
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/v1';
    }
    // If on Wi-Fi IP (e.g. 192.168.1.3), point to local backend port 5000
    if (/^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname)) {
      return `http://${window.location.hostname}:5000/v1`;
    }
    // Production Render / Custom Domain
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

export const api = {
  // === AUTHENTICATION APIS ===
  async register(data) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Registration failed');
    return json;
  },

  async login(data) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Login failed');
    return json;
  },

  logout() {
    localStorage.removeItem('std_token');
    localStorage.removeItem('std_user');
  },

  // === SHOP APIS ===
  async getShops(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/shops${query ? '?' + query : ''}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch shops');
    return json;
  },

  async getMyShop() {
    const res = await fetch(`${BASE_URL}/shops/my/profile`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch your shop');
    return json;
  },

  async toggleShopStatus() {
    const res = await fetch(`${BASE_URL}/shops/my/toggle-status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to toggle shop status');
    return json;
  },

  // === PRODUCT APIS ===
  async getShopProducts(shopId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/products/shop/${shopId}${query ? '?' + query : ''}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch products');
    return json;
  },

  async getMyProducts() {
    const res = await fetch(`${BASE_URL}/products/my`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch my products');
    return json;
  },

  async createProduct(productData) {
    const res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to add product');
    return json;
  },

  // === ORDER APIS ===
  async createOrder(orderData) {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to place order');
    return json;
  },

  async getMyOrders() {
    const res = await fetch(`${BASE_URL}/orders/my-orders`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch customer orders');
    return json;
  },

  async getShopOrders() {
    const res = await fetch(`${BASE_URL}/orders/shop-orders`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch shop orders');
    return json;
  },

  async updateOrderStatus(orderId, status) {
    const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update order status');
    return json;
  },

  async verifyDeliveryOtp(orderId, otp) {
    const res = await fetch(`${BASE_URL}/orders/${orderId}/verify-otp`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ otp }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to verify delivery OTP');
    return json;
  },
};
