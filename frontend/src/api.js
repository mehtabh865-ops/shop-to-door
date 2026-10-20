const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/v1';

export const api = {
  async register(data) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async login(data) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getShops() {
    const res = await fetch(`${API_BASE_URL}/shops`);
    return res.json();
  },

  async getShopProducts(shopId) {
    const res = await fetch(`${API_BASE_URL}/products/shop/${shopId}`);
    return res.json();
  },

  async createOrder(token, orderData) {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    return res.json();
  },
};
