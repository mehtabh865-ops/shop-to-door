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
  AlertCircle
} from 'lucide-react';
import { api } from './api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('std_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState(currentUser?.role || 'customer');
  const [activeTab, setActiveTab] = useState('explore');
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [dukandarOrders, setDukandarOrders] = useState([]);
  const [dukandarShop, setDukandarShop] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authRole, setAuthRole] = useState('customer');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    shopName: '',
  });

  // Load Initial Shops from MongoDB
  const loadShops = async () => {
    try {
      const res = await api.getShops();
      const list = res.results || res;
      setShops(list);
      if (list.length > 0 && !selectedShop) {
        setSelectedShop(list[0]);
      }
    } catch (err) {
      console.warn('Backend loading, check network:', err.message);
    }
  };

  useEffect(() => {
    loadShops();
  }, []);

  // Load Products when Selected Shop Changes
  useEffect(() => {
    if (!selectedShop) return;
    const loadProducts = async () => {
      try {
        const res = await api.getShopProducts(selectedShop.id);
        setProducts(res.results || res);
      } catch (err) {
        console.warn('Products load error:', err.message);
      }
    };
    loadProducts();
  }, [selectedShop]);

  // Load Dukandar Details if Dukandar Logged In
  const loadDukandarData = async () => {
    if (!currentUser || currentUser.role !== 'dukandar') return;
    try {
      const shopRes = await api.getMyShop();
      setDukandarShop(shopRes);
      const ordersRes = await api.getShopOrders();
      setDukandarOrders(ordersRes.results || ordersRes);
    } catch (err) {
      console.warn('Dukandar data error:', err.message);
    }
  };

  // Load Customer Orders if Customer Logged In
  const loadCustomerOrders = async () => {
    if (!currentUser) return;
    try {
      const ordersRes = await api.getMyOrders();
      setCustomerOrders(ordersRes.results || ordersRes);
    } catch (err) {
      console.warn('Customer orders error:', err.message);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'dukandar') {
      loadDukandarData();
    } else if (currentUser) {
      loadCustomerOrders();
    }
  }, [currentUser, role]);

  // === AUTH HANDLERS ===
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
        });
      }

      localStorage.setItem('std_token', res.tokens.access.token);
      localStorage.setItem('std_user', JSON.stringify(res.user));
      setCurrentUser(res.user);
      setRole(res.user.role);
      setIsAuthOpen(false);
      if (res.user.role === 'dukandar') {
        setActiveTab('dukandar_dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoRole) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const email = demoRole === 'dukandar' ? 'dukandar@shoptodoor.com' : 'customer@shoptodoor.com';
      const res = await api.login({ email, password: 'password123' });
      localStorage.setItem('std_token', res.tokens.access.token);
      localStorage.setItem('std_user', JSON.stringify(res.user));
      setCurrentUser(res.user);
      setRole(res.user.role);
      setIsAuthOpen(false);
      if (res.user.role === 'dukandar') {
        setActiveTab('dukandar_dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Demo login error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setRole('customer');
    setActiveTab('explore');
  };

  // === CART & ORDER HANDLERS ===
  const addToCart = (product, shopId) => {
    setCart((prev) => {
      const existing = prev[product.id];
      const qty = existing ? existing.quantity + 1 : 1;
      return { ...prev, [product.id]: { product, quantity: qty, shopId } };
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (!copy[productId]) return copy;
      if (copy[productId].quantity > 1) {
        copy[productId].quantity -= 1;
      } else {
        delete copy[productId];
      }
      return copy;
    });
  };

  const cartTotalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalPrice = Object.values(cart).reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  const handleCheckout = async () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setLoading(true);
    try {
      const orderItems = Object.values(cart).map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const res = await api.createOrder({
        shopId: selectedShop.id,
        items: orderItems,
        deliveryAddress: {
          recipientName: currentUser.name || 'Local Customer',
          phone: currentUser.phoneNumber || '9876543210',
          street: 'Main Market Road',
          pincode: '400001',
        },
        paymentMethod: 'cod',
      });

      setCart({});
      setIsCartOpen(false);
      setActiveTab('orders');
      loadCustomerOrders();
    } catch (err) {
      alert(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Dukandar Actions
  const handleToggleShop = async () => {
    try {
      const updated = await api.toggleShopStatus();
      setDukandarShop(updated);
      loadShops();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      loadDukandarData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleVerifyOtp = async (orderId) => {
    try {
      await api.verifyDeliveryOtp(orderId, otpInput);
      setOtpInput('');
      loadDukandarData();
    } catch (err) {
      alert(err.message || 'Invalid delivery OTP');
    }
  };

  const categoryIcons = [
    { id: 'all', icon: Sparkles },
    { id: 'grocery', icon: ShoppingBag },
    { id: 'milk', icon: Milk },
    { id: 'veggies', icon: Apple },
    { id: 'pharmacy', icon: Pill },
    { id: 'fashion', icon: Shirt },
    { id: 'tech', icon: Smartphone },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-900 max-w-md mx-auto shadow-xl relative select-none pb-24">
      {/* Light Mode Clean Top Header */}
      <header className="sticky top-0 z-30 px-4 py-3.5 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 active:scale-95 transition-transform">
            <ShoppingBag className="w-5 h-5 text-white" strokeWidth={2.2} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/60">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-medium text-slate-800">
              {currentUser ? currentUser.name.split(' ')[0] : 'Hyperlocal'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* User Auth Status / Button */}
          {currentUser ? (
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-rose-600 active:scale-95 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-1 text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-xl shadow-sm active:scale-95"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          {/* Role Toggle Switch */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => {
                setRole('customer');
                setActiveTab('explore');
              }}
              className={`p-2 rounded-xl transition-all duration-300 ${
                role === 'customer'
                  ? 'bg-white text-blue-600 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" strokeWidth={2.2} />
            </button>
            <button
              onClick={() => {
                if (!currentUser || currentUser.role !== 'dukandar') {
                  setAuthRole('dukandar');
                  setIsAuthOpen(true);
                  return;
                }
                setRole('dukandar');
                setActiveTab('dukandar_dashboard');
              }}
              className={`p-2 rounded-xl transition-all duration-300 ${
                role === 'dukandar'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Store className="w-4 h-4" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </header>

      {/* CUSTOMER STOREFRONT VIEW (LIVE MONGO DATA) */}
      {role === 'customer' && (
        <main className="flex-1 px-4 pt-3.5 space-y-5 animate-fadeIn">
          {/* Clean White Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search local stores & items..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm transition-colors"
            />
            <SlidersHorizontal className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" strokeWidth={2} />
          </div>

          {/* Category Strip */}
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
            {categoryIcons.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 border-0'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
                  }`}
                >
                  <IconComp className="w-5 h-5" strokeWidth={2} />
                </button>
              );
            })}
          </div>

          {/* Customer Active Orders Banner (Real MongoDB Orders) */}
          {customerOrders.length > 0 && customerOrders[0].status !== 'delivered' && (
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-blue-600 flex items-center justify-between">
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
                    <KeyRound className="w-3 h-3" />
                    <span>Delivery OTP: {customerOrders[0].deliveryOtp}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          )}

          {/* Nearby Local Stores (From MongoDB Atlas) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Local Stores</span>
              <span className="text-xs font-semibold text-blue-600">{shops.length} Live</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {shops.map((shop) => {
                const isSelected = selectedShop?.id === shop.id;
                return (
                  <div
                    key={shop.id}
                    onClick={() => setSelectedShop(shop)}
                    className={`p-3.5 rounded-2xl bg-white border transition-all duration-200 active:scale-95 cursor-pointer relative shadow-sm ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-600/10 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600">
                        <Store className="w-5 h-5" strokeWidth={1.8} />
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          shop.isOpen ? 'bg-emerald-500 shadow-sm shadow-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                    </div>
                    <div className="font-semibold text-sm text-slate-900 truncate">{shop.name}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
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

          {/* Shop Catalog (Real Products from MongoDB Atlas) */}
          {selectedShop && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-wider text-slate-600 uppercase">{selectedShop.name}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      selectedShop.isOpen
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {selectedShop.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                <span className="text-xs text-slate-500">{products.length} Products</span>
              </div>

              <div className="space-y-2.5">
                {products.map((product) => {
                  const cartItem = cart[product.id];
                  const qty = cartItem ? cartItem.quantity : 0;

                  return (
                    <div
                      key={product.id}
                      className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
                          <ShoppingBag className="w-6 h-6" strokeWidth={1.7} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{product.name}</div>
                          <div className="text-xs text-slate-500">
                            {product.unitValue || 1} {product.unit}
                          </div>
                          <div className="text-xs font-bold text-blue-600 mt-0.5">₹{product.price}</div>
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                        {qty > 0 && (
                          <>
                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 active:scale-90"
                            >
                              <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
                            </button>
                            <span className="font-bold text-xs text-slate-800 w-4 text-center">{qty}</span>
                          </>
                        )}
                        <button
                          onClick={() => addToCart(product, selectedShop.id)}
                          className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center active:scale-90 shadow-md shadow-blue-600/20"
                        >
                          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      )}

      {/* DUKANDAR DASHBOARD VIEW (LIVE FROM MONGO) */}
      {role === 'dukandar' && dukandarShop && (
        <main className="flex-1 px-4 pt-3.5 space-y-5 animate-fadeIn">
          {/* Dukandar Header & Live 1-Tap Power Switch */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-blue-600 font-bold">Store Dashboard</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{dukandarShop.name}</div>
              </div>
              {/* 1-Tap Open / Close Switch Connected to MongoDB */}
              <button
                onClick={handleToggleShop}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl transition-all duration-300 active:scale-90 shadow-sm ${
                  dukandarShop.isOpen
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-rose-50 text-rose-600 border border-rose-200'
                }`}
              >
                <Power className="w-4 h-4" strokeWidth={2.5} />
                <span className="text-xs font-bold">{dukandarShop.isOpen ? 'LIVE' : 'CLOSED'}</span>
              </button>
            </div>

            {/* Quick Stats Tiles */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium">Category</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5 capitalize">{dukandarShop.category}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium">Incoming Orders</div>
                <div className="text-base font-bold text-blue-600 mt-0.5">{dukandarOrders.length}</div>
              </div>
            </div>
          </div>

          {/* Incoming Real Orders Queue */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Incoming Dispatch Orders</span>
              <span className="text-xs font-semibold text-blue-600">Realtime</span>
            </div>

            <div className="space-y-3">
              {dukandarOrders.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  No active orders right now
                </div>
              ) : (
                dukandarOrders.map((ord) => (
                  <div key={ord.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
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
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>
                            {it.name} x {it.quantity}
                          </span>
                          <span className="font-medium text-slate-800">₹{it.totalPrice}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-500 font-medium">Amount Due</span>
                      <span className="font-bold text-slate-900">₹{ord.totalAmount}</span>
                    </div>

                    {/* Order State Transition Actions */}
                    {ord.status === 'placed' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, 'packing')}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-blue-600/20"
                      >
                        <Box className="w-4 h-4" />
                        <span>Pack Order</span>
                      </button>
                    )}

                    {ord.status === 'packing' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, 'out_for_delivery')}
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
                          onClick={() => handleVerifyOtp(ord.id)}
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
          </div>
        </main>
      )}

      {/* Slide-Up Bottom Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-5 border-t border-slate-200 max-w-md mx-auto w-full shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-sm text-slate-900">Checkout Items</span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 max-h-60 overflow-y-auto space-y-2.5">
              {Object.values(cart).map((item) => (
                <div key={item.product.id} className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium text-slate-800">
                    {item.product.name} ({item.quantity})
                  </span>
                  <span className="font-bold text-slate-900">₹{item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm mb-4">
              <span className="text-slate-500 font-medium">Total Payable</span>
              <span className="text-base font-bold text-blue-600">₹{cartTotalPrice}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-95 transition-all"
            >
              <span>{loading ? 'Processing...' : 'Instant Local Delivery'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* AUTHENTICATION MODAL (LOGIN & SIGNUP) */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                {authRole === 'dukandar' ? <Store className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>
              <h3 className="font-bold text-base text-slate-900">
                {authMode === 'login' ? 'Account Login' : 'Register Account'}
              </h3>
            </div>

            {/* Role Picker */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl mb-4">
              <button
                type="button"
                onClick={() => setAuthRole('customer')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  authRole === 'customer' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setAuthRole('dukandar')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  authRole === 'dukandar' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                Dukandar
              </button>
            </div>

            {errorMsg && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
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
                      placeholder="Your Full Name"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  {authRole === 'dukandar' && (
                    <div className="relative">
                      <Store className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Shop Name (e.g. Ramesh Kirana)"
                        value={authForm.shopName}
                        onChange={(e) => setAuthForm({ ...authForm, shopName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="Phone Number"
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
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 active:scale-95 transition-all mt-2"
              >
                {loading ? 'Please wait...' : authMode === 'login' ? 'Secure Login' : 'Create My Account'}
              </button>
            </form>

            {/* 1-Tap Quick Demo Logins for instant testing on phone */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
              <div className="text-[10px] text-center text-slate-400 font-medium">1-Tap Instant Demo Login:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('customer')}
                  className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1 active:scale-95"
                >
                  <User className="w-3 h-3 text-blue-600" />
                  <span>Customer Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('dukandar')}
                  className="py-1.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold flex items-center justify-center gap-1 active:scale-95"
                >
                  <Store className="w-3 h-3 text-blue-600" />
                  <span>Dukandar Demo</span>
                </button>
              </div>
            </div>

            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setErrorMsg('');
                }}
                className="text-[11px] text-blue-600 font-semibold"
              >
                {authMode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Login'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Navigation Bar */}
      <nav className="fixed bottom-3 left-4 right-4 max-w-md mx-auto z-40 bg-white/95 backdrop-blur-md rounded-3xl p-2 flex items-center justify-around border border-slate-200/90 shadow-xl shadow-slate-300/40">
        <button
          onClick={() => {
            setRole('customer');
            setActiveTab('explore');
          }}
          className={`p-3 rounded-2xl transition-all duration-200 active:scale-90 ${
            activeTab === 'explore' && role === 'customer'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Compass className="w-5 h-5" strokeWidth={2} />
        </button>

        <button
          onClick={() => {
            setRole('customer');
            setActiveTab('orders');
            loadCustomerOrders();
          }}
          className={`p-3 rounded-2xl transition-all duration-200 active:scale-90 relative ${
            activeTab === 'orders' && role === 'customer'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Package className="w-5 h-5" strokeWidth={2} />
          {customerOrders.length > 0 && customerOrders[0].status !== 'delivered' && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          )}
        </button>

        {/* Floating Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className={`p-3 rounded-2xl transition-all duration-200 active:scale-90 relative ${
            cartTotalItems > 0
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <ShoppingBag className="w-5 h-5" strokeWidth={2} />
          {cartTotalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm">
              {cartTotalItems}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            if (!currentUser || currentUser.role !== 'dukandar') {
              setAuthRole('dukandar');
              setIsAuthOpen(true);
              return;
            }
            setRole('dukandar');
            setActiveTab('dukandar_dashboard');
          }}
          className={`p-3 rounded-2xl transition-all duration-200 active:scale-90 ${
            role === 'dukandar'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Store className="w-5 h-5" strokeWidth={2} />
        </button>
      </nav>
    </div>
  );
}
