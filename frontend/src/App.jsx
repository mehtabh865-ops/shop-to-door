import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Store,
  Compass,
  Package,
  User,
  Search,
  MapPin,
  Plus,
  Minus,
  Check,
  X,
  Truck,
  Box,
  KeyRound,
  Power,
  ChevronRight,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  Star,
  Milk,
  Apple,
  Pill,
  Shirt,
  Smartphone,
  Coffee,
  CheckCircle2,
  Clock,
  LogOut,
  Lock,
  Mail,
  Phone,
  AlertCircle,
  Tag,
  Layers,
  Trash2,
  Edit3,
  BadgePercent,
  Gift,
} from 'lucide-react';
import { api } from './api';

const PRODUCT_CATEGORIES = [
  { id: 'all', label: 'All Items', icon: Sparkles },
  { id: 'grocery', label: 'Kirana & Grocery', icon: ShoppingBag },
  { id: 'dairy', label: 'Milk & Dairy', icon: Milk },
  { id: 'fruits_vegetables', label: 'Fresh Sabzi & Fruits', icon: Apple },
  { id: 'pharmacy', label: 'Pharmacy & Health', icon: Pill },
  { id: 'snacks', label: 'Snacks & Beverages', icon: Coffee },
  { id: 'fashion', label: 'Fashion & Wear', icon: Shirt },
  { id: 'electronics', label: 'Electronics', icon: Smartphone },
];

const UNIT_OPTIONS = ['kg', 'gm', 'liter', 'ml', 'piece', 'packet', 'box', 'strip', 'unit'];

export default function App() {
  // === CURRENT USER SESSION ===
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('std_user');
      const token = localStorage.getItem('std_token');
      if (saved && token) {
        return JSON.parse(saved);
      }
      return null;
    } catch {
      return null;
    }
  });

  // Listen for unauthorized session expiration
  useEffect(() => {
    const handleUnauthorized = () => {
      setCurrentUser(null);
      setErrorMsg('Your session has expired. Please login again.');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // === AUTHENTICATION GATE STATE ===
  const [authRole, setAuthRole] = useState('customer'); // 'customer' | 'dukandar'
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    shopName: '',
    category: 'grocery',
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // === CUSTOMER APP STATE ===
  const [customerTab, setCustomerTab] = useState('explore'); // 'explore' | 'orders'
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [shopCombos, setShopCombos] = useState([]);
  const [shopCoupons, setShopCoupons] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [customerOrders, setCustomerOrders] = useState([]);

  // === DUKANDAR APP STATE ===
  const [dukandarTab, setDukandarTab] = useState('products'); // 'products' | 'combos' | 'coupons' | 'orders'
  const [dukandarShop, setDukandarShop] = useState(null);
  const [dukandarProducts, setDukandarProducts] = useState([]);
  const [dukandarCombos, setDukandarCombos] = useState([]);
  const [dukandarCoupons, setDukandarCoupons] = useState([]);
  const [dukandarOrders, setDukandarOrders] = useState([]);
  const [dukandarCatFilter, setDukandarCatFilter] = useState('all');
  const [otpInput, setOtpInput] = useState('');

  // Modals
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddComboOpen, setIsAddComboOpen] = useState(false);
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);

  // Forms
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'grocery',
    price: '',
    mrp: '',
    stock: '100',
    unit: 'kg',
    unitValue: '1',
    isOffer: false,
    discountPercent: '',
    offerBadge: '',
  });

  const [comboForm, setComboForm] = useState({
    name: '',
    description: '',
    comboPrice: '',
    badge: 'Special Saver',
    selectedItems: {}, // { [productId]: quantity }
  });

  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'flat', // 'flat' | 'percentage'
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
  });

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  // === DATA LOADERS ===
  const loadShops = async () => {
    try {
      const res = await api.getShops();
      const list = res.results || res;
      if (Array.isArray(list) && list.length > 0) {
        setShops(list);
        if (!selectedShop) {
          setSelectedShop(list[0]);
        }
      }
    } catch (err) {
      console.warn('Backend loading, check network:', err.message);
    }
  };

  const loadShopDetails = async (shopId) => {
    if (!shopId) return;
    try {
      const [prodsRes, combosRes, couponsRes] = await Promise.all([
        api.getShopProducts(shopId),
        api.getShopCombos(shopId),
        api.getShopCoupons(shopId),
      ]);
      setProducts(prodsRes.results || prodsRes || []);
      setShopCombos(combosRes.results || combosRes || []);
      setShopCoupons(couponsRes.results || couponsRes || []);
    } catch (err) {
      console.warn('Shop details error:', err.message);
    }
  };

  const loadDukandarData = async () => {
    if (!currentUser || currentUser.role !== 'dukandar') return;
    try {
      const shopRes = await api.getMyShop();
      if (shopRes && (shopRes.id || shopRes._id || shopRes.name)) {
        setDukandarShop(shopRes);
      }
    } catch (e) {
      console.warn('getMyShop error:', e);
      setDukandarShop({
        name: currentUser.shopName || `${currentUser.name}'s Shop`,
        category: 'grocery',
        isOpen: true,
      });
    }

    try {
      const prodsRes = await api.getMyProducts();
      setDukandarProducts(prodsRes.results || prodsRes || []);
    } catch (e) {
      console.warn('getMyProducts error:', e);
    }

    try {
      const combosRes = await api.getMyCombos();
      setDukandarCombos(combosRes.results || combosRes || []);
    } catch (e) {
      console.warn('getMyCombos error:', e);
    }

    try {
      const couponsRes = await api.getMyCoupons();
      setDukandarCoupons(couponsRes.results || couponsRes || []);
    } catch (e) {
      console.warn('getMyCoupons error:', e);
    }

    try {
      const ordersRes = await api.getShopOrders();
      setDukandarOrders(ordersRes.results || ordersRes || []);
    } catch (e) {
      console.warn('getShopOrders error:', e);
    }
  };

  const loadCustomerOrders = async () => {
    if (!currentUser || currentUser.role !== 'customer') return;
    try {
      const ordersRes = await api.getMyOrders();
      setCustomerOrders(ordersRes.results || ordersRes || []);
    } catch (err) {
      console.warn('Customer orders error:', err.message);
    }
  };

  // Trigger loaders based on role
  useEffect(() => {
    if (currentUser?.role === 'customer') {
      loadShops();
      loadCustomerOrders();
    } else if (currentUser?.role === 'dukandar') {
      loadDukandarData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedShop && currentUser?.role === 'customer') {
      loadShopDetails(selectedShop.id || selectedShop._id);
    }
  }, [selectedShop]);

  // === AUTHENTICATION ACTIONS ===
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setErrorMsg('');
    try {
      let res;
      if (authMode === 'login') {
        res = await api.login({
          email: authForm.email,
          password: authForm.password,
        });
      } else {
        res = await api.register({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
          phoneNumber: authForm.phoneNumber,
          role: authRole,
          shopName: authRole === 'dukandar' ? authForm.shopName : undefined,
          category: authRole === 'dukandar' ? authForm.category : undefined,
        });
      }

      localStorage.setItem('std_token', res.tokens.access.token);
      localStorage.setItem('std_user', JSON.stringify(res.user));
      setCurrentUser(res.user);
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoRole) => {
    setAuthLoading(true);
    setErrorMsg('');
    try {
      const email = demoRole === 'dukandar' ? 'dukandar@shoptodoor.com' : 'customer@shoptodoor.com';
      const res = await api.login({ email, password: 'password123' });
      localStorage.setItem('std_token', res.tokens.access.token);
      localStorage.setItem('std_user', JSON.stringify(res.user));
      setCurrentUser(res.user);
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setCart({});
    setAppliedCoupon(null);
  };

  // === DUKANDAR ACTIONS ===
  const handleToggleShop = async () => {
    try {
      const updated = await api.toggleShopStatus();
      setDukandarShop(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const price = Number(productForm.price);
      const mrp = productForm.mrp ? Number(productForm.mrp) : price;
      const stock = Number(productForm.stock || 100);
      const discountPercent = productForm.discountPercent ? Number(productForm.discountPercent) : 0;

      await api.createProduct({
        name: productForm.name,
        category: productForm.category,
        price,
        mrp,
        stock,
        unit: productForm.unit,
        unitValue: productForm.unitValue || '1',
        isOffer: productForm.isOffer,
        discountPercent,
        offerBadge: productForm.offerBadge,
      });

      setIsAddProductOpen(false);
      setProductForm({
        name: '',
        category: 'grocery',
        price: '',
        mrp: '',
        stock: '100',
        unit: 'kg',
        unitValue: '1',
        isOffer: false,
        discountPercent: '',
        offerBadge: '',
      });
      await loadDukandarData();
    } catch (err) {
      alert(err.message || 'Failed to add product');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEditProductOpen = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category || 'grocery',
      price: prod.price,
      mrp: prod.mrp || prod.price,
      stock: prod.stock || 100,
      unit: prod.unit || 'piece',
      unitValue: prod.unitValue || '1',
      isOffer: prod.isOffer || false,
      discountPercent: prod.discountPercent || '',
      offerBadge: prod.offerBadge || '',
    });
    setIsEditProductOpen(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setAuthLoading(true);
    try {
      const price = Number(productForm.price);
      const mrp = productForm.mrp ? Number(productForm.mrp) : price;
      const stock = Number(productForm.stock || 100);
      const discountPercent = productForm.discountPercent ? Number(productForm.discountPercent) : 0;

      await api.updateProduct(editingProduct.id || editingProduct._id, {
        name: productForm.name,
        category: productForm.category,
        price,
        mrp,
        stock,
        unit: productForm.unit,
        unitValue: productForm.unitValue || '1',
        isOffer: productForm.isOffer,
        discountPercent,
        offerBadge: productForm.offerBadge,
      });

      setIsEditProductOpen(false);
      setEditingProduct(null);
      await loadDukandarData();
    } catch (err) {
      alert(err.message || 'Failed to update product');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this product from your inventory?')) return;
    try {
      await api.deleteProduct(productId);
      await loadDukandarData();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const handleToggleComboItem = (productId, qtyDelta = 1) => {
    setComboForm((prev) => {
      const current = prev.selectedItems[productId] || 0;
      const next = Math.max(0, current + qtyDelta);
      const updated = { ...prev.selectedItems };
      if (next === 0) {
        delete updated[productId];
      } else {
        updated[productId] = next;
      }
      return { ...prev, selectedItems: updated };
    });
  };

  const calculateComboOriginalTotal = () => {
    let sum = 0;
    for (const [prodId, qty] of Object.entries(comboForm.selectedItems)) {
      const p = dukandarProducts.find((it) => (it.id || it._id) === prodId);
      if (p) sum += p.price * qty;
    }
    return sum;
  };

  const handleCreateCombo = async (e) => {
    e.preventDefault();
    const items = Object.entries(comboForm.selectedItems).map(([productId, quantity]) => ({
      product: productId,
      quantity,
    }));

    if (items.length < 2) {
      alert('Please select at least 2 items to bundle into a combo pack');
      return;
    }

    const originalPrice = calculateComboOriginalTotal();
    const comboPrice = Number(comboForm.comboPrice);

    if (comboPrice >= originalPrice) {
      alert(`Combo price (₹${comboPrice}) must be less than original total (₹${originalPrice})`);
      return;
    }

    setAuthLoading(true);
    try {
      await api.createCombo({
        name: comboForm.name,
        description: comboForm.description,
        items,
        comboPrice,
        originalPrice,
        badge: comboForm.badge || `Save ₹${originalPrice - comboPrice}`,
      });

      setIsAddComboOpen(false);
      setComboForm({
        name: '',
        description: '',
        comboPrice: '',
        badge: 'Special Saver',
        selectedItems: {},
      });
      await loadDukandarData();
    } catch (err) {
      alert(err.message || 'Failed to create combo');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDeleteCombo = async (comboId) => {
    if (!window.confirm('Delete this combo pack?')) return;
    try {
      await api.deleteCombo(comboId);
      await loadDukandarData();
    } catch (err) {
      alert(err.message || 'Failed to delete combo');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      await api.createCoupon({
        code: couponForm.code.toUpperCase().trim(),
        description: couponForm.description,
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        minOrderAmount: couponForm.minOrderAmount ? Number(couponForm.minOrderAmount) : 0,
        maxDiscount: couponForm.maxDiscount ? Number(couponForm.maxDiscount) : 0,
      });

      setIsAddCouponOpen(false);
      setCouponForm({
        code: '',
        description: '',
        discountType: 'flat',
        discountValue: '',
        minOrderAmount: '',
        maxDiscount: '',
      });
      await loadDukandarData();
    } catch (err) {
      alert(err.message || 'Failed to create coupon');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.deleteCoupon(couponId);
      await loadDukandarData();
    } catch (err) {
      alert(err.message || 'Failed to delete coupon');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await loadDukandarData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleVerifyOtp = async (orderId) => {
    try {
      await api.verifyDeliveryOtp(orderId, otpInput);
      setOtpInput('');
      await loadDukandarData();
      alert('Delivery Verified Successfully!');
    } catch (err) {
      alert(err.message || 'Invalid delivery OTP');
    }
  };

  // === CUSTOMER CART & CHECKOUT ACTIONS ===
  const addToCart = (product, shopId) => {
    setCart((prev) => {
      const key = `p_${product.id || product._id}`;
      const existing = prev[key];
      const qty = existing ? existing.quantity + 1 : 1;
      return {
        ...prev,
        [key]: {
          key,
          type: 'product',
          item: product,
          quantity: qty,
          price: product.price,
          name: product.name,
          shopId,
        },
      };
    });
  };

  const addComboToCart = (combo, shopId) => {
    setCart((prev) => {
      const key = `c_${combo.id || combo._id}`;
      const existing = prev[key];
      const qty = existing ? existing.quantity + 1 : 1;
      return {
        ...prev,
        [key]: {
          key,
          type: 'combo',
          item: combo,
          quantity: qty,
          price: combo.comboPrice,
          name: combo.name,
          shopId,
        },
      };
    });
  };

  const removeFromCart = (key) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (!copy[key]) return copy;
      if (copy[key].quantity > 1) {
        copy[key].quantity -= 1;
      } else {
        delete copy[key];
      }
      return copy;
    });
  };

  const cartTotalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = Object.values(cart).reduce((sum, item) => sum + item.quantity * item.price, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const cartFinalTotal = Math.max(0, cartSubtotal - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError('');
    try {
      const res = await api.applyCoupon(selectedShop?.id || selectedShop?._id, couponInput.trim(), cartSubtotal);
      setAppliedCoupon(res);
      setCouponError('');
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const handleCheckout = async () => {
    setAuthLoading(true);
    try {
      const orderItems = [];
      for (const entry of Object.values(cart)) {
        if (entry.type === 'combo') {
          if (entry.item.items && entry.item.items.length > 0) {
            entry.item.items.forEach((ci) => {
              const pId = ci.product?._id || ci.product?.id || ci.product;
              if (pId) {
                orderItems.push({
                  productId: pId,
                  quantity: (ci.quantity || 1) * entry.quantity,
                });
              }
            });
          } else {
            orderItems.push({
              productId: products[0]?.id || products[0]?._id,
              quantity: entry.quantity,
            });
          }
        } else {
          orderItems.push({
            productId: entry.item.id || entry.item._id,
            quantity: entry.quantity,
          });
        }
      }

      if (orderItems.length === 0) {
        alert('Your cart has no items');
        return;
      }

      const res = await api.createOrder({
        shopId: selectedShop.id || selectedShop._id,
        items: orderItems,
        deliveryAddress: {
          recipientName: currentUser.name || 'Local Customer',
          phone: currentUser.phoneNumber || '9820054321',
          street: 'Main Market Road, City Center',
          pincode: '400001',
        },
        paymentMethod: 'cod',
      });

      setCart({});
      setAppliedCoupon(null);
      setIsCartOpen(false);
      setCustomerTab('orders');
      if (res && (res.id || res._id)) {
        setCustomerOrders((prev) => [res, ...prev]);
      }
      loadCustomerOrders();
      alert('Order Placed Successfully! Your 4-digit Delivery OTP is: ' + (res.deliveryOtp || ''));
    } catch (err) {
      alert(err.message || 'Failed to place order');
    } finally {
      setAuthLoading(false);
    }
  };

  // Filter products for customer storefront
  const filteredProducts = products.filter((prod) => {
    const matchesCat = selectedCategory === 'all' || prod.category === selectedCategory;
    const matchesQuery =
      !searchQuery.trim() || prod.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Filter products for dukandar inventory
  const filteredDukandarProducts = dukandarProducts.filter((prod) => {
    if (dukandarCatFilter === 'all') return true;
    return prod.category === dukandarCatFilter;
  });

  // =========================================================================
  // VIEW 1: GATEWAY & LOGIN SCREEN (SHOWN WHEN NOT LOGGED IN)
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-900 max-w-md mx-auto shadow-2xl relative select-none p-5 justify-center">
        {/* Top Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-3xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30 mb-3 active:scale-95 transition-transform">
            <ShoppingBag className="w-8 h-8" strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shop to Door</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Hyperlocal 15-Minute Local Commerce Platform
          </p>
        </div>

        {/* Persona / Role Selector */}
        <div className="mb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 text-center">
            Choose Your Portal
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setAuthRole('customer')}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 active:scale-95 relative ${
                authRole === 'customer'
                  ? 'bg-white border-blue-600 ring-2 ring-blue-600/20 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <ShoppingBag className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="font-bold text-xs text-slate-900">Grahak / Customer</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Order from local shops</div>
            </button>

            <button
              type="button"
              onClick={() => setAuthRole('dukandar')}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 active:scale-95 relative ${
                authRole === 'dukandar'
                  ? 'bg-white border-blue-600 ring-2 ring-blue-600/20 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                <Store className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="font-bold text-xs text-slate-900">Dukandar / Merchant</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Manage store & orders</div>
            </button>
          </div>
        </div>

        {/* Auth Box */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-4">
          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                authMode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                authMode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-3">
            {authMode === 'register' && (
              <>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                {authRole === 'dukandar' && (
                  <>
                    <div className="relative">
                      <Store className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Shop Name (e.g. Ramesh Kirana Store)"
                        value={authForm.shopName}
                        onChange={(e) => setAuthForm({ ...authForm, shopName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <select
                        value={authForm.category}
                        onChange={(e) => setAuthForm({ ...authForm, category: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 capitalize"
                      >
                        {PRODUCT_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={authForm.phoneNumber}
                    onChange={(e) => setAuthForm({ ...authForm, phoneNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 active:scale-95 transition-all mt-1"
            >
              {authLoading
                ? 'Connecting...'
                : authMode === 'login'
                ? `Enter as ${authRole === 'dukandar' ? 'Dukandar' : 'Customer'}`
                : 'Create Account & Enter'}
            </button>
          </form>

          {/* 1-Tap Demo Buttons */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-[10px] text-center text-slate-400 font-semibold mb-2 uppercase tracking-wider">
              1-Tap Instant Live Login
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('customer')}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                <span>Customer Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('dukandar')}
                className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Store className="w-3.5 h-3.5 text-blue-600" />
                <span>Dukandar Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* 1-Tap PWA Install Bar */}
        {showInstallBtn && (
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white flex items-center justify-between shadow-lg shadow-blue-500/25">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-white" />
              <div className="text-xs font-bold">Install PWA on Phone</div>
            </div>
            <button
              onClick={handleInstallApp}
              className="px-3 py-1 rounded-xl bg-white text-blue-600 text-xs font-bold active:scale-95"
            >
              Install
            </button>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: 🏪 DUKANDAR MERCHANT APP (RENDERED ONLY FOR DUKANDAR)
  // =========================================================================
  if (currentUser.role === 'dukandar') {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-900 max-w-md mx-auto shadow-xl relative select-none pb-24">
        {/* Dukandar Header */}
        <header className="sticky top-0 z-30 px-4 py-3.5 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Store className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-indigo-600 font-bold">
                Merchant Portal
              </div>
              <div className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
                {dukandarShop?.name || currentUser.shopName || `${currentUser.name}'s Shop`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 1-Tap Open/Close Toggle */}
            <button
              onClick={handleToggleShop}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all duration-300 active:scale-90 shadow-xs ${
                dukandarShop?.isOpen !== false
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-rose-50 text-rose-600 border border-rose-200'
              }`}
            >
              <Power className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span className="text-[11px] font-bold">
                {dukandarShop?.isOpen !== false ? 'OPEN' : 'CLOSED'}
              </span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-rose-600 active:scale-95 transition-colors"
              title="Logout from Store"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dukandar Main Content */}
        <main className="flex-1 px-4 pt-3.5 space-y-4 animate-fadeIn">
          {/* Quick Merchant Stats */}
          <div className="grid grid-cols-4 gap-2 text-center bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="bg-slate-50 p-2 rounded-xl">
              <div className="text-[10px] text-slate-500">Items</div>
              <div className="text-sm font-bold text-slate-900">{dukandarProducts.length}</div>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl">
              <div className="text-[10px] text-slate-500">Combos</div>
              <div className="text-sm font-bold text-indigo-600">{dukandarCombos.length}</div>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl">
              <div className="text-[10px] text-slate-500">Coupons</div>
              <div className="text-sm font-bold text-emerald-600">{dukandarCoupons.length}</div>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl">
              <div className="text-[10px] text-slate-500">Orders</div>
              <div className="text-sm font-bold text-amber-600">{dukandarOrders.length}</div>
            </div>
          </div>

          {/* Sub Navigation Strip */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80 gap-1">
            <button
              onClick={() => setDukandarTab('products')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                dukandarTab === 'products'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </button>
            <button
              onClick={() => setDukandarTab('combos')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                dukandarTab === 'combos'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Combos</span>
            </button>
            <button
              onClick={() => setDukandarTab('coupons')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                dukandarTab === 'coupons'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BadgePercent className="w-3.5 h-3.5" />
              <span>Coupons</span>
            </button>
            <button
              onClick={() => setDukandarTab('orders')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all relative ${
                dukandarTab === 'orders'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Orders</span>
              {dukandarOrders.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-indigo-600 absolute top-2 right-2" />
              )}
            </button>
          </div>

          {/* TAB 1: INVENTORY / CATALOG */}
          {dukandarTab === 'products' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Products ({filteredDukandarProducts.length})
                </h3>
                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Category Filter */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {PRODUCT_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setDukandarCatFilter(c.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
                      dukandarCatFilter === c.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {filteredDukandarProducts.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  No products in this category. Tap "+ Add Product" to list an item!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredDukandarProducts.map((prod) => (
                    <div
                      key={prod.id || prod._id}
                      className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 relative">
                          <Box className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{prod.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {prod.unitValue || 1} {prod.unit || 'piece'} • Stock: {prod.stock || 100}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs font-bold text-indigo-600">₹{prod.price}</span>
                            {prod.mrp && prod.mrp > prod.price && (
                              <span className="text-[10px] text-slate-400 line-through">₹{prod.mrp}</span>
                            )}
                            {prod.offerBadge && (
                              <span className="text-[9px] bg-rose-50 text-rose-600 border border-rose-200 font-bold px-1 rounded">
                                {prod.offerBadge}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditProductOpen(prod)}
                          className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 active:scale-90 border border-slate-200/60"
                          title="Edit Product"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id || prod._id)}
                          className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-rose-600 active:scale-90 border border-rose-200/60"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COMBOS & BUNDLES */}
          {dukandarTab === 'combos' && (
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-indigo-900">Combo Packs</div>
                  <div className="text-[10px] text-indigo-600">Bundle products to boost order value</div>
                </div>
                <button
                  onClick={() => setIsAddComboOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                  <span>Create Combo</span>
                </button>
              </div>

              {dukandarCombos.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  No combo packs yet. Tap "+ Create Combo" to bundle items!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {dukandarCombos.map((combo) => (
                    <div
                      key={combo.id || combo._id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between"
                    >
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{combo.name}</span>
                          {combo.badge && (
                            <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-1.5 py-0.2 rounded-full">
                              {combo.badge}
                            </span>
                          )}
                        </div>
                        {combo.description && (
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {combo.description}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-indigo-600">₹{combo.comboPrice}</span>
                          {combo.originalPrice && (
                            <span className="text-[11px] text-slate-400 line-through">
                              ₹{combo.originalPrice}
                            </span>
                          )}
                          {combo.savings && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">
                              Save ₹{combo.savings}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteCombo(combo.id || combo._id)}
                        className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-rose-600 active:scale-90 border border-rose-200/60"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COUPONS */}
          {dukandarTab === 'coupons' && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-900">Store Coupons</div>
                  <div className="text-[10px] text-emerald-600">Create promo codes to attract customers</div>
                </div>
                <button
                  onClick={() => setIsAddCouponOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                  <span>New Coupon</span>
                </button>
              </div>

              {dukandarCoupons.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  No coupons created yet. Tap "+ New Coupon" to publish discount codes!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {dukandarCoupons.map((coupon) => (
                    <div
                      key={coupon.id || coupon._id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200 tracking-wider">
                            {coupon.code}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                            {coupon.discountType === 'percentage'
                              ? `${coupon.discountValue}% OFF`
                              : `₹${coupon.discountValue} OFF`}
                          </span>
                        </div>
                        {coupon.description && (
                          <div className="text-[11px] text-slate-500 mt-1">{coupon.description}</div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Min order: ₹{coupon.minOrderAmount || 0}
                          {coupon.maxDiscount > 0 && ` • Max: ₹${coupon.maxDiscount}`}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteCoupon(coupon.id || coupon._id)}
                        className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-rose-600 active:scale-90 border border-rose-200/60"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ORDERS QUEUE */}
          {dukandarTab === 'orders' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Dispatch Orders Queue
                </span>
                <span className="text-xs font-semibold text-indigo-600">{dukandarOrders.length} Orders</span>
              </div>

              {dukandarOrders.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  No active incoming orders right now
                </div>
              ) : (
                dukandarOrders.map((ord) => (
                  <div
                    key={ord.id || ord._id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{ord.orderNumber}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : ord.status === 'out_for_delivery'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {ord.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      {ord.items?.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>
                            {it.name || 'Product'} x {it.quantity}
                          </span>
                          <span className="font-medium text-slate-800">₹{it.totalPrice || 0}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-500 font-medium">Customer Collect Due (COD)</span>
                      <span className="font-bold text-slate-900 text-sm">₹{ord.totalAmount}</span>
                    </div>

                    {/* Order Progression Buttons */}
                    {ord.status === 'placed' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id || ord._id, 'packing')}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-blue-600/20"
                      >
                        <Box className="w-4 h-4" />
                        <span>Pack Order</span>
                      </button>
                    )}

                    {ord.status === 'packing' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id || ord._id, 'out_for_delivery')}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-indigo-600/20"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Dispatch for Delivery</span>
                      </button>
                    )}

                    {ord.status === 'out_for_delivery' && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="Customer OTP"
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-center font-mono tracking-widest text-slate-900 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={() => handleVerifyOtp(ord.id || ord._id)}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-xs flex items-center justify-center gap-1 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
                        >
                          <Check className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </main>

        {/* MODALS */}
        {/* Add Product Modal */}
        {isAddProductOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 max-w-sm w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                <Box className="w-5 h-5 text-indigo-600" />
                <span>Add Product to Catalog</span>
              </h3>
              <form onSubmit={handleCreateProduct} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aashirvaad Chakki Atta"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 mt-1 capitalize"
                  >
                    {PRODUCT_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Price (₹)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="245"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase">MRP (₹)</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="275"
                      value={productForm.mrp}
                      onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Qty</label>
                    <input
                      type="text"
                      placeholder="5"
                      value={productForm.unitValue}
                      onChange={(e) => setProductForm({ ...productForm, unitValue: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Unit</label>
                    <select
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2 text-xs text-slate-900 mt-1 capitalize"
                    >
                      {UNIT_OPTIONS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Stock</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="100"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 mt-1"
                    />
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Special Offer / Discount</span>
                    <input
                      type="checkbox"
                      checked={productForm.isOffer}
                      onChange={(e) => setProductForm({ ...productForm, isOffer: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                  </div>
                  {productForm.isOffer && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500">Discount %</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="15"
                          value={productForm.discountPercent}
                          onChange={(e) =>
                            setProductForm({ ...productForm, discountPercent: e.target.value })
                          }
                          className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs text-slate-900 mt-0.5"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500">Badge</label>
                        <input
                          type="text"
                          placeholder="15% OFF"
                          value={productForm.offerBadge}
                          onChange={(e) => setProductForm({ ...productForm, offerBadge: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs text-slate-900 mt-0.5"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 active:scale-95 transition-all mt-2"
                >
                  {authLoading ? 'Saving...' : 'Save Product to Inventory'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {isEditProductOpen && editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 max-w-sm w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setIsEditProductOpen(false);
                  setEditingProduct(null);
                }}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <span>Edit Product Details</span>
              </h3>
              <form onSubmit={handleUpdateProduct} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Product Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Price (₹)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase">MRP (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={productForm.mrp}
                      onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Qty</label>
                    <input
                      type="text"
                      value={productForm.unitValue}
                      onChange={(e) => setProductForm({ ...productForm, unitValue: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Unit</label>
                    <select
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2 text-xs text-slate-900 mt-1 capitalize"
                    >
                      {UNIT_OPTIONS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Stock</label>
                    <input
                      type="number"
                      min={0}
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 mt-1"
                    />
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Special Offer / Discount</span>
                    <input
                      type="checkbox"
                      checked={productForm.isOffer}
                      onChange={(e) => setProductForm({ ...productForm, isOffer: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                  </div>
                  {productForm.isOffer && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500">Discount %</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={productForm.discountPercent}
                          onChange={(e) =>
                            setProductForm({ ...productForm, discountPercent: e.target.value })
                          }
                          className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs text-slate-900 mt-0.5"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500">Badge</label>
                        <input
                          type="text"
                          value={productForm.offerBadge}
                          onChange={(e) => setProductForm({ ...productForm, offerBadge: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs text-slate-900 mt-0.5"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 active:scale-95 transition-all mt-2"
                >
                  {authLoading ? 'Updating...' : 'Update Product'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Create Combo Modal */}
        {isAddComboOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 max-w-sm w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsAddComboOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>Create Combo Pack</span>
              </h3>
              <form onSubmit={handleCreateCombo} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Combo Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Breakfast Essentials Pack"
                    value={comboForm.name}
                    onChange={(e) => setComboForm({ ...comboForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Milk + Butter + Bread"
                    value={comboForm.description}
                    onChange={(e) => setComboForm({ ...comboForm, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    Select Products (Min 2)
                  </label>
                  <div className="max-h-36 overflow-y-auto space-y-1 mt-1 border border-slate-200 rounded-xl p-2 bg-slate-50">
                    {dukandarProducts.map((p) => {
                      const pId = p.id || p._id;
                      const qty = comboForm.selectedItems[pId] || 0;
                      return (
                        <div
                          key={pId}
                          className="flex items-center justify-between text-xs p-1.5 bg-white rounded-lg border border-slate-100"
                        >
                          <div className="truncate pr-2">
                            <span className="font-semibold text-slate-800">{p.name}</span>
                            <span className="text-[10px] text-slate-400 ml-1">₹{p.price}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {qty > 0 && (
                              <button
                                type="button"
                                onClick={() => handleToggleComboItem(pId, -1)}
                                className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-700"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                            )}
                            <span className="w-4 text-center font-bold text-xs">{qty}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleComboItem(pId, 1)}
                              className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200/80 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Original Price Total:</span>
                    <span className="font-bold text-slate-900">₹{calculateComboOriginalTotal()}</span>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-indigo-900 uppercase">
                      Special Combo Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder={`Less than ₹${calculateComboOriginalTotal()}`}
                      value={comboForm.comboPrice}
                      onChange={(e) => setComboForm({ ...comboForm, comboPrice: e.target.value })}
                      className="w-full bg-white border border-indigo-300 rounded-xl py-1.5 px-3 text-xs text-slate-900 font-bold mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Badge Text</label>
                  <input
                    type="text"
                    placeholder="Save ₹50"
                    value={comboForm.badge}
                    onChange={(e) => setComboForm({ ...comboForm, badge: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 mt-1"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 active:scale-95 transition-all mt-2"
                >
                  {authLoading ? 'Creating...' : 'Launch Combo Pack'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Create Coupon Modal */}
        {isAddCouponOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 max-w-sm w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsAddCouponOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                <BadgePercent className="w-5 h-5 text-emerald-600" />
                <span>Create Store Coupon</span>
              </h3>
              <form onSubmit={handleCreateCoupon} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WELCOME50"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs uppercase tracking-wider font-mono text-slate-900 focus:outline-none focus:border-emerald-500 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Description</label>
                  <input
                    type="text"
                    placeholder="Flat ₹50 OFF on orders above ₹299"
                    value={couponForm.description}
                    onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Type</label>
                    <select
                      value={couponForm.discountType}
                      onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 mt-1"
                    >
                      <option value="flat">Flat ₹ OFF</option>
                      <option value="percentage">Percentage %</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Discount Value</label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="50"
                      value={couponForm.discountValue}
                      onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Min Order (₹)</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="299"
                      value={couponForm.minOrderAmount}
                      onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Max Cap (₹)</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="100"
                      value={couponForm.maxDiscount}
                      onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 mt-1"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 active:scale-95 transition-all mt-2"
                >
                  {authLoading ? 'Publishing...' : 'Publish Store Coupon'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: 🛍️ CUSTOMER SHOPPING APP (RENDERED ONLY FOR CUSTOMER)
  // =========================================================================
  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-900 max-w-md mx-auto shadow-xl relative select-none pb-24">
      {/* Customer Header */}
      <header className="sticky top-0 z-30 px-4 py-3.5 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <ShoppingBag className="w-5 h-5 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-semibold text-slate-800">
                {currentUser.name ? currentUser.name.split(' ')[0] : 'Hyperlocal'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-rose-600 active:scale-95 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 1-Tap PWA Install Banner */}
      {showInstallBtn && (
        <div className="mx-4 mt-3 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white flex items-center justify-between shadow-lg shadow-blue-500/25">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">Install Shop to Door</div>
              <div className="text-[10px] text-blue-100">Add to home screen for native app feel</div>
            </div>
          </div>
          <button
            onClick={handleInstallApp}
            className="px-3.5 py-1.5 rounded-xl bg-white text-blue-600 text-xs font-bold shadow-sm active:scale-95"
          >
            Install
          </button>
        </div>
      )}

      {/* CUSTOMER TAB 1: EXPLORE STORES & CATALOG */}
      {customerTab === 'explore' && (
        <main className="flex-1 px-4 pt-3.5 space-y-4 animate-fadeIn">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search items, sabzi, kirana..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Strip */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {PRODUCT_CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 border-0'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Order Live Tracker */}
          {customerOrders.length > 0 && customerOrders[0].status !== 'delivered' && (
            <div
              onClick={() => setCustomerTab('orders')}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-blue-600 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  {customerOrders[0].status === 'out_for_delivery' ? (
                    <Truck className="w-5 h-5 text-blue-600 animate-bounce" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {customerOrders[0].orderNumber}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize font-medium">
                      {customerOrders[0].status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold mt-0.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Delivery OTP: {customerOrders[0].deliveryOtp}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          )}

          {/* Nearby Stores Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Local Stores</span>
              <span className="text-xs font-semibold text-blue-600">{shops.length} Live</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {shops.map((shop) => {
                const isSelected = (selectedShop?.id || selectedShop?._id) === (shop.id || shop._id);
                return (
                  <div
                    key={shop.id || shop._id}
                    onClick={() => setSelectedShop(shop)}
                    className={`p-3 rounded-2xl bg-white border transition-all duration-200 active:scale-95 cursor-pointer relative shadow-sm ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-600/10 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600">
                        <Store className="w-4 h-4" strokeWidth={1.8} />
                      </div>
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          shop.isOpen ? 'bg-emerald-500 shadow-sm shadow-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                    </div>
                    <div className="font-semibold text-xs text-slate-900 truncate">{shop.name}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="font-medium text-slate-700">{shop.rating || 5.0}</span>
                      </div>
                      <span>{shop.deliveryRadiusKm || 5} km</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Value Combos Section */}
          {selectedShop && shopCombos.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                    Value Combo Packs
                  </span>
                </div>
                <span className="text-xs font-semibold text-indigo-600">{shopCombos.length} Deals</span>
              </div>
              <div className="space-y-2">
                {shopCombos.map((combo) => {
                  const comboKey = `c_${combo.id || combo._id}`;
                  const cartItem = cart[comboKey];
                  const qty = cartItem ? cartItem.quantity : 0;
                  return (
                    <div
                      key={combo.id || combo._id}
                      className="p-3 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white border border-blue-200/80 shadow-sm flex items-center justify-between"
                    >
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{combo.name}</span>
                          {combo.badge && (
                            <span className="text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full shadow-xs">
                              {combo.badge}
                            </span>
                          )}
                        </div>
                        {combo.description && (
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {combo.description}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-blue-700">₹{combo.comboPrice}</span>
                          {combo.originalPrice && combo.originalPrice > combo.comboPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{combo.originalPrice}
                            </span>
                          )}
                          {combo.savings && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              Save ₹{combo.savings}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
                        {qty > 0 && (
                          <>
                            <button
                              onClick={() => removeFromCart(comboKey)}
                              className="w-6 h-6 rounded-lg bg-slate-50 shadow-xs flex items-center justify-center text-slate-700 active:scale-90"
                            >
                              <Minus className="w-3 h-3" strokeWidth={2.5} />
                            </button>
                            <span className="font-bold text-xs text-slate-800 w-4 text-center">{qty}</span>
                          </>
                        )}
                        <button
                          onClick={() => addComboToCart(combo, selectedShop.id || selectedShop._id)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 active:scale-90 shadow-sm"
                        >
                          <Plus className="w-3 h-3" strokeWidth={3} />
                          <span>{qty > 0 ? 'Add' : 'Combo'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Store Products Catalog */}
          {selectedShop && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                  {selectedShop.name} Items
                </span>
                <span className="text-xs text-slate-500">{filteredProducts.length} Items</span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  No products in this category
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((product) => {
                    const prodKey = `p_${product.id || product._id}`;
                    const cartItem = cart[prodKey];
                    const qty = cartItem ? cartItem.quantity : 0;
                    return (
                      <div
                        key={product.id || product._id}
                        className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 relative">
                            <ShoppingBag className="w-5 h-5" strokeWidth={1.7} />
                            {product.offerBadge && (
                              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-bold px-1 rounded-full">
                                {product.offerBadge}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 leading-tight">
                              {product.name}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {product.unitValue || '1'} {product.unit || 'unit'}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs font-bold text-blue-600">₹{product.price}</span>
                              {product.mrp && product.mrp > product.price && (
                                <span className="text-[10px] text-slate-400 line-through">
                                  ₹{product.mrp}
                                </span>
                              )}
                              {product.discountPercent > 0 && (
                                <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded">
                                  {product.discountPercent}% OFF
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                          {qty > 0 && (
                            <>
                              <button
                                onClick={() => removeFromCart(prodKey)}
                                className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 active:scale-90"
                              >
                                <Minus className="w-3 h-3" strokeWidth={2.5} />
                              </button>
                              <span className="font-bold text-xs text-slate-800 w-4 text-center">{qty}</span>
                            </>
                          )}
                          <button
                            onClick={() => addToCart(product, selectedShop.id || selectedShop._id)}
                            className="w-6 h-6 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center active:scale-90 shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* CUSTOMER TAB 2: MY ORDERS */}
      {customerTab === 'orders' && (
        <main className="flex-1 px-4 pt-3.5 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">My Orders</h2>
            <button
              onClick={loadCustomerOrders}
              className="text-xs text-blue-600 font-semibold active:scale-95"
            >
              Refresh
            </button>
          </div>

          {customerOrders.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-2">
              <Package className="w-10 h-10 mx-auto text-slate-300" />
              <div className="text-sm font-semibold text-slate-600">No Orders Yet</div>
              <div className="text-xs">Browse local stores to place your first order!</div>
            </div>
          ) : (
            customerOrders.map((ord) => (
              <div
                key={ord.id || ord._id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{ord.orderNumber}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ord.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      ord.status === 'delivered'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : ord.status === 'out_for_delivery'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {ord.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Delivery OTP Badge */}
                {ord.status !== 'delivered' && (
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
                      <KeyRound className="w-4 h-4 text-blue-600" />
                      <span>Share OTP at Doorstep:</span>
                    </div>
                    <span className="font-mono text-sm font-extrabold text-blue-700 tracking-wider bg-white px-2.5 py-0.5 rounded-lg border border-blue-200 shadow-xs">
                      {ord.deliveryOtp}
                    </span>
                  </div>
                )}

                <div className="text-xs text-slate-600 space-y-1">
                  {ord.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        {it.name || 'Store Item'} x {it.quantity}
                      </span>
                      <span className="font-medium text-slate-800">₹{it.totalPrice || it.price || 0}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">Total Paid (COD)</span>
                  <span className="font-bold text-slate-900 text-sm">₹{ord.totalAmount}</span>
                </div>
              </div>
            ))
          )}
        </main>
      )}

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-3 left-4 right-4 max-w-md mx-auto z-40 bg-white/95 backdrop-blur-md rounded-3xl p-2 flex items-center justify-around border border-slate-200/90 shadow-xl shadow-slate-300/40">
        <button
          onClick={() => setCustomerTab('explore')}
          className={`p-3 rounded-2xl transition-all duration-200 active:scale-90 ${
            customerTab === 'explore'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : 'text-slate-400 hover:text-slate-700'
          }`}
          title="Explore Stores"
        >
          <Compass className="w-5 h-5" strokeWidth={2} />
        </button>

        <button
          onClick={() => {
            setCustomerTab('orders');
            loadCustomerOrders();
          }}
          className={`p-3 rounded-2xl transition-all duration-200 active:scale-90 relative ${
            customerTab === 'orders'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : 'text-slate-400 hover:text-slate-700'
          }`}
          title="My Orders"
        >
          <Package className="w-5 h-5" strokeWidth={2} />
          {customerOrders.length > 0 && customerOrders[0].status !== 'delivered' && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className={`p-3 rounded-2xl transition-all duration-200 active:scale-90 relative ${
            cartTotalItems > 0
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : 'text-slate-400 hover:text-slate-700'
          }`}
          title="View Cart"
        >
          <ShoppingBag className="w-5 h-5" strokeWidth={2} />
          {cartTotalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm">
              {cartTotalItems}
            </span>
          )}
        </button>
      </nav>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-5 border-t border-slate-200 max-w-md mx-auto w-full shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-sm text-slate-900">Cart & Checkout</span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 max-h-56 overflow-y-auto space-y-2">
              {Object.values(cart).length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">Your cart is empty</div>
              ) : (
                Object.values(cart).map((item) => (
                  <div key={item.key} className="flex items-center justify-between text-xs text-slate-700">
                    <div>
                      <span className="font-semibold text-slate-900">{item.name}</span>
                      <span className="text-slate-400 ml-1">x {item.quantity}</span>
                    </div>
                    <span className="font-bold text-slate-900">₹{item.price * item.quantity}</span>
                  </div>
                ))
              )}
            </div>

            {/* Promo Code Box */}
            {Object.values(cart).length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                {appliedCoupon ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>'{appliedCoupon.code}' Applied (-₹{appliedCoupon.discountAmount})</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs text-rose-600 font-semibold active:scale-95"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Coupon Code (e.g. WELCOME50)"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs uppercase tracking-wider text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs active:scale-95"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <div className="text-[10px] text-rose-500 font-medium mt-1">{couponError}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 space-y-1 text-xs mb-4">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>₹{cartSubtotal}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Delivery</span>
                <span className="text-emerald-600 font-bold">FREE (Hyperlocal)</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-100">
                <span>Total Payable</span>
                <span className="text-blue-600 text-base">₹{cartFinalTotal}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={authLoading || Object.values(cart).length === 0}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-95 transition-all"
            >
              <span>{authLoading ? 'Processing...' : 'Instant Local Delivery'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
