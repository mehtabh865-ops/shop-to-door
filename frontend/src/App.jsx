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
  ShieldCheck,
  Power,
  ChevronRight,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  Bell,
  Heart,
  Star,
  Milk,
  Apple,
  Pill,
  Shirt,
  Smartphone,
  Coffee,
  CheckCircle2,
  Clock,
  LogOut
} from 'lucide-react';

// Default mock hyperlocal shops for immediate offline/standalone demo
const INITIAL_SHOPS = [
  {
    id: 'shop-1',
    name: 'Kirana 24/7',
    category: 'grocery',
    icon: ShoppingBag,
    rating: 4.9,
    distance: '0.4 km',
    isOpen: true,
    products: [
      { id: 'p1', name: 'Wheat Flour', unit: '5 kg', price: 240, icon: Sparkles },
      { id: 'p2', name: 'Fresh Milk', unit: '1 L', price: 65, icon: Milk },
      { id: 'p3', name: 'Organic Butter', unit: '500 g', price: 275, icon: Milk },
      { id: 'p4', name: 'Arabica Coffee', unit: '200 g', price: 320, icon: Coffee },
    ],
  },
  {
    id: 'shop-2',
    name: 'Fresh Harvest',
    category: 'veggies',
    icon: Apple,
    rating: 4.8,
    distance: '0.8 km',
    isOpen: true,
    products: [
      { id: 'p5', name: 'Farm Apples', unit: '1 kg', price: 160, icon: Apple },
      { id: 'p6', name: 'Ripe Bananas', unit: '1 Dozen', price: 60, icon: Apple },
      { id: 'p7', name: 'Fresh Tomatoes', unit: '1 kg', price: 40, icon: Apple },
    ],
  },
  {
    id: 'shop-3',
    name: 'Pulse Pharmacy',
    category: 'pharmacy',
    icon: Pill,
    rating: 5.0,
    distance: '1.2 km',
    isOpen: true,
    products: [
      { id: 'p8', name: 'First Aid Kit', unit: '1 Box', price: 450, icon: Pill },
      { id: 'p9', name: 'Vitamin C 500mg', unit: '30 Tabs', price: 180, icon: Pill },
    ],
  },
  {
    id: 'shop-4',
    name: 'Tech Depot',
    category: 'tech',
    icon: Smartphone,
    rating: 4.7,
    distance: '1.5 km',
    isOpen: false,
    products: [
      { id: 'p10', name: 'Fast Charger 65W', unit: '1 Pc', price: 899, icon: Smartphone },
      { id: 'p11', name: 'Braided Type-C Cable', unit: '1 Pc', price: 299, icon: Smartphone },
    ],
  },
];

export default function App() {
  const [role, setRole] = useState('customer'); // 'customer' | 'dukandar'
  const [activeTab, setActiveTab] = useState('explore'); // explore | orders | cart | profile
  const [selectedShop, setSelectedShop] = useState(INITIAL_SHOPS[0]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState({}); // { productId: { product, quantity, shopId } }
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userToken, setUserToken] = useState(localStorage.getItem('std_token') || null);
  const [userPhone, setUserPhone] = useState('');

  // Dukandar state
  const [dukandarShop, setDukandarShop] = useState({
    name: 'My Store',
    isOpen: true,
    revenue: 4920,
    orders: [
      {
        id: 'ord-892',
        orderNumber: 'STD-892',
        items: [{ name: 'Wheat Flour', qty: 2, price: 240 }, { name: 'Fresh Milk', qty: 1, price: 65 }],
        total: 545,
        status: 'placed', // placed -> accepted -> packing -> out_for_delivery -> delivered
        otp: '4821',
        time: 'Just now',
      },
      {
        id: 'ord-891',
        orderNumber: 'STD-891',
        items: [{ name: 'Organic Butter', qty: 1, price: 275 }],
        total: 275,
        status: 'out_for_delivery',
        otp: '9142',
        time: '12m ago',
      },
    ],
  });

  const [otpInput, setOtpInput] = useState('');

  // Cart actions
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

  // Place order
  const handleCheckout = () => {
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const newOrder = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      orderNumber: `STD-${Date.now().toString().slice(-4)}`,
      items: Object.values(cart).map((c) => ({ name: c.product.name, qty: c.quantity, price: c.product.price })),
      total: cartTotalPrice,
      status: 'placed',
      otp: generatedOtp,
      time: 'Just now',
    };
    setActiveOrder(newOrder);
    setCart({});
    setIsCartOpen(false);
    setActiveTab('orders');

    // Also inject into Dukandar's live queue if same shop
    setDukandarShop((prev) => ({
      ...prev,
      revenue: prev.revenue + cartTotalPrice,
      orders: [newOrder, ...prev.orders],
    }));
  };

  // Dukandar status transition
  const handleUpdateStatus = (orderId, nextStatus) => {
    setDukandarShop((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)),
    }));
    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder((prev) => ({ ...prev, status: nextStatus }));
    }
  };

  const handleVerifyOtp = (orderId) => {
    const ord = dukandarShop.orders.find((o) => o.id === orderId);
    if (ord && ord.otp === otpInput) {
      handleUpdateStatus(orderId, 'delivered');
      setOtpInput('');
    } else {
      alert('Invalid OTP');
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
    <div className="flex flex-col min-h-screen bg-[#090a0f] text-slate-100 max-w-md mx-auto shadow-2xl relative select-none pb-24">
      {/* Top Floating Glass Navigation Header */}
      <header className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between glass border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 active:scale-95 transition-transform">
            <ShoppingBag className="w-5 h-5 text-white" strokeWidth={2.2} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-medium text-slate-200">Hyperlocal</span>
          </div>
        </div>

        {/* Role Toggle Switch: Customer Icon vs Dukandar Icon */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => {
              setRole('customer');
              setActiveTab('explore');
            }}
            className={`p-2 rounded-xl transition-all duration-300 ${
              role === 'customer'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" strokeWidth={2.2} />
          </button>
          <button
            onClick={() => {
              setRole('dukandar');
              setActiveTab('dukandar_dashboard');
            }}
            className={`p-2 rounded-xl transition-all duration-300 ${
              role === 'dukandar'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" strokeWidth={2.2} />
          </button>
        </div>
      </header>

      {/* CUSTOMER STOREFRONT VIEW */}
      {role === 'customer' && (
        <main className="flex-1 px-4 pt-3 space-y-5 animate-fadeIn">
          {/* Minimalist Search Bar with Line Icon */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search local stores & items..."
              className="w-full bg-[#12141c] border border-white/5 rounded-2xl py-2.5 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/50 transition-colors"
            />
            <SlidersHorizontal className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-500" strokeWidth={2} />
          </div>

          {/* Icon-Only Category Strip */}
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
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 border-0'
                      : 'glass text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <IconComp className="w-5 h-5" strokeWidth={2} />
                </button>
              );
            })}
          </div>

          {/* Active Order Live Tracker Banner (If customer placed order) */}
          {activeOrder && (
            <div className="glass-card p-3.5 rounded-2xl border-l-4 border-l-sky-500 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                  {activeOrder.status === 'delivered' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : activeOrder.status === 'out_for_delivery' ? (
                    <Truck className="w-5 h-5 text-sky-400 animate-bounce" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      {activeOrder.orderNumber}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 capitalize">
                      {activeOrder.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-sky-400 mt-0.5">
                    <KeyRound className="w-3 h-3" />
                    <span className="font-mono tracking-widest">{activeOrder.otp}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </div>
          )}

          {/* Nearby Local Stores Strip */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Local Stores</span>
              <span className="text-xs text-sky-400">{INITIAL_SHOPS.length} Available</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {INITIAL_SHOPS.map((shop) => {
                const ShopIcon = shop.icon;
                const isSelected = selectedShop.id === shop.id;
                return (
                  <div
                    key={shop.id}
                    onClick={() => setSelectedShop(shop)}
                    className={`p-3.5 rounded-2xl glass transition-all duration-200 active:scale-95 cursor-pointer relative overflow-hidden ${
                      isSelected ? 'border-sky-500/60 shadow-lg shadow-sky-500/10 bg-[#161a28]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sky-400">
                        <ShopIcon className="w-5 h-5" strokeWidth={1.8} />
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          shop.isOpen ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-rose-500'
                        }`}
                      />
                    </div>
                    <div className="font-medium text-sm text-slate-200 truncate">{shop.name}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{shop.rating}</span>
                      </div>
                      <span>{shop.distance}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shop Catalog (Products) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{selectedShop.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    selectedShop.isOpen ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {selectedShop.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              <span className="text-xs text-slate-400">{selectedShop.products.length} Items</span>
            </div>

            <div className="space-y-2.5">
              {selectedShop.products.map((product) => {
                const cartItem = cart[product.id];
                const qty = cartItem ? cartItem.quantity : 0;
                const ProdIcon = product.icon || ShoppingBag;

                return (
                  <div
                    key={product.id}
                    className="p-3 rounded-2xl glass flex items-center justify-between active:scale-[0.99] transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-300">
                        <ProdIcon className="w-6 h-6" strokeWidth={1.7} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-200">{product.name}</div>
                        <div className="text-xs text-slate-500">{product.unit}</div>
                        <div className="text-xs font-bold text-sky-400 mt-0.5">₹{product.price}</div>
                      </div>
                    </div>

                    {/* Quantity Selector: Minus / Plus Line Icons */}
                    <div className="flex items-center gap-2 bg-[#0d0f17] px-2 py-1.5 rounded-xl border border-white/5">
                      {qty > 0 && (
                        <>
                          <button
                            onClick={() => removeFromCart(product.id)}
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 active:scale-90"
                          >
                            <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
                          </button>
                          <span className="font-semibold text-xs text-slate-200 w-4 text-center">{qty}</span>
                        </>
                      )}
                      <button
                        onClick={() => addToCart(product, selectedShop.id)}
                        className="w-7 h-7 rounded-lg bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center active:scale-90 shadow-md shadow-sky-500/20"
                      >
                        <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* DUKANDAR (STORE OWNER) DASHBOARD VIEW */}
      {role === 'dukandar' && (
        <main className="flex-1 px-4 pt-3 space-y-5 animate-fadeIn">
          {/* Dukandar Header & Live 1-Tap Power Switch */}
          <div className="p-4 rounded-3xl glass-card relative overflow-hidden border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-indigo-400 font-semibold">Store Dashboard</div>
                <div className="text-lg font-bold text-slate-100 mt-0.5">{dukandarShop.name}</div>
              </div>
              {/* 1-Tap Open / Close Switch */}
              <button
                onClick={() =>
                  setDukandarShop((prev) => ({
                    ...prev,
                    isOpen: !prev.isOpen,
                  }))
                }
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl transition-all duration-300 active:scale-90 shadow-lg ${
                  dukandarShop.isOpen
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                <Power className="w-4 h-4" strokeWidth={2.5} />
                <span className="text-xs font-bold">{dukandarShop.isOpen ? 'LIVE' : 'CLOSED'}</span>
              </button>
            </div>

            {/* Quick Stats Tiles */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/5">
              <div className="bg-white/5 p-3 rounded-2xl">
                <div className="text-[11px] text-slate-400">Total Sales</div>
                <div className="text-base font-bold text-slate-100 mt-0.5">₹{dukandarShop.revenue}</div>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl">
                <div className="text-[11px] text-slate-400">Active Orders</div>
                <div className="text-base font-bold text-indigo-400 mt-0.5">{dukandarShop.orders.length}</div>
              </div>
            </div>
          </div>

          {/* Incoming Orders Queue */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Incoming Dispatch Orders</span>
              <span className="text-xs text-indigo-400">Realtime</span>
            </div>

            <div className="space-y-3">
              {dukandarShop.orders.map((ord) => (
                <div key={ord.id} className="p-4 rounded-2xl glass border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-200">{ord.orderNumber}</span>
                      <span className="text-[10px] text-slate-500">{ord.time}</span>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                        ord.status === 'delivered'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : ord.status === 'out_for_delivery'
                          ? 'bg-sky-500/10 text-sky-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {ord.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {it.name} x {it.qty}
                        </span>
                        <span>₹{it.price * it.qty}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <span className="text-slate-400">Amount Due</span>
                    <span className="font-bold text-slate-100">₹{ord.total}</span>
                  </div>

                  {/* Order State Transition Actions */}
                  {ord.status === 'placed' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'packing')}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-indigo-600/20"
                    >
                      <Box className="w-4 h-4" />
                      <span>Pack Order</span>
                    </button>
                  )}

                  {ord.status === 'packing' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'out_for_delivery')}
                      className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-sky-500/20"
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
                        className="flex-1 bg-[#12141c] border border-white/10 rounded-xl px-3 py-2 text-xs text-center font-mono tracking-widest text-slate-100 focus:outline-none focus:border-emerald-500"
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
              ))}
            </div>
          </div>
        </main>
      )}

      {/* Slide-Up Bottom Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-[#12141c] rounded-t-3xl p-5 border-t border-white/10 max-w-md mx-auto w-full animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-sky-400" />
                <span className="font-semibold text-sm text-slate-100">Checkout Items</span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 max-h-60 overflow-y-auto space-y-2.5">
              {Object.values(cart).map((item) => (
                <div key={item.product.id} className="flex items-center justify-between text-xs text-slate-300">
                  <span>
                    {item.product.name} ({item.quantity})
                  </span>
                  <span className="font-bold text-slate-100">₹{item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-sm mb-4">
              <span className="text-slate-400">Total Payable</span>
              <span className="text-base font-bold text-sky-400">₹{cartTotalPrice}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
            >
              <span>Instant Local Delivery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Glass Island (Fixed Tab Navigation) */}
      <nav className="fixed bottom-3 left-4 right-4 max-w-md mx-auto z-40 glass rounded-3xl p-2 flex items-center justify-around border border-white/10 shadow-2xl">
        <button
          onClick={() => {
            setRole('customer');
            setActiveTab('explore');
          }}
          className={`p-3 rounded-2xl transition-all duration-200 active:scale-90 ${
            activeTab === 'explore' && role === 'customer'
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-5 h-5" strokeWidth={2} />
        </button>

        <button
          onClick={() => {
            setRole('customer');
            setActiveTab('orders');
          }}
          className={`p-3 rounded-2xl transition-all duration-200 active:scale-90 relative ${
            activeTab === 'orders' && role === 'customer'
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-5 h-5" strokeWidth={2} />
          {activeOrder && activeOrder.status !== 'delivered' && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>

        {/* Floating Cart Button with Counter Badge */}
        <button
          onClick={() => setIsCartOpen(true)}
          className={`p-3 rounded-2xl transition-all duration-200 active:scale-90 relative ${
            cartTotalItems > 0
              ? 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30'
              : 'text-slate-400 hover:text-white'
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
            setRole('dukandar');
            setActiveTab('dukandar_dashboard');
          }}
          className={`p-3 rounded-2xl transition-all duration-200 active:scale-90 ${
            role === 'dukandar'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Store className="w-5 h-5" strokeWidth={2} />
        </button>
      </nav>
    </div>
  );
}
