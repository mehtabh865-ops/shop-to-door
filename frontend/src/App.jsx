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
  Settings,
  Percent,
  Flame,
  BadgePercent,
  Power,
  Sliders,
} from 'lucide-react';
import { api } from './api';

const DUKANDAR_CATEGORIES = [
  { id: 'grocery', label: 'Kirana & Grocery', icon: ShoppingBag },
  { id: 'dairy', label: 'Milk & Dairy', icon: Milk },
  { id: 'fruits_vegetables', label: 'Fruits & Veggies', icon: Apple },
  { id: 'spices', label: 'Spices & Masala', icon: Sparkles },
  { id: 'snacks', label: 'Snacks & Beverages', icon: Coffee },
  { id: 'pharmacy', label: 'Pharmacy & Care', icon: Pill },
  { id: 'bakery', label: 'Bakery & Bread', icon: Package },
  { id: 'personal_care', label: 'Personal & Hygiene', icon: Sparkles },
  { id: 'household', label: 'Cleaning & Household', icon: Package },
  { id: 'general', label: 'General Goods', icon: Store },
];

const UNIT_OPTIONS = ['packet', 'kg', 'gm', 'liter', 'ml', 'piece', 'box', 'strip', 'bottle', 'dozen'];

export default function App() {
  // === SESSION & AUTH ===
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

  const [selectedRole, setSelectedRole] = useState(null); // 'customer' | 'dukandar'
  const [authStep, setAuthStep] = useState('phone'); // 'phone' | 'password' | 'register'
  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [shopNameInput, setShopNameInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // === CUSTOMER STATE ===
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

  // === DUKANDAR MERCHANT STATE ===
  const [dukandarTab, setDukandarTab] = useState('dispatch'); // 'dispatch' | 'inventory' | 'combos' | 'coupons' | 'settings'
  const [dukandarShop, setDukandarShop] = useState(null);
  const [dukandarOrders, setDukandarOrders] = useState([]);
  const [myInventory, setMyInventory] = useState([]);
  const [myCombos, setMyCombos] = useState([]);
  const [myCoupons, setMyCoupons] = useState([]);
  const [invSearch, setInvSearch] = useState('');
  const [invCategoryFilter, setInvCategoryFilter] = useState('all');

  // OTP State
  const [otpInputs, setOtpInputs] = useState({});
  const [otpErrors, setOtpErrors] = useState({});

  // Product Modals
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'grocery',
    price: '',
    mrp: '',
    stock: 100,
    unit: 'packet',
    offerBadge: '',
    isAvailable: true,
  });

  // Combo Modal
  const [isAddComboOpen, setIsAddComboOpen] = useState(false);
  const [comboForm, setComboForm] = useState({
    title: '',
    description: '',
    items: '',
    originalPrice: '',
    offerPrice: '',
  });

  // Coupon Modal
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountPercent: '',
    minOrderAmount: '',
    maxDiscount: '100',
  });

  // Shop Settings State
  const [settingsForm, setSettingsForm] = useState({
    shopName: '',
    description: '',
    phone: '',
    address: '',
    deliveryRadiusKm: 5,
    isOpen: true,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Global Toast
  const [toast, setToast] = useState('');
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Sync session expiration
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

  // Customer Data Loading
  useEffect(() => {
    if (currentUser?.role === 'customer') {
      loadNearbyShops();
      loadCustomerOrders();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.role === 'customer' && selectedShop) {
      loadProducts(selectedShop.id || selectedShop._id);
    }
  }, [currentUser, selectedShop]);

  // Dukandar Data Loading
  useEffect(() => {
    if (currentUser?.role === 'dukandar') {
      loadDukandarData();
    }
  }, [currentUser]);

  // === DATA FETCHERS ===
  const loadNearbyShops = async () => {
    try {
      const shops = await api.getNearbyShops(77.209, 28.6139);
      setNearbyShops(shops);
      if (shops.length > 0 && !selectedShop) {
        setSelectedShop(shops[0]);
      }
    } catch {
      // Handled by api fallback
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
      if (shop) {
        setSettingsForm({
          shopName: shop.shopName || shop.name || '',
          description: shop.description || '',
          phone: shop.phone || '',
          address: shop.address || '',
          deliveryRadiusKm: shop.deliveryRadiusKm || 5,
          isOpen: shop.isOpen !== undefined ? shop.isOpen : true,
        });
      }

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

  // === AUTHENTICATION ACTIONS ===
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
        const user = { ...res.user, role: selectedRole || res.user.role || 'customer' };
        localStorage.setItem('std_user', JSON.stringify(user));
        localStorage.setItem('std_token', res.tokens.access.token);
        setCurrentUser(user);
        showToast(`Welcome back, ${user.name}!`);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      setAuthError(err.message || 'Login failed. Check your password.');
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
        showToast(`Account created! Welcome, ${user.name}!`);
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

  // === CUSTOMER CART ACTIONS ===
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
    showToast(`Added ${product.name}`);
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
      showToast(`Order placed! Secret Delivery OTP: ${newOrder.deliveryOtp}`);
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
      showToast(`Status updated to ${newStatus}`);
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
      showToast('Delivery OTP verified! Order delivered.');
    } catch (err) {
      setOtpErrors((prev) => ({ ...prev, [orderId]: err.message || 'Invalid OTP' }));
    }
  };

  // === DUKANDAR INVENTORY CRUD ===
  const handleOpenAddProduct = () => {
    setProductForm({
      name: '',
      category: 'grocery',
      price: '',
      mrp: '',
      stock: 100,
      unit: 'packet',
      offerBadge: '',
      isAvailable: true,
    });
    setIsAddProductOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProductId(prod.id || prod._id);
    setProductForm({
      name: prod.name,
      category: prod.category || 'grocery',
      price: prod.price,
      mrp: prod.mrp || prod.price,
      stock: prod.stock !== undefined ? prod.stock : 100,
      unit: prod.unit || 'packet',
      offerBadge: prod.offerBadge || '',
      isAvailable: prod.isAvailable !== undefined ? prod.isAvailable : true,
    });
    setIsEditProductOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) return;
    try {
      const payload = {
        name: productForm.name,
        category: productForm.category,
        price: parseFloat(productForm.price),
        mrp: parseFloat(productForm.mrp || productForm.price),
        stock: parseInt(productForm.stock || 100),
        unit: productForm.unit,
        offerBadge: productForm.offerBadge,
        isAvailable: productForm.isAvailable,
      };

      if (isEditProductOpen && editingProductId) {
        await api.updateProduct(editingProductId, payload);
        setIsEditProductOpen(false);
        setEditingProductId(null);
        showToast('Product updated successfully!');
      } else {
        await api.createProduct(payload);
        setIsAddProductOpen(false);
        showToast('New item added to your inventory!');
      }

      await loadDukandarData();
    } catch (err) {
      showToast(err.message || 'Failed to save product');
    }
  };

  const handleToggleProductAvailability = async (prod) => {
    const pId = prod.id || prod._id;
    try {
      await api.updateProduct(pId, { isAvailable: !prod.isAvailable });
      await loadDukandarData();
      showToast(prod.isAvailable ? 'Marked out of stock' : 'Marked in stock');
    } catch (err) {
      showToast(err.message || 'Update failed');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(productId);
      await loadDukandarData();
      showToast('Product deleted from inventory');
    } catch (err) {
      showToast(err.message || 'Delete failed');
    }
  };

  // Quick 1-Click Template Add for Dukandar
  const handleQuickAddTemplate = async (template) => {
    try {
      await api.createProduct(template);
      await loadDukandarData();
      showToast(`Added ${template.name} to inventory!`);
    } catch (err) {
      showToast(err.message || 'Add failed');
    }
  };

  // === DUKANDAR COMBO BUILDER CRUD ===
  const handleSaveCombo = async (e) => {
    e.preventDefault();
    if (!comboForm.title || !comboForm.offerPrice || !comboForm.originalPrice) return;
    try {
      const itemsList = comboForm.items
        ? comboForm.items.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      await api.createCombo({
        title: comboForm.title,
        description: comboForm.description,
        items: itemsList,
        originalPrice: parseFloat(comboForm.originalPrice),
        offerPrice: parseFloat(comboForm.offerPrice),
        isActive: true,
      });

      setIsAddComboOpen(false);
      setComboForm({ title: '', description: '', items: '', originalPrice: '', offerPrice: '' });
      await loadDukandarData();
      showToast('Combo deal created successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to create combo');
    }
  };

  const handleDeleteCombo = async (comboId) => {
    if (!window.confirm('Delete this combo offer?')) return;
    try {
      await api.deleteCombo(comboId);
      await loadDukandarData();
      showToast('Combo deal removed');
    } catch (err) {
      showToast(err.message || 'Delete failed');
    }
  };

  // === DUKANDAR COUPON CRUD ===
  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.discountPercent) return;
    try {
      await api.createCoupon({
        code: couponForm.code.toUpperCase().trim(),
        discountPercent: parseFloat(couponForm.discountPercent),
        minOrderAmount: parseFloat(couponForm.minOrderAmount || 0),
        maxDiscount: parseFloat(couponForm.maxDiscount || 100),
        isActive: true,
      });

      setIsAddCouponOpen(false);
      setCouponForm({ code: '', discountPercent: '', minOrderAmount: '', maxDiscount: '100' });
      await loadDukandarData();
      showToast(`Coupon ${couponForm.code} created!`);
    } catch (err) {
      showToast(err.message || 'Failed to create coupon');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Delete this coupon code?')) return;
    try {
      await api.deleteCoupon(couponId);
      await loadDukandarData();
      showToast('Coupon removed');
    } catch (err) {
      showToast(err.message || 'Delete failed');
    }
  };

  // === DUKANDAR SHOP PROFILE & RADIUS SETTINGS ===
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await api.updateMyShop(settingsForm);
      await loadDukandarData();
      showToast('Shop profile & delivery radius updated!');
    } catch (err) {
      showToast(err.message || 'Failed to update settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Filtered customer products
  const filteredCustomerProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'all' || p.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchesQuery = !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Filtered dukandar inventory
  const filteredMyInventory = useMemo(() => {
    return myInventory.filter((p) => {
      const matchesCat = invCategoryFilter === 'all' || p.category?.toLowerCase() === invCategoryFilter.toLowerCase();
      const matchesQuery = !invSearch || p.name?.toLowerCase().includes(invSearch.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [myInventory, invCategoryFilter, invSearch]);

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
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white mb-4 shadow-sm">
                <Store className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Shop to Door</h1>
              <p className="text-sm text-slate-600 mt-1">Hyperlocal delivery in your neighbourhood</p>
            </div>

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
                      <h3 className="font-semibold text-slate-900">Dukandar Hub</h3>
                      <p className="text-xs text-slate-600 mt-0.5">Inventory, bundle combos, coupons & live dispatch queue</p>
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
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm"
              >
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

                {authError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{authError}</span>
                  </div>
                )}

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
                        We will check if your account exists in the database.
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
                            placeholder="e.g. Sharma Kirana Store"
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl text-sm font-medium outline-none transition-all"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Password (min 8 chars, 1 letter + 1 number)
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

                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
                  <span className="font-semibold">{cartItems.length}</span>
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

          <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
            {customerTab === 'shop' && (
              <div className="space-y-6">
                {nearbyShops.length > 1 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-slate-700" />
                      <span>{nearbyShops.length} Shops delivering to your coordinates:</span>
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

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
                      {selectedShop?.shopName || selectedShop?.name || 'Local Store'}
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Direct delivery by local merchant to your doorstep
                    </p>
                  </div>

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

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {[{ id: 'all', label: 'All Items', icon: Sparkles }, ...DUKANDAR_CATEGORIES].map((cat) => {
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

                {filteredCustomerProducts.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8">
                    <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-slate-700">No items available in this category</h3>
                    <p className="text-xs text-slate-600 mt-1">Try selecting another category or check back soon.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredCustomerProducts.map((p) => {
                      const pId = p.id || p._id;
                      const inCartQty = cart[pId]?.quantity || 0;
                      return (
                        <motion.div
                          key={pId}
                          whileHover={{ y: -2 }}
                          className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                                {p.category || 'General'}
                              </span>
                              {p.offerBadge && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                  {p.offerBadge}
                                </span>
                              )}
                            </div>
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

          {/* Cart Drawer */}
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
          VIEW 3: DUKANDAR MERCHANT HUB PORTAL (COMPREHENSIVE SUITE)
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
                    {dukandarShop?.shopName || dukandarShop?.name || 'My Dukan Hub'}
                  </h1>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                    <span className={`w-2 h-2 rounded-full ${dukandarShop?.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span>{dukandarShop?.isOpen ? 'Store Open & Delivering' : 'Store Temporarily Closed'}</span>
                    <span>• Radius: {dukandarShop?.deliveryRadiusKm || 5} km</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadDukandarData}
                  title="Refresh data"
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
                { id: 'settings', label: 'Shop Settings & Radius', icon: Settings },
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

          {/* MAIN DUKANDAR CONTENT */}
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
            {/* TAB 1: LIVE ORDERS DISPATCH QUEUE */}
            {dukandarTab === 'dispatch' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">
                      Live Dispatch Queue ({dukandarOrders.length})
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Verify doorstep delivery with customer's secret 4-digit OTP
                    </p>
                  </div>
                </div>

                {dukandarOrders.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8">
                    <Truck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-slate-700">No active orders right now</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      New customer orders in your radius will show up here instantly.
                    </p>
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

                            <div className="mt-3 text-xs text-slate-700 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                              <MapPin className="w-3.5 h-3.5 inline text-slate-500 mr-1" />
                              <span>{ord.deliveryAddress || 'Doorstep Delivery'}</span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600 font-medium text-xs">Total Bill Amount</span>
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
                                <span>Delivered & Verified with Secret OTP</span>
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

            {/* TAB 2: INVENTORY CATALOG (FULL CRUD, TEMPLATES & BULK ITEMS) */}
            {dukandarTab === 'inventory' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">
                      Store Inventory ({myInventory.length} products)
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Add, edit, remove products or toggle live in-stock availability
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenAddProduct}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Product</span>
                    </button>
                  </div>
                </div>

                {/* 1-Click Quick Add Template Essentials */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quick 1-Click Add Essentials to Your Shop:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Tata Salt 1kg', category: 'grocery', price: 28, mrp: 30, unit: 'packet', stock: 100 },
                      { name: 'Aashirvaad Atta 5kg', category: 'grocery', price: 245, mrp: 275, unit: 'kg', stock: 50 },
                      { name: 'Amul Milk 1L', category: 'dairy', price: 66, mrp: 72, unit: 'liter', stock: 40 },
                      { name: 'Fortune Mustard Oil 1L', category: 'grocery', price: 155, mrp: 180, unit: 'liter', stock: 30 },
                      { name: 'Fresh Potatoes 1kg', category: 'fruits_vegetables', price: 30, mrp: 35, unit: 'kg', stock: 80 },
                      { name: 'Maggi 2-Minute Noodles', category: 'snacks', price: 14, mrp: 15, unit: 'packet', stock: 120 },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickAddTemplate(item)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-800 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3 h-3 text-slate-500" />
                        <span>{item.name} (₹{item.price})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search & Category Filter */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setInvCategoryFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer shrink-0 ${
                        invCategoryFilter === 'all'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      All ({myInventory.length})
                    </button>
                    {DUKANDAR_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setInvCategoryFilter(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer shrink-0 ${
                          invCategoryFilter === cat.id
                            ? 'bg-slate-900 text-white'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-60">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search inventory..."
                      value={invSearch}
                      onChange={(e) => setInvSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                {/* Inventory Grid */}
                {filteredMyInventory.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8">
                    <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-slate-700">No items match your criteria</h3>
                    <p className="text-xs text-slate-600 mt-1">Add a new item or change your category filter.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredMyInventory.map((item) => {
                      const pId = item.id || item._id;
                      const isAvailable = item.isAvailable !== false;
                      return (
                        <div
                          key={pId}
                          className={`bg-white border rounded-2xl p-4 flex flex-col justify-between shadow-sm space-y-3 transition-all ${
                            isAvailable ? 'border-slate-200' : 'border-red-200 bg-red-50/20 opacity-75'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                                {item.category}
                              </span>
                              {item.offerBadge && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                  {item.offerBadge}
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-sm text-slate-900 leading-snug">{item.name}</h4>
                            <div className="flex items-center justify-between text-xs text-slate-600 mt-1.5">
                              <span>Unit: {item.unit || 'packet'}</span>
                              <span>Stock: {item.stock || 100}</span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-base font-bold text-slate-900">₹{item.price}</span>
                                {item.mrp > item.price && (
                                  <span className="text-[11px] text-slate-600 line-through ml-1.5">₹{item.mrp}</span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggleProductAvailability(item)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-semibold cursor-pointer border ${
                                  isAvailable
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-red-50 text-red-700 border-red-200'
                                }`}
                              >
                                {isAvailable ? 'In Stock' : 'Out of Stock'}
                              </button>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-50">
                              <button
                                type="button"
                                onClick={() => handleOpenEditProduct(item)}
                                className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(pId)}
                                className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 text-xs font-medium flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: COMBO DEALS BUILDER */}
            {dukandarTab === 'combos' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">
                      Combo Deals ({myCombos.length})
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Bundle products together at a special discounted offer price
                    </p>
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
                    <p className="text-xs text-slate-600 mt-1">
                      Bundle popular items together (e.g. Atta + Milk + Butter) at a discounted price!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {myCombos.map((combo) => {
                      const cId = combo.id || combo._id;
                      const savings = Math.max(0, combo.originalPrice - combo.offerPrice);
                      return (
                        <div
                          key={cId}
                          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-sm text-slate-900">{combo.title}</h4>
                              <button
                                type="button"
                                onClick={() => handleDeleteCombo(cId)}
                                className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-xs text-slate-600">{combo.description || 'Bundle Saver Deal'}</p>
                            {combo.items && combo.items.length > 0 && (
                              <div className="mt-2.5 flex flex-wrap gap-1">
                                {combo.items.map((it, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                                  >
                                    {it}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              <span className="text-base font-bold text-slate-900">₹{combo.offerPrice}</span>
                              <span className="text-xs text-slate-600 line-through ml-1.5">₹{combo.originalPrice}</span>
                            </div>
                            {savings > 0 && (
                              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Save ₹{savings}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: STORE COUPONS & DISCOUNTS */}
            {dukandarTab === 'coupons' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">
                      Store Coupons ({myCoupons.length})
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Create percentage discounts and minimum order promotions for your shop
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddCouponOpen(true)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Coupon</span>
                  </button>
                </div>

                {myCoupons.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8">
                    <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-slate-700">No active store coupons</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Create promotional codes like WELCOME50 or SAVEMORE to attract local customers.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {myCoupons.map((coup) => {
                      const cpId = coup.id || coup._id;
                      return (
                        <div
                          key={cpId}
                          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold inline-block">
                                {coup.code}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteCoupon(cpId)}
                                className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-sm font-bold text-slate-900">{coup.discountPercent}% Discount</div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              Valid on orders above ₹{coup.minOrderAmount || 0} (Max ₹{coup.maxDiscount || 100})
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: SHOP PROFILE & RADIUS SETTINGS */}
            {dukandarTab === 'settings' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">Shop Profile & Operating Radius</h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Configure your delivery circle and store details in MongoDB Atlas
                  </p>
                </div>

                <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Shop Name
                    </label>
                    <input
                      type="text"
                      value={settingsForm.shopName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, shopName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-xl text-xs font-medium outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Shop Description
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.description}
                      onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                      placeholder="Fresh grocery & essentials delivered in 15 mins"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-xl text-xs font-medium outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-xl text-xs font-medium outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Store Status
                      </label>
                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, isOpen: !settingsForm.isOpen })}
                        className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                          settingsForm.isOpen
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{settingsForm.isOpen ? 'Open & Accepting Orders' : 'Store Closed'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Delivery Radius Slider Formula */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Circular Operating Radius:</span>
                      </label>
                      <span className="text-sm font-bold text-slate-900">{settingsForm.deliveryRadiusKm} KM</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      step="0.5"
                      value={settingsForm.deliveryRadiusKm}
                      onChange={(e) => setSettingsForm({ ...settingsForm, deliveryRadiusKm: parseFloat(e.target.value) })}
                      className="w-full accent-slate-900 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-600">
                      Formula: Customers located within {settingsForm.deliveryRadiusKm} km from your shop coordinates will automatically see your inventory catalog.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Store Address
                    </label>
                    <input
                      type="text"
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      placeholder="Main Market, Shop #12"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-xl text-xs font-medium outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {isSavingSettings ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </main>

          {/* =========================================================================
              MODAL 1: ADD OR EDIT PRODUCT
             ========================================================================= */}
          <AnimatePresence>
            {(isAddProductOpen || isEditProductOpen) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <h3 className="font-semibold text-base text-slate-900">
                      {isEditProductOpen ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddProductOpen(false);
                        setIsEditProductOpen(false);
                        setEditingProductId(null);
                      }}
                      className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Item Name</label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        placeholder="e.g. Aashirvaad Shudh Chakki Atta 5kg"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-slate-900"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                        <select
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                        >
                          {DUKANDAR_CATEGORIES.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Unit</label>
                        <select
                          value={productForm.unit}
                          onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                        >
                          {UNIT_OPTIONS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Selling Price (₹)</label>
                        <input
                          type="number"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          placeholder="245"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-slate-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">MRP Price (₹)</label>
                        <input
                          type="number"
                          value={productForm.mrp}
                          onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })}
                          placeholder="270"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Stock Quantity</label>
                        <input
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                          placeholder="100"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Offer Badge (optional)</label>
                        <input
                          type="text"
                          value={productForm.offerBadge}
                          onChange={(e) => setProductForm({ ...productForm, offerBadge: e.target.value })}
                          placeholder="Save ₹25 / Hot Deal"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {isEditProductOpen ? 'Save Changes' : 'Add to Inventory'}
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* =========================================================================
              MODAL 2: CREATE COMBO DEAL
             ========================================================================= */}
          <AnimatePresence>
            {isAddComboOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-xl"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <h3 className="font-semibold text-base text-slate-900">Create Bundle Combo Deal</h3>
                    <button
                      type="button"
                      onClick={() => setIsAddComboOpen(false)}
                      className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveCombo} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Combo Title</label>
                      <input
                        type="text"
                        value={comboForm.title}
                        onChange={(e) => setComboForm({ ...comboForm, title: e.target.value })}
                        placeholder="e.g. Morning Breakfast Saver Pack"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Included Items (comma separated)
                      </label>
                      <input
                        type="text"
                        value={comboForm.items}
                        onChange={(e) => setComboForm({ ...comboForm, items: e.target.value })}
                        placeholder="Amul Milk 1L, Amul Butter 500g, Nescafe 200g"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Original Price (₹)</label>
                        <input
                          type="number"
                          value={comboForm.originalPrice}
                          onChange={(e) => setComboForm({ ...comboForm, originalPrice: e.target.value })}
                          placeholder="670"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Offer Price (₹)</label>
                        <input
                          type="number"
                          value={comboForm.offerPrice}
                          onChange={(e) => setComboForm({ ...comboForm, offerPrice: e.target.value })}
                          placeholder="599"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-slate-900"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Publish Combo
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* =========================================================================
              MODAL 3: CREATE STORE COUPON
             ========================================================================= */}
          <AnimatePresence>
            {isAddCouponOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-xl"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <h3 className="font-semibold text-base text-slate-900">Create Store Coupon</h3>
                    <button
                      type="button"
                      onClick={() => setIsAddCouponOpen(false)}
                      className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveCoupon} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Coupon Code</label>
                      <input
                        type="text"
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                        placeholder="e.g. WELCOME50 or SAVEMORE"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase outline-none focus:border-slate-900"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Discount (%)</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={couponForm.discountPercent}
                          onChange={(e) => setCouponForm({ ...couponForm, discountPercent: e.target.value })}
                          placeholder="10"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-slate-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Min Order Amount (₹)</label>
                        <input
                          type="number"
                          value={couponForm.minOrderAmount}
                          onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
                          placeholder="299"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Activate Coupon
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
