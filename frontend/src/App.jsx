import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedShop, setSelectedShop] = useState(INITIAL_SHOPS[0]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

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
        status: 'placed',
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

    setDukandarShop((prev) => ({
      ...prev,
      revenue: prev.revenue + cartTotalPrice,
      orders: [newOrder, ...prev.orders],
    }));
  };

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
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-900 max-w-md mx-auto shadow-xl relative select-none pb-24">
      {/* Light Mode Clean Top Header */}
      <header className="sticky top-0 z-30 px-4 py-3.5 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 active:scale-95 transition-transform">
            <ShoppingBag className="w-5 h-5 text-white" strokeWidth={2.2} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/60">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-medium text-slate-800">Hyperlocal</span>
          </div>
        </div>

        {/* Role Toggle Switch: Customer vs Dukandar */}
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
      </header>

      {/* CUSTOMER STOREFRONT VIEW (LIGHT THEME) */}
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

          {/* Clean Light Category Strip */}
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

          {/* Active Order Live Tracker Banner (Light Mode) */}
          {activeOrder && (
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-blue-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  {activeOrder.status === 'delivered' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : activeOrder.status === 'out_for_delivery' ? (
                    <Truck className="w-5 h-5 text-blue-600 animate-bounce" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {activeOrder.orderNumber}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize font-medium">
                      {activeOrder.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold mt-0.5">
                    <KeyRound className="w-3 h-3" />
                    <span className="font-mono tracking-widest">{activeOrder.otp}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          )}

          {/* Nearby Local Stores Strip (Light Theme) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Local Stores</span>
              <span className="text-xs font-semibold text-blue-600">{INITIAL_SHOPS.length} Available</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {INITIAL_SHOPS.map((shop) => {
                const ShopIcon = shop.icon;
                const isSelected = selectedShop.id === shop.id;
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
                        <ShopIcon className="w-5 h-5" strokeWidth={1.8} />
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
                        <span className="font-medium text-slate-700">{shop.rating}</span>
                      </div>
                      <span>{shop.distance}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shop Catalog (Products - Light Theme) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider text-slate-600 uppercase">{selectedShop.name}</span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    selectedShop.isOpen ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {selectedShop.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              <span className="text-xs text-slate-500">{selectedShop.products.length} Items</span>
            </div>

            <div className="space-y-2.5">
              {selectedShop.products.map((product) => {
                const cartItem = cart[product.id];
                const qty = cartItem ? cartItem.quantity : 0;
                const ProdIcon = product.icon || ShoppingBag;

                return (
                  <div
                    key={product.id}
                    className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
                        <ProdIcon className="w-6 h-6" strokeWidth={1.7} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{product.name}</div>
                        <div className="text-xs text-slate-500">{product.unit}</div>
                        <div className="text-xs font-bold text-blue-600 mt-0.5">₹{product.price}</div>
                      </div>
                    </div>

                    {/* Quantity Selector: Minus / Plus Line Icons */}
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
        </main>
      )}

      {/* DUKANDAR DASHBOARD VIEW (LIGHT THEME) */}
      {role === 'dukandar' && (
        <main className="flex-1 px-4 pt-3.5 space-y-5 animate-fadeIn">
          {/* Dukandar Header & Live 1-Tap Power Switch */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-blue-600 font-bold">Store Dashboard</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{dukandarShop.name}</div>
              </div>
              {/* 1-Tap Open / Close Switch */}
              <button
                onClick={() =>
                  setDukandarShop((prev) => ({
                    ...prev,
                    isOpen: !prev.isOpen,
                  }))
                }
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
                <div className="text-[11px] text-slate-500 font-medium">Total Sales</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">₹{dukandarShop.revenue}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium">Active Orders</div>
                <div className="text-base font-bold text-blue-600 mt-0.5">{dukandarShop.orders.length}</div>
              </div>
            </div>
          </div>

          {/* Incoming Orders Queue */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Incoming Dispatch Orders</span>
              <span className="text-xs font-semibold text-blue-600">Realtime</span>
            </div>

            <div className="space-y-3">
              {dukandarShop.orders.map((ord) => (
                <div key={ord.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{ord.orderNumber}</span>
                      <span className="text-[10px] text-slate-400">{ord.time}</span>
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
                          {it.name} x {it.qty}
                        </span>
                        <span className="font-medium text-slate-800">₹{it.price * it.qty}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-medium">Amount Due</span>
                    <span className="font-bold text-slate-900">₹{ord.total}</span>
                  </div>

                  {/* Order State Transition Actions */}
                  {ord.status === 'placed' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'packing')}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-blue-600/20"
                    >
                      <Box className="w-4 h-4" />
                      <span>Pack Order</span>
                    </button>
                  )}

                  {ord.status === 'packing' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'out_for_delivery')}
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
              ))}
            </div>
          </div>
        </main>
      )}

      {/* Slide-Up Bottom Cart Drawer (Light Mode) */}
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
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-95 transition-all"
            >
              <span>Instant Local Delivery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Light Mode Bottom Bar */}
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
          }}
          className={`p-3 rounded-2xl transition-all duration-200 active:scale-90 relative ${
            activeTab === 'orders' && role === 'customer'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Package className="w-5 h-5" strokeWidth={2} />
          {activeOrder && activeOrder.status !== 'delivered' && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          )}
        </button>

        {/* Floating Cart Button with Counter Badge */}
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
