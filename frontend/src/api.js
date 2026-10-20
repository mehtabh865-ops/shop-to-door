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
    // If on Render static site, use public live HTTPS tunnel to MongoDB backend
    if (window.location.hostname.includes('onrender.com')) {
      return 'https://6098019b5cfea3.lhr.life/v1';
    }
    // Default to relative /v1 for unified Web Services
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
    id: '6ad70c091134263f4ce70e06',
    name: 'Gupta Kirana & Daily Needs',
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
    category: 'fruits_vegetables',
    description: 'Daily fresh organic fruits and farm-picked vegetables',
    phone: '9820098765',
    isOpen: true,
    rating: 4.8,
    deliveryRadiusKm: 3,
  },
  {
    id: '6ad70c0a1134263f4ce70e11',
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
  '6ad70c091134263f4ce70e06': [
    { id: '6ad70c091134263f4ce70e07', name: 'Aashirvaad Shudh Chakki Atta', price: 245, mrp: 275, unit: 'kg', unitValue: '5', category: 'grocery', stock: 50, isOffer: true, discountPercent: 11, offerBadge: '11% OFF' },
    { id: '6ad70c091134263f4ce70e08', name: 'Amul Taaza Homogenised Milk', price: 66, mrp: 72, unit: 'liter', unitValue: '1', category: 'dairy', stock: 35, isOffer: false },
    { id: '6ad70c091134263f4ce70e09', name: 'Amul Salted Butter', price: 275, mrp: 290, unit: 'gm', unitValue: '500', category: 'dairy', stock: 20, isOffer: true, discountPercent: 5, offerBadge: 'Save ₹15' },
    { id: '6ad70c091134263f4ce70e0a', name: 'Nescafe Classic Instant Coffee', price: 330, mrp: 380, unit: 'gm', unitValue: '200', category: 'snacks', stock: 15, isOffer: true, discountPercent: 13, offerBadge: 'Hot Deal' },
    { id: '6ad7207f653df5fb8786e408', name: 'Fresh Paneer 200g', price: 90, mrp: 100, unit: 'packet', unitValue: '1', category: 'dairy', stock: 30, isOffer: true, discountPercent: 10, offerBadge: '10% OFF' },
  ],
  '6ad70c0a1134263f4ce70e0c': [
    { id: '6ad70c0a1134263f4ce70e0d', name: 'Fresh Farm Apples (Kinnaur)', price: 160, mrp: 180, unit: 'kg', unitValue: '1', category: 'fruits_vegetables', stock: 25, isOffer: true, discountPercent: 11, offerBadge: 'Fresh' },
    { id: '6ad70c0a1134263f4ce70e0e', name: 'Hybrid Desi Tomatoes', price: 40, mrp: 50, unit: 'kg', unitValue: '1', category: 'fruits_vegetables', stock: 60, isOffer: true, discountPercent: 20, offerBadge: '20% OFF' },
    { id: '6ad70c0a1134263f4ce70e0f', name: 'Fresh Green Palak', price: 30, mrp: 35, unit: 'gm', unitValue: '250', category: 'fruits_vegetables', stock: 30, isOffer: false },
  ],
  '6ad70c0a1134263f4ce70e11': [
    { id: '6ad70c0a1134263f4ce70e12', name: 'Emergency First Aid Kit', price: 450, mrp: 550, unit: 'box', unitValue: '1', category: 'pharmacy', stock: 10, isOffer: true, discountPercent: 18, offerBadge: '18% OFF' },
    { id: '6ad70c0a1134263f4ce70e13', name: 'Limcee Vitamin C 500mg', price: 180, mrp: 210, unit: 'strip', unitValue: '15', category: 'pharmacy', stock: 45, isOffer: true, discountPercent: 14, offerBadge: 'Best Seller' },
  ],
};

const DEFAULT_COMBOS = [
  {
    id: 'combo_1',
    name: 'Morning Breakfast Combo',
    description: 'Amul Milk (1L) + Amul Butter (500g) + Nescafe Coffee (200g)',
    comboPrice: 599,
    originalPrice: 671,
    savings: 72,
    badge: 'Save ₹72',
    items: [
      { product: { id: '6ad70c091134263f4ce70e08', name: 'Amul Milk' }, quantity: 1 },
      { product: { id: '6ad70c091134263f4ce70e09', name: 'Amul Butter' }, quantity: 1 },
      { product: { id: '6ad70c091134263f4ce70e0a', name: 'Nescafe Coffee' }, quantity: 1 },
    ],
  },
  {
    id: 'combo_2',
    name: 'Kirana Essentials Pack',
    description: 'Chakki Atta (5kg) + Fresh Paneer (200g) + Amul Milk (1L)',
    comboPrice: 380,
    originalPrice: 401,
    savings: 21,
    badge: 'Daily Needs Saver',
    items: [
      { product: { id: '6ad70c091134263f4ce70e07', name: 'Chakki Atta 5kg' }, quantity: 1 },
      { product: { id: '6ad7207f653df5fb8786e408', name: 'Fresh Paneer 200g' }, quantity: 1 },
      { product: { id: '6ad70c091134263f4ce70e08', name: 'Amul Milk 1L' }, quantity: 1 },
    ],
  },
];

const DEFAULT_COUPONS = [
  {
    id: 'coup_1',
    code: 'WELCOME50',
    description: 'Flat ₹50 OFF on orders above ₹299',
    discountType: 'flat',
    discountValue: 50,
    minOrderAmount: 299,
    maxDiscount: 50,
    isActive: true,
  },
  {
    id: 'coup_2',
    code: 'SUPER10',
    description: '10% instant discount on orders above ₹400',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 400,
    maxDiscount: 100,
    isActive: true,
  },
];

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
      const demoProducts = JSON.parse(localStorage.getItem('std_demo_products') || 'null');
      return { results: (shopId === 'shop_demo_1' && demoProducts) || DEFAULT_PRODUCTS[shopId] || DEFAULT_PRODUCTS['shop_demo_1'] };
    }
    return res;
  },

  async getMyProducts() {
    const res = await safeFetchJson(`${BASE_URL}/products/my`, {
      headers: getAuthHeaders(),
    });
    if (res._fallback) {
      const demoProducts = JSON.parse(localStorage.getItem('std_demo_products') || JSON.stringify(DEFAULT_PRODUCTS['shop_demo_1']));
      return { results: demoProducts };
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
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const demoProducts = JSON.parse(localStorage.getItem('std_demo_products') || JSON.stringify(DEFAULT_PRODUCTS['6ad70c091134263f4ce70e06']));
      let calculatedTotal = 0;
      const orderItems = (orderData.items || []).map((it) => {
        const prod = demoProducts.find((p) => p.id === it.productId);
        const name = prod ? prod.name : 'Store Item';
        const price = prod ? prod.price : 100;
        const total = price * it.quantity;
        calculatedTotal += total;
        return {
          productId: it.productId,
          name,
          price,
          quantity: it.quantity,
          totalPrice: total,
        };
      });

      const order = {
        id: `ord_${Date.now()}`,
        orderNumber: `STD-${Date.now().toString().slice(-6)}`,
        status: 'placed',
        deliveryOtp: otp,
        totalAmount: calculatedTotal || 199,
        createdAt: new Date().toISOString(),
        items: orderItems,
      };
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

  // === DUKANDAR INVENTORY CRUD ===
  async createProduct(productData) {
    const res = await safeFetchJson(`${BASE_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    if (res._fallback) {
      const demoProducts = JSON.parse(localStorage.getItem('std_demo_products') || JSON.stringify(DEFAULT_PRODUCTS['shop_demo_1']));
      const newProd = {
        id: `prod_${Date.now()}`,
        ...productData,
        createdAt: new Date().toISOString(),
      };
      demoProducts.unshift(newProd);
      localStorage.setItem('std_demo_products', JSON.stringify(demoProducts));
      return newProd;
    }
    return res;
  },

  async updateProduct(productId, updateData) {
    const res = await safeFetchJson(`${BASE_URL}/products/${productId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    if (res._fallback) {
      let demoProducts = JSON.parse(localStorage.getItem('std_demo_products') || JSON.stringify(DEFAULT_PRODUCTS['shop_demo_1']));
      demoProducts = demoProducts.map((p) => (p.id === productId ? { ...p, ...updateData } : p));
      localStorage.setItem('std_demo_products', JSON.stringify(demoProducts));
      return demoProducts.find((p) => p.id === productId);
    }
    return res;
  },

  async deleteProduct(productId) {
    const res = await safeFetchJson(`${BASE_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res._fallback) {
      let demoProducts = JSON.parse(localStorage.getItem('std_demo_products') || JSON.stringify(DEFAULT_PRODUCTS['shop_demo_1']));
      demoProducts = demoProducts.filter((p) => p.id !== productId);
      localStorage.setItem('std_demo_products', JSON.stringify(demoProducts));
      return { message: 'Deleted' };
    }
    return res;
  },

  // === COMBOS APIS ===
  async createCombo(comboData) {
    const res = await safeFetchJson(`${BASE_URL}/combos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(comboData),
    });
    if (res._fallback) {
      const combos = JSON.parse(localStorage.getItem('std_demo_combos') || JSON.stringify(DEFAULT_COMBOS));
      const newCombo = {
        id: `combo_${Date.now()}`,
        ...comboData,
        savings: (comboData.originalPrice || comboData.comboPrice + 50) - comboData.comboPrice,
      };
      combos.unshift(newCombo);
      localStorage.setItem('std_demo_combos', JSON.stringify(combos));
      return newCombo;
    }
    return res;
  },

  async getMyCombos() {
    const res = await safeFetchJson(`${BASE_URL}/combos/my`, {
      headers: getAuthHeaders(),
    });
    if (res._fallback) {
      return { results: JSON.parse(localStorage.getItem('std_demo_combos') || JSON.stringify(DEFAULT_COMBOS)) };
    }
    return res;
  },

  async getShopCombos(shopId) {
    const res = await safeFetchJson(`${BASE_URL}/combos/shop/${shopId}`);
    if (res._fallback) {
      return { results: JSON.parse(localStorage.getItem('std_demo_combos') || JSON.stringify(DEFAULT_COMBOS)) };
    }
    return res;
  },

  async deleteCombo(comboId) {
    const res = await safeFetchJson(`${BASE_URL}/combos/${comboId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res._fallback) {
      let combos = JSON.parse(localStorage.getItem('std_demo_combos') || JSON.stringify(DEFAULT_COMBOS));
      combos = combos.filter((c) => c.id !== comboId);
      localStorage.setItem('std_demo_combos', JSON.stringify(combos));
      return { message: 'Deleted' };
    }
    return res;
  },

  // === COUPONS & OFFERS APIS ===
  async createCoupon(couponData) {
    const res = await safeFetchJson(`${BASE_URL}/coupons`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(couponData),
    });
    if (res._fallback) {
      const coupons = JSON.parse(localStorage.getItem('std_demo_coupons') || JSON.stringify(DEFAULT_COUPONS));
      const newCoupon = {
        id: `coup_${Date.now()}`,
        ...couponData,
        code: couponData.code.toUpperCase(),
        isActive: true,
      };
      coupons.unshift(newCoupon);
      localStorage.setItem('std_demo_coupons', JSON.stringify(coupons));
      return newCoupon;
    }
    return res;
  },

  async getMyCoupons() {
    const res = await safeFetchJson(`${BASE_URL}/coupons/my`, {
      headers: getAuthHeaders(),
    });
    if (res._fallback) {
      return { results: JSON.parse(localStorage.getItem('std_demo_coupons') || JSON.stringify(DEFAULT_COUPONS)) };
    }
    return res;
  },

  async getShopCoupons(shopId) {
    const res = await safeFetchJson(`${BASE_URL}/coupons/shop/${shopId}`);
    if (res._fallback) {
      return JSON.parse(localStorage.getItem('std_demo_coupons') || JSON.stringify(DEFAULT_COUPONS));
    }
    return res;
  },

  async applyCoupon(shopId, code, orderTotal) {
    const res = await safeFetchJson(`${BASE_URL}/coupons/apply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ shopId, code, orderTotal }),
    });
    if (res._fallback) {
      const coupons = JSON.parse(localStorage.getItem('std_demo_coupons') || JSON.stringify(DEFAULT_COUPONS));
      const matched = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && (c.isActive !== false));
      if (!matched && code.toUpperCase() !== 'WELCOME50' && code.toUpperCase() !== 'SUPER10') {
        throw new Error('Invalid or expired coupon code');
      }
      let discountAmount = 50;
      if (matched) {
        if (matched.minOrderAmount && orderTotal < matched.minOrderAmount) {
          throw new Error(`Minimum order of ₹${matched.minOrderAmount} required for this coupon`);
        }
        discountAmount = matched.discountType === 'percentage'
          ? Math.round((orderTotal * matched.discountValue) / 100)
          : matched.discountValue;
        if (matched.maxDiscount && discountAmount > matched.maxDiscount) {
          discountAmount = matched.maxDiscount;
        }
      }
      discountAmount = Math.min(discountAmount, orderTotal);
      return {
        code: code.toUpperCase(),
        discountAmount,
        finalAmount: orderTotal - discountAmount,
      };
    }
    return res;
  },

  async deleteCoupon(couponId) {
    const res = await safeFetchJson(`${BASE_URL}/coupons/${couponId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res._fallback) {
      let coupons = JSON.parse(localStorage.getItem('std_demo_coupons') || JSON.stringify(DEFAULT_COUPONS));
      coupons = coupons.filter((c) => c.id !== couponId);
      localStorage.setItem('std_demo_coupons', JSON.stringify(coupons));
      return { message: 'Deleted' };
    }
    return res;
  },
};
