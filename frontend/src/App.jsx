import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Store,
  MapPin,
  Search,
  Plus,
  Minus,
  Check,
  X,
  Truck,
  Package,
  Layers,
  Tag,
  LogOut,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Phone,
  Lock,
  User,
  Clock,
  Sparkles,
  Milk,
  Apple,
  Pill,
  Coffee,
  CheckCircle2,
  Trash2,
  Edit3,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { api } from './api';

const PRODUCT_CATEGORIES = [
  { id: 'all', label: 'All Items', icon: Sparkles },
  { id: 'grocery', label: 'Kirana & Grocery', icon: ShoppingBag },
  { id: 'dairy', label: 'Milk & Dairy', icon: Milk },
  { id: 'fruits_vegetables', label: 'Fresh Fruits & Veggies', icon: Apple },
  { id: 'pharmacy', label: 'Pharmacy & Care', icon: Pill },
  { id: 'snacks', label: 'Snacks & Drinks', icon: Coffee },
];

export default function App() {
  // Session State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('std_user');
      const token = localStorage.getItem('std_token');
      if (saved && token) return JSON.parse(saved);
      return null;
    } catch {
      return null;
    }
  });

  // Auth Gate State
  const [selectedRole, setSelectedRole] = useState(null); // 'customer' | 'dukandar' | null
  const [authStep, setAuthStep] = useState('phone'); // 'phone' | 'password' | 'register'
  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [shopNameInput, setShopNameInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Customer Portal State
  const [nearbyShops, setNearbyShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerTab, setCustomerTab] = useState('shop'); // 'shop' | 'orders'
  const [customerOrders, setCustomerOrders] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('Flat 402, Green Valley Apartments, Main Road');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Dukandar Portal State
  const [dukandarTab, setDukandarTab] = useState('dispatch'); // 'dispatch' | 'inventory' | 'combos' | 'coupons'
  const [dukandarShop, setDukandarShop] = useState(null);
  const [dukandarOrders, setDukandarOrders] = useState([]);
  const [myInventory, setMyInventory] = useState([]);
  const [myCombos, setMyCombos] = useState([]);
  const [myCoupons, setMyCoupons] = useState([]);
  const [otpInputs, setOtpInputs] = useState({});
  const [otpErrors, setOtpErrors] = useState({});
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'grocery',
    price: '',
    mrp: '',
    stock: 100,
    unit: 'packet',
  });
  const [isAddComboOpen, setIsAddComboOpen] = useState(false);
  const [newCombo, setNewCombo] = useState({
    title: '',
    description: '',
    originalPrice: '',
    offerPrice: '',
    items: '',
  });

  // Global Toast Notification
  const [toast, setToast] = useState('');
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Sync session unauthorized
  useEffect(() => {
    const handleUnauthorized = () => {
      setCurrentUser(null);
      setSelectedRole(null);
      setAuthStep('phone');
      showToast('Session expired. Please sign in again.');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Customer data loading
  useEffect(() => {
    if (currentUser?.role === 'customer') {
      loadNearbyShops();
      loadCustomerOrders();
    }
  }, [currentUser]);

  // Load shop products when selected shop changes
  useEffect(() => {
    if (currentUser?.role === 'customer' && selectedShop) {
      loadProducts(selectedShop.id || selectedShop._id);
    }
  }, [currentUser, selectedShop]);

  // Dukandar data loading
  useEffect(() => {
    if (currentUser?.role === 'dukandar') {
      loadDukandarData();
    }
  }, [currentUser]);

  // === DATA FETCHING METHODS ===
  const loadNearbyShops = async () => {
    try {
      const shops = await api.getNearbyShops(77.209, 28.6139);
      setNearbyShops(shops);
      if (shops.length > 0 && !selectedShop) {
        setSelectedShop(shops[0]);
      }
    } catch {
      // Fallback handles automatically
    }
  };

  const loadProducts = async (shopId) => {
    try {
      const data = await api.getProducts(shopId, selectedCategory);
      setProducts(data);
    } catch {
      setProducts([]);
    }
  };

  const loadCustomerOrders = async () => {
    try {
      const orders = await api.getMyOrders();
      setCustomerOrders(orders);
    } catch {
      setCustomerOrders([]);
    }
  };

  const loadDukandarData = async () => {
    try {
      const shop = await api.getMyShop();
      setDukandarShop(shop);
      const [orders, inv, combos, coupons] = await Promise.all([
        api.getDukandarOrders(),
        api.getMyProducts(),
        api.getMyCombos(),
        api.getMyCoupons(),
      ]);
      setDukandarOrders(orders);
      setMyInventory(inv);
      setMyCombos(combos);
      setMyCoupons(coupons);
    } catch (e) {
      console.error(e);
    }
  };

  // === AUTHENTICATION LOGIC (PASSPORT JWT ENGINE) ===
  const handleCheckPhone = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!phoneInput || phoneInput.length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await api.checkPhone(phoneInput);
      if (res.exists) {
        setAuthStep('password');
      } else {
        setAuthStep('register');
      }
    } catch (err) {
      setAuthError(err.message || 'Unable to verify number');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!passwordInput) {
      setAuthError('Password is required');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await api.login({
        phone: phoneInput,
        password: passwordInput,
      });

      if (res.user && res.tokens?.access?.token) {
        // Enforce persona selected role
        const user = { ...res.user, role: selectedRole || res.user.role || 'customer' };
        localStorage.setItem('std_user', JSON.stringify(user));
        localStorage.setItem('std_token', res.tokens.access.token);
        setCurrentUser(user);
        showToast(`Welcome back, ${user.name}!`);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please check your password.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!nameInput || !passwordInput) {
      setAuthError('Please fill in your name and password');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await api.register({
        name: nameInput,
        phone: phoneInput,
        password: passwordInput,
        role: selectedRole || 'customer',
        shopName: selectedRole === 'dukandar' ? (shopNameInput || `${nameInput}'s Store`) : '',
      });

      if (res.user && res.tokens?.access?.token) {
        const user = { ...res.user, role: selectedRole || res.user.role || 'customer' };
        localStorage.setItem('std_user', JSON.stringify(user));
        localStorage.setItem('std_token', res.tokens.access.token);
        setCurrentUser(user);
        showToast(`Account created successfully! Welcome, ${user.name}!`);
      } else {
        throw new Error('Registration failed');
      }
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setSelectedRole(null);
    setAuthStep('phone');
    setPhoneInput('');
    setPasswordInput('');
    setNameInput('');
    setCart({});
    showToast('Signed out successfully');
  };

  // === CART MANAGEMENT ===
  const addToCart = (product) => {
    setCart((prev) => {
      const currentQty = prev[product.id || product._id]?.quantity || 0;
      return {
        ...prev,
        [product.id || product._id]: {
          product,
          quantity: currentQty + 1,
        },
      };
    });
    showToast(`Added ${product.name} to cart`);
  };

  const updateCartQuantity = (productId, delta) => {
    setCart((prev) => {
      const item = prev[productId];
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return {
        ...prev,
        [productId]: {
          ...item,
          quantity: newQty,
        },
      };
    });
  };

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0 || !selectedShop) return;
    setIsPlacingOrder(true);
    try {
      const orderPayload = {
        shopId: selectedShop.id || selectedShop._id,
        items: cartItems.map((item) => ({
          productId: item.product.id || item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          unit: item.product.unit || 'unit',
        })),
        totalAmount: cartTotal,
        deliveryAddress,
      };

      const newOrder = await api.createOrder(orderPayload);
      setCart({});
      setIsCartOpen(false);
      await loadCustomerOrders();
      setCustomerTab('orders');
      showToast(`Order #${newOrder.orderNumber || newOrder.id?.slice(-6)} placed! OTP: ${newOrder.deliveryOtp}`);
    } catch (err) {
      showToast(err.message || 'Checkout failed');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // === DUKANDAR DISPATCH ACTIONS ===
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await loadDukandarData();
      showToast(`Order status updated to ${newStatus}`);
    } catch (err) {
      showToast(err.message || 'Status update failed');
    }
  };

  const handleVerifyOtp = async (orderId) => {
    const otp = otpInputs[orderId];
    if (!otp || otp.length !== 4) {
      setOtpErrors((prev) => ({ ...prev, [orderId]: 'Enter 4-digit OTP' }));
      return;
    }

    try {
      await api.verifyDeliveryOtp(orderId, otp);
      setOtpErrors((prev) => ({ ...prev, [orderId]: '' }));
      setOtpInputs((prev) => ({ ...prev, [orderId]: '' }));
      await loadDukandarData();
      showToast('Delivery OTP verified! Order successfully completed.');
    } catch (err) {
      setOtpErrors((prev) => ({ ...prev, [orderId]: err.message || 'Invalid OTP' }));
    }
  };

  // === DUKANDAR INVENTORY ACTIONS ===
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    try {
      await api.createProduct({
        ...newProduct,
        price: parseFloat(newProduct.price),
        mrp: parseFloat(newProduct.mrp || newProduct.price),
        stock: parseInt(newProduct.stock || 100),
      });
      setIsAddProductOpen(false);
      setNewProduct({ name: '', category: 'grocery', price: '', mrp: '', stock: 100, unit: 'packet' });
      await loadDukandarData();
      showToast('Product added to your inventory!');
    } catch (err) {
      showToast(err.message || 'Failed to add product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(productId);
      await loadDukandarData();
      showToast('Product removed');
    } catch (err) {
      showToast(err.message || 'Delete failed');
    }
  };

  // Filtered products for customer
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-medium border border-slate-800"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          VIEW 1: CLEAN CLAUDE-STYLE WELCOME GATE (CUSTOMER vs DUKANDAR)
         ========================================================================= */}
      {!currentUser && (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-white to-slate-50">
          <div className="w-full max-w-md">
            {/* Minimal Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white mb-4 shadow-sm">
                <Store className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Shop to Door</h1>
              <p className="text-sm text-slate-700 mt-1">Hyperlocal delivery in your neighbourhood</p>
            </div>

            {/* STEP 1: Select Persona (Customer vs Dukandar) */}
            {!selectedRole ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('customer');
                    setAuthStep('phone');
                    setAuthError('');
                  }}
                  className="w-full p-5 bg-white border border-slate-200 hover:border-slate-400 rounded-2xl text-left transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-200">
                      <ShoppingBag className="w-6 h-6 stroke-[1.75]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Customer</h3>
                      <p className="text-xs text-slate-600 mt-0.5">Order fresh grocery & essentials in 15 mins</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('dukandar');
                    setAuthStep('phone');
                    setAuthError('');
                  }}
                  className="w-full p-5 bg-white border border-slate-200 hover:border-slate-400 rounded-2xl text-left transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-200">
                      <Store className="w-6 h-6 stroke-[1.75]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Dukandar</h3>
                      <p className="text-xs text-slate-600 mt-0.5">Manage inventory, combos & live dispatch queue</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </button>

                <div className="mt-8 text-center text-xs text-slate-600 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Powered by Cloned Secure Passport-JWT Backend</span>
                </div>
              </motion.div>
            ) : (
              /* STEP 2: Pure Minimal Input Form */
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm"
              >
                {/* Back to Persona selection */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                      {selectedRole === 'customer' ? (
                        <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
                      ) : (
                        <Store className="w-4 h-4 stroke-[1.75]" />
                      )}
                    </div>
                    <span className="font-semibold text-sm capitalize text-slate-900">
                      {selectedRole} Portal
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole(null);
                      setAuthStep('phone');
                      setAuthError('');
                    }}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                  >
                    Change role
                  </button>
                </div>

                {/* Error Banner */}
                {authError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Sub-step: Phone Input */}
                {authStep === 'phone' && (
                  <form onSubmit={handleCheckPhone} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          maxLength={10}
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 9876543210"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl text-sm font-medium outline-none transition-all"
                          autoFocus
                          required
                        />
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1.5">
                        We will check if your account already exists in the system.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading || phoneInput.length < 10}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      {authLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Continue</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Sub-step: Existing Account -> Password Login */}
                {authStep === 'password' && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-mono">+91 {phoneInput}</span>
                      <button
                        type="button"
                        onClick={() => setAuthStep('phone')}
                        className="text-slate-900 font-medium hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Account Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl text-sm font-medium outline-none transition-all"
                          autoFocus
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      {authLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>Sign In</span>
                      )}
                    </button>
                  </form>
                )}

                {/* Sub-step: New User -> Create Account */}
                {authStep === 'register' && (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-mono">+91 {phoneInput}</span>
                      <button
                        type="button"
                        onClick={() => setAuthStep('phone')}
                        className="text-slate-900 font-medium hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          placeholder="e.g. Ramesh Sharma"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl text-sm font-medium outline-none transition-all"
                          autoFocus
                          required
                        />
                      </div>
                    </div>

                    {selectedRole === 'dukandar' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                          Shop / Store Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Store className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            value={shopNameInput}
                            onChange={(e) => setShopNameInput(e.target.value)}
                            placeholder="e.g. Sharma General Store"
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl text-sm font-medium outline-none transition-all"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Create Password (min 8 chars, 1 letter + 1 number)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="Create strong password"
                          className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl text-sm font-medium outline-none transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      {authLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>Create Account</span>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: CUSTOMER STOREFRONT PORTAL
         ========================================================================= */}
      {currentUser && currentUser.role === 'customer' && (
        <div className="min-h-screen flex flex-col">
          {/* Top Navbar */}
          <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <h1 className="text-base font-semibold leading-tight text-slate-900">Shop to Door</h1>
                  <div className="flex items-center gap-1 text-[11px] text-slate-600">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span>Operating Radius: 3.5 km</span>
                  </div>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setCustomerTab('shop')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    customerTab === 'shop'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Storefront
                </button>

                <button
                  type="button"
                  onClick={() => setCustomerTab('orders')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer relative ${
                    customerTab === 'orders'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>My Orders</span>
                  {customerOrders.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-semibold">
                      {customerOrders.length}
                    </span>
                  )}
                </button>

                {/* Cart Button */}
                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
                  <span className="font-semibold">{cartItems.length}</span>
                </button>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
            {/* VIEW A: Storefront Tab */}
            {customerTab === 'shop' && (
              <div className="space-y-6">
                {/* Multi-Shop Discovery Banner (Rule from prompt: when 2+ shops in radius) */}
                {nearbyShops.length > 1 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-slate-700" />
                      <span>{nearbyShops.length} Shops within your delivery radius:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {nearbyShops.map((s) => {
                        const isSelected = (selectedShop?.id || selectedShop?._id) === (s.id || s._id);
                        return (
                          <button
                            key={s.id || s._id}
                            type="button"
                            onClick={() => setSelectedShop(s)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                                : 'border-slate-200 bg-slate-50 hover:border-slate-300 text-slate-900'
                            }`}
                          >
                            <div className="font-semibold text-sm truncate">{s.shopName || s.name}</div>
                            <div className={`text-xs mt-0.5 truncate ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                              {s.description || 'Verified Local Merchant'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Active Shop Info Bar & Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
                      {selectedShop?.shopName || selectedShop?.name || 'Local Store'}
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Deliveries directly by this merchant to your doorstep
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-slate-900 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {PRODUCT_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 stroke-[1.75]" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8">
                    <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-slate-700">No items available in this category</h3>
                    <p className="text-xs text-slate-600 mt-1">Try selecting 'All Items' or choose another shop.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map((p) => {
                      const pId = p.id || p._id;
                      const inCartQty = cart[pId]?.quantity || 0;
                      return (
                        <motion.div
                          key={pId}
                          whileHover={{ y: -2 }}
                          className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div>
                            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                              {p.category || 'General'}
                            </span>
                            <h4 className="font-semibold text-sm text-slate-900 leading-snug">{p.name}</h4>
                            <span className="text-xs text-slate-600 mt-1 block">
                              Unit: {p.unit || '1 unit'}
                            </span>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              <div className="text-base font-bold text-slate-900">₹{p.price}</div>
                              {p.mrp > p.price && (
                                <div className="text-[11px] text-slate-600 line-through">₹{p.mrp}</div>
                              )}
                            </div>

                            {/* Add to cart stepper */}
                            {inCartQty === 0 ? (
                              <button
                                type="button"
                                onClick={() => addToCart(p)}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-transform"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[2]" />
                                <span>Add</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1 border border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(pId, -1)}
                                  className="w-6 h-6 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-5 text-center text-xs font-bold text-slate-900">
                                  {inCartQty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(pId, 1)}
                                  className="w-6 h-6 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VIEW B: Customer Orders Tab */}
            {customerTab === 'orders' && (
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">Your Order History</h2>
                  <button
                    type="button"
                    onClick={loadCustomerOrders}
                    className="p-2 text-slate-400 hover:text-slate-900 rounded-xl cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {customerOrders.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8">
                    <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-slate-700">No orders placed yet</h3>
                    <p className="text-xs text-slate-600 mt-1">Start shopping from verified stores in your area.</p>
                  </div>
                ) : (
                  customerOrders.map((ord) => (
                    <div
                      key={ord.id || ord._id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-mono text-slate-600">
                            #{ord.orderNumber || ord.id?.slice(-8)}
                          </span>
                          <h4 className="font-semibold text-sm text-slate-900">
                            {ord.shopId?.shopName || ord.shop?.shopName || 'Local Merchant'}
                          </h4>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : ord.status === 'out_for_delivery'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {ord.status?.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Items List */}
                      <div className="text-xs text-slate-600 space-y-1">
                        {ord.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Total & Prominent 4-digit OTP Box */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-slate-600 block">Total Amount</span>
                          <span className="text-sm font-bold text-slate-900">₹{ord.totalAmount}</span>
                        </div>

                        {ord.status !== 'delivered' && (
                          <div className="bg-slate-900 text-white px-3.5 py-2 rounded-xl text-center shadow-sm">
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">
                              Delivery OTP
                            </span>
                            <span className="text-base font-mono font-bold tracking-widest text-amber-300">
                              {ord.deliveryOtp}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </main>

          {/* Customer Cart Drawer */}
          <AnimatePresence>
            {isCartOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsCartOpen(false)}
                  className="fixed inset-0 bg-slate-900/30 z-50 backdrop-blur-none"
                />
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 right-0 max-w-md w-full bg-white z-50 border-l border-slate-200 shadow-2xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-slate-900" />
                        <h3 className="font-semibold text-base text-slate-900">Shopping Cart</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCartOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Cart Items */}
                    <div className="mt-4 space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                      {cartItems.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 text-sm">
                          Your shopping cart is empty.
                        </div>
                      ) : (
                        cartItems.map((item) => {
                          const pId = item.product.id || item.product._id;
                          return (
                            <div
                              key={pId}
                              className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                            >
                              <div>
                                <h4 className="font-semibold text-xs text-slate-900">{item.product.name}</h4>
                                <span className="text-[11px] text-slate-600">₹{item.product.price} each</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(pId, -1)}
                                  className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-xs text-slate-700"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(pId, 1)}
                                  className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-xs text-slate-700"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Delivery Address Input */}
                    {cartItems.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                          Delivery Doorstep Address
                        </label>
                        <textarea
                          rows={2}
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-slate-900 outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Checkout Footer */}
                  {cartItems.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">Total Payable</span>
                        <span className="text-lg font-bold text-slate-900">₹{cartTotal}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCheckout}
                        disabled={isPlacingOrder}
                        className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        {isPlacingOrder ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Place Order Now</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: DUKANDAR MERCHANT HUB PORTAL
         ========================================================================= */}
      {currentUser && currentUser.role === 'dukandar' && (
        <div className="min-h-screen flex flex-col">
          {/* Top Navbar */}
          <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <Store className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <h1 className="text-base font-semibold leading-tight text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                    {dukandarShop?.shopName || 'Dukan Dashboard'}
                  </h1>
                  <span className="text-[11px] text-emerald-600 font-medium">Store Live & Accepting Orders</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadDukandarData}
                  title="Refresh"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Navigation Tabs */}
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 flex items-center gap-2 overflow-x-auto scrollbar-none py-2">
              {[
                { id: 'dispatch', label: 'Live Orders Queue', icon: Truck, count: dukandarOrders.length },
                { id: 'inventory', label: 'Inventory Catalog', icon: Package, count: myInventory.length },
                { id: 'combos', label: 'Combo Deals', icon: Layers, count: myCombos.length },
                { id: 'coupons', label: 'Store Coupons', icon: Tag, count: myCoupons.length },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = dukandarTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDukandarTab(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 shrink-0 transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[1.75]" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Merchant Content */}
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
            {/* TAB 1: LIVE ORDERS QUEUE */}
            {dukandarTab === 'dispatch' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">
                    Active Customer Orders ({dukandarOrders.length})
                  </h2>
                </div>

                {dukandarOrders.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8">
                    <Truck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-slate-700">No active customer orders right now</h3>
                    <p className="text-xs text-slate-600 mt-1">New orders placed by nearby customers will instantly appear here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dukandarOrders.map((ord) => {
                      const oId = ord.id || ord._id;
                      const isDelivered = ord.status === 'delivered';
                      return (
                        <div
                          key={oId}
                          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                              <div>
                                <span className="text-[11px] font-mono text-slate-600">
                                  #{ord.orderNumber || oId.slice(-8)}
                                </span>
                                <h4 className="font-semibold text-sm text-slate-900">
                                  Customer: {ord.customerName || ord.customerPhone || 'Verified Customer'}
                                </h4>
                              </div>
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                  isDelivered
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {ord.status?.replace(/_/g, ' ')}
                              </span>
                            </div>

                            {/* Item Breakdown */}
                            <div className="mt-3 text-xs text-slate-600 space-y-1">
                              {ord.items?.map((it, idx) => (
                                <div key={idx} className="flex justify-between">
                                  <span>
                                    {it.quantity}x {it.name}
                                  </span>
                                  <span>₹{it.price * it.quantity}</span>
                                </div>
                              ))}
                            </div>

                            <div className="mt-3 text-xs text-slate-700 font-medium">
                              Address: {ord.deliveryAddress || 'Doorstep Delivery'}
                            </div>
                          </div>

                          {/* Verification and Dispatch Controls */}
                          <div className="pt-3 border-t border-slate-100 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600 font-medium text-xs">Total Bill</span>
                              <span className="font-bold text-slate-900">₹{ord.totalAmount}</span>
                            </div>

                            {!isDelivered ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    maxLength={4}
                                    placeholder="Enter 4-digit OTP"
                                    value={otpInputs[oId] || ''}
                                    onChange={(e) =>
                                      setOtpInputs((prev) => ({
                                        ...prev,
                                        [oId]: e.target.value.replace(/\D/g, ''),
                                      }))
                                    }
                                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-xl text-xs font-mono font-bold tracking-widest text-center outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleVerifyOtp(oId)}
                                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Verify & Deliver</span>
                                  </button>
                                </div>
                                {otpErrors[oId] && (
                                  <p className="text-[11px] text-red-600 font-medium">{otpErrors[oId]}</p>
                                )}
                              </div>
                            ) : (
                              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Delivered with OTP Verification</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: INVENTORY CATALOG */}
            {dukandarTab === 'inventory' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">
                      Store Inventory ({myInventory.length})
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Only you can edit and manage items in your catalog
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(true)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                {myInventory.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8">
                    <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-slate-700">Inventory is empty</h3>
                    <p className="text-xs text-slate-600 mt-1">Click 'Add Item' to start listing your shop's products.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {myInventory.map((item) => {
                      const pId = item.id || item._id;
                      return (
                        <div
                          key={pId}
                          className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm space-y-3"
                        >
                          <div>
                            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                              {item.category}
                            </span>
                            <h4 className="font-semibold text-sm text-slate-900">{item.name}</h4>
                            <span className="text-xs text-slate-600 mt-1 block">Unit: {item.unit}</span>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              <span className="text-base font-bold text-slate-900">₹{item.price}</span>
                              {item.mrp > item.price && (
                                <span className="text-[11px] text-slate-600 line-through ml-1.5">₹{item.mrp}</span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(pId)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: COMBOS */}
            {dukandarTab === 'combos' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">
                      Combo Deals ({myCombos.length})
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">Bundle multiple items together at a special price</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddComboOpen(true)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Combo</span>
                  </button>
                </div>

                {myCombos.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8">
                    <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-slate-700">No combo deals created yet</h3>
                    <p className="text-xs text-slate-600 mt-1">Create attractive bundles to boost your average order value.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {myCombos.map((combo) => (
                      <div
                        key={combo.id || combo._id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3"
                      >
                        <h4 className="font-semibold text-sm text-slate-900">{combo.title}</h4>
                        <p className="text-xs text-slate-600">{combo.description || 'Bundle Saver Deal'}</p>
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-base font-bold text-slate-900">₹{combo.offerPrice}</span>
                            <span className="text-xs text-slate-600 line-through ml-1.5">₹{combo.originalPrice}</span>
                          </div>
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Save ₹{combo.originalPrice - combo.offerPrice}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: COUPONS */}
            {dukandarTab === 'coupons' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">
                      Store Coupons ({myCoupons.length})
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">Offer discount codes to your local customers</p>
                  </div>
                </div>

                {myCoupons.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8">
                    <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-slate-700">No active store coupons</h3>
                    <p className="text-xs text-slate-600 mt-1">Create promotional codes for special discounts.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {myCoupons.map((coup) => (
                      <div
                        key={coup.id || coup._id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2"
                      >
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold inline-block">
                          {coup.code}
                        </span>
                        <p className="text-xs text-slate-700 font-medium">
                          {coup.discountPercent}% OFF on orders above ₹{coup.minOrderAmount}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Modal: Add New Product */}
          <AnimatePresence>
            {isAddProductOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-xl"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <h3 className="font-semibold text-base text-slate-900">Add Item to Inventory</h3>
                    <button
                      type="button"
                      onClick={() => setIsAddProductOpen(false)}
                      className="text-slate-400 hover:text-slate-700 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateProduct} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Item Name</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="e.g. Aashirvaad Atta 5kg"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-slate-900"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                        <select
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                        >
                          <option value="grocery">Kirana & Grocery</option>
                          <option value="dairy">Milk & Dairy</option>
                          <option value="fruits_vegetables">Fruits & Vegetables</option>
                          <option value="pharmacy">Pharmacy & Health</option>
                          <option value="snacks">Snacks & Beverages</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Unit</label>
                        <input
                          type="text"
                          value={newProduct.unit}
                          onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                          placeholder="kg, packet, piece"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Selling Price (₹)</label>
                        <input
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          placeholder="245"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-slate-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">MRP Price (₹)</label>
                        <input
                          type="number"
                          value={newProduct.mrp}
                          onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })}
                          placeholder="270"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-slate-900"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Save to Inventory
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
