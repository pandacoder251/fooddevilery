import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, 
  Search, 
  User, 
  Home, 
  Moon, 
  Sun, 
  Plus, 
  Minus, 
  ChevronRight, 
  Star, 
  Clock,
  Flame,
  Utensils,
  Banknote,
  CreditCard,
  X,
  CheckCircle,
  Phone,
  Building,
  MessageCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

// --- Mock Data ---

const RESTAURANT_PHONE = "919876543210"; // Default for demo

const CATEGORIES = [
  { id: 1, name: 'All', icon: '🍽️' },
  { id: 2, name: 'Meals', icon: '🍛' },
  { id: 3, name: 'Fast Food', icon: '🍔' },
  { id: 4, name: 'Drinks', icon: '🥤' },
  { id: 5, name: 'Desserts', icon: '🍩' },
];

const COMBOS = [
  {
    id: 101,
    name: 'Burger & Coke Blast',
    items: 'Spicy Chicken Burger + Cold Coffee',
    price: 160,
    originalPrice: 180,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=500&q=60',
    rating: 4.9
  },
  {
    id: 102,
    name: 'Student Saver Thali',
    items: 'Mini Thali + Sweet Lassi',
    price: 120,
    originalPrice: 150,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=500&q=60',
    rating: 4.7
  }
];

const FOOD_ITEMS = [
  {
    id: 1,
    name: 'Spicy Chicken Burger',
    restaurant: 'Cafeteria Grill',
    price: 120,
    rating: 4.5,
    time: '20 min',
    category: 'Fast Food',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60',
    description: 'Crispy chicken patty with spicy mayo and jalapenos.'
  },
  {
    id: 2,
    name: 'Deluxe Veg Thali',
    restaurant: 'Mess Hall A',
    price: 150,
    rating: 4.8,
    time: '35 min',
    category: 'Meals',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=60',
    description: 'Complete meal with paneer, dal, rice, roti and sweet.'
  },
  {
    id: 3,
    name: 'Cheesy Pepperoni Pizza',
    restaurant: 'Pizza Corner',
    price: 299,
    rating: 4.7,
    time: '40 min',
    category: 'Fast Food',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=60',
    description: 'Loaded with extra cheese and spicy pepperoni.'
  },
  {
    id: 4,
    name: 'Masala Dosa',
    restaurant: 'South Canteen',
    price: 80,
    rating: 4.6,
    time: '15 min',
    category: 'Meals',
    image: 'https://images.unsplash.com/photo-1589301760014-d929645636c9?auto=format&fit=crop&w=500&q=60',
    description: 'Crispy crepe filled with potato masala, served with chutney.'
  },
  {
    id: 5,
    name: 'Cold Coffee',
    restaurant: 'Brew Station',
    price: 60,
    rating: 4.4,
    time: '10 min',
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=500&q=60',
    description: 'Thick and creamy cold coffee topped with chocolate powder.'
  },
  {
    id: 6,
    name: 'Chocolate Brownie',
    restaurant: 'Sweet Tooth',
    price: 90,
    rating: 4.9,
    time: '5 min',
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=60',
    description: 'Gooey chocolate brownie served warm.'
  }
];

const COUPONS = [
  { id: 'STUDENT50', code: 'STUDENT50', discount: 50, desc: '₹50 OFF on orders above ₹200' },
  { id: 'HOSTELNIGHT', code: 'HOSTELNIGHT', discount: 100, desc: 'Flat ₹100 OFF on late night cravings' },
];

// --- Components ---

const ThemeToggle = ({ isDark, toggle }) => (
  <button 
    onClick={toggle}
    className={`p-2 rounded-full transition-all duration-500 hover:rotate-12 ${isDark ? 'bg-gray-800 text-yellow-400' : 'bg-yellow-100 text-orange-600'}`}
  >
    {isDark ? <Sun size={20} /> : <Moon size={20} />}
  </button>
);

const AddToPlateButton = ({ count, onAdd, onRemove }) => {
  if (count === 0) {
    return (
      <button 
        onClick={onAdd}
        className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg hover:bg-orange-600 active:scale-90 transition-all duration-300 flex items-center gap-1"
      >
        ADD <Plus size={14} strokeWidth={3} />
      </button>
    );
  }
  return (
    <div className="flex items-center bg-orange-500 text-white rounded-full px-1 py-1 shadow-lg animate-in fade-in zoom-in duration-300">
      <button onClick={onRemove} className="p-1 hover:bg-orange-600 rounded-full active:scale-75 transition-transform"><Minus size={14} strokeWidth={3} /></button>
      <span className="px-3 font-bold text-sm min-w-[1.5rem] text-center">{count}</span>
      <button onClick={onAdd} className="p-1 hover:bg-orange-600 rounded-full active:scale-75 transition-transform"><Plus size={14} strokeWidth={3} /></button>
    </div>
  );
};

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [cart, setCart] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [location, setLocation] = useState('Select Location');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [animationKey, setAnimationKey] = useState(0); 
  const [logoError, setLogoError] = useState(false); // New state to handle logo fallback safely
  
  // Customer Details State
  const [userDetails, setUserDetails] = useState({
    name: '',
    hostel: '',
    phone: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [activeTab, selectedCategory]);

  // Reset logo error when theme changes to try loading the new logo
  useEffect(() => {
    setLogoError(false);
  }, [isDark]);

  // Derived State
  const cartItems = useMemo(() => {
    const items = Object.entries(cart).map(([id, count]) => {
      const item = FOOD_ITEMS.find(f => f.id === parseInt(id)) || COMBOS.find(c => c.id === parseInt(id));
      return { ...item, count };
    }).filter(i => i.count > 0 && i.name); // Ensure item exists
    return items;
  }, [cart]);

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.count), 0);
  const discount = appliedCoupon ? (appliedCoupon.discount) : 0;
  const finalTotal = Math.max(0, cartTotal - discount);

  // Handlers
  const addToCart = (id) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const newCount = (prev[id] || 0) - 1;
      if (newCount <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newCount };
    });
  };

  const openWhatsApp = (itemName, restaurant) => {
      const text = `Hi ${restaurant}! I'm interested in ordering ${itemName}. Is it available?`;
      const url = `https://wa.me/${RESTAURANT_PHONE}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' && !/^\d*$/.test(value)) return;
    setUserDetails(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCheckout = () => {
    const errors = {};
    if (!userDetails.name.trim()) errors.name = 'Name is required';
    if (!userDetails.hostel.trim()) errors.hostel = 'Hostel No. is required';
    if (!userDetails.phone.trim()) {
      errors.phone = 'Phone Number is required';
    } else if (userDetails.phone.length !== 10) {
      errors.phone = 'Enter valid 10-digit number';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setOrderPlaced(true);
    setLocation(`${userDetails.hostel}, ${userDetails.name}`);
    
    setTimeout(() => {
      setOrderPlaced(false);
      setCart({});
      setActiveTab('home');
      setAppliedCoupon(null);
    }, 3000);
  };

  const filteredFood = FOOD_ITEMS.filter(item => {
    const matchesCategory = selectedCategory === 'All' || 
                          (selectedCategory === 'Meals' && item.category === 'Meals') ||
                          (selectedCategory === 'Fast Food' && item.category === 'Fast Food') ||
                          item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.restaurant.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Styles based on theme
  const themeClasses = isDark 
    ? "bg-gray-900 text-gray-100" 
    : "bg-gray-50 text-gray-800";

  const cardClasses = isDark 
    ? "bg-gray-800 border-gray-700" 
    : "bg-white border-gray-100 shadow-sm";

  const inputClasses = `w-full p-3 rounded-xl border outline-none transition-all ${isDark ? 'bg-gray-700 border-gray-600 focus:border-orange-500 text-white' : 'bg-gray-50 border-gray-200 focus:border-orange-500 text-gray-900'}`;

  return (
    <div className={`min-h-screen pb-20 font-sans transition-colors duration-300 ${themeClasses}`}>
      
      {/* --- Header --- */}
      <div className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 flex justify-between items-center shadow-sm backdrop-blur-md ${isDark ? 'bg-gray-900/90' : 'bg-white/90'}`}>
        <div className="flex flex-col items-start animate-in slide-in-from-top duration-500">
            {/* Logo Image Handling */}
            <div className="h-8 mb-1 flex items-center">
               {!logoError && (
                   <img 
                      src={isDark ? "/public/darklogo.jpg" : "/public/lightlogo.jpg"} 
                      alt="Cuzdoor Logo" 
                      className="h-full w-auto object-contain"
                      onError={() => setLogoError(true)}
                    />
               )}
            </div>
            
            <div 
                className="flex items-center gap-1 text-xs font-medium opacity-80 cursor-pointer hover:text-orange-500 transition-colors"
                onClick={() => setActiveTab('cart')}
            >
                <MapPin size={12} className="text-red-500" />
                <span className="truncate max-w-[150px]">{location}</span>
            </div>
        </div>
        <ThemeToggle isDark={isDark} toggle={() => setIsDark(!isDark)} />
      </div>
      
      <div className="h-20"></div>

      {/* --- Main Content Area --- */}
      <main className="px-4 pt-2 overflow-x-hidden">
        
        {activeTab === 'home' && (
          <div key={animationKey} className="space-y-6">
            
            {/* Search Bar */}
            <div className={`relative rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top duration-700 ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Search 'Burger' or 'Cafeteria'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full py-3 pl-12 pr-4 outline-none ${isDark ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-transparent text-gray-800'}`}
              />
            </div>

            {/* Categories with Staggered Animation */}
            <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                <div className="flex gap-4">
                    {CATEGORIES.map((cat, idx) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.name === 'All' ? 'All' : cat.name)}
                            style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
                            className={`flex flex-col items-center gap-2 min-w-[70px] transition-all animate-in slide-in-from-right fade-in duration-500 ${selectedCategory === cat.name ? 'scale-110' : 'opacity-60'}`}
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-md transition-colors ${selectedCategory === cat.name ? 'bg-orange-500 text-white' : (isDark ? 'bg-gray-800' : 'bg-white')}`}>
                                {cat.name === 'All' ? <Utensils size={24}/> : cat.icon}
                            </div>
                            <span className="text-xs font-medium">{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Best Selling Combos (New Section) */}
             <div className="space-y-3 animate-in fade-in duration-1000 delay-150 fill-mode-both">
                <div className="flex justify-between items-center px-1">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <Sparkles size={18} className="text-yellow-500 fill-yellow-500"/> Crazy Combos
                    </h2>
                    <span className="text-orange-500 text-xs font-bold flex items-center">See All <ArrowRight size={12}/></span>
                </div>
                
                <div className="overflow-x-auto -mx-4 px-4 pb-4 scrollbar-hide">
                    <div className="flex gap-4">
                        {COMBOS.map((combo, idx) => (
                            <div 
                                key={combo.id}
                                style={{ animationDelay: `${idx * 100 + 200}ms` }} 
                                className={`relative min-w-[280px] p-3 rounded-2xl border flex gap-3 animate-in zoom-in fade-in slide-in-from-right duration-700 fill-mode-both ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}
                            >
                                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 relative">
                                    <img src={combo.image} alt={combo.name} className="w-full h-full object-cover" />
                                    <div className="absolute top-0 left-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg">
                                        SAVE ₹{combo.originalPrice - combo.price}
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <h3 className="font-bold text-sm leading-tight mb-1">{combo.name}</h3>
                                        <p className="text-[10px] opacity-60 line-clamp-2">{combo.items}</p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-xs text-gray-400 line-through mr-1">₹{combo.originalPrice}</span>
                                            <span className="font-bold text-base">₹{combo.price}</span>
                                        </div>
                                        <AddToPlateButton 
                                            count={cart[combo.id] || 0} 
                                            onAdd={() => addToCart(combo.id)}
                                            onRemove={() => removeFromCart(combo.id)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Coupons Carousel */}
            <div className="overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
                <div className="flex gap-4">
                    {COUPONS.map((coupon, idx) => (
                        <div 
                            key={coupon.id} 
                            style={{ animationDelay: `${idx * 100 + 400}ms` }}
                            className="relative min-w-[260px] p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-right duration-700 fill-mode-both"
                        >
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                            <h3 className="font-bold text-lg flex items-center gap-2"><Flame size={18} className="fill-yellow-300 text-yellow-300 animate-pulse"/> {coupon.code}</h3>
                            <p className="text-xs opacity-90 mt-1">{coupon.desc}</p>
                            <button 
                                onClick={() => setAppliedCoupon(coupon)}
                                className="mt-3 bg-white text-orange-600 px-3 py-1 rounded-lg text-xs font-bold shadow-sm active:scale-95 transition-transform hover:shadow-md"
                            >
                                {appliedCoupon?.id === coupon.id ? 'APPLIED' : 'TAP TO APPLY'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Food List with Staggered Entry */}
            <div className="space-y-4 pb-8">
                <h2 className="font-bold text-xl flex items-center gap-2 animate-in fade-in duration-500">
                    Popular Near You <span className="text-orange-500 text-xs font-normal bg-orange-100 px-2 py-0.5 rounded-full">Fast Delivery</span>
                </h2>
                
                {filteredFood.map((item, idx) => (
                    <div 
                        key={item.id} 
                        style={{ animationDelay: `${idx * 100 + 500}ms` }}
                        className={`flex gap-4 p-3 rounded-2xl group transition-all hover:shadow-md animate-in slide-in-from-bottom-4 fade-in duration-700 fill-mode-both ${cardClasses}`}
                    >
                        <div className="relative w-28 h-28 flex-shrink-0 overflow-hidden rounded-xl">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute bottom-1 left-1 bg-white/90 backdrop-blur text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm text-gray-800">
                                <Clock size={10} /> {item.time}
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold leading-tight">{item.name}</h3>
                                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                        {item.rating} <Star size={8} fill="currentColor" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{item.restaurant}</p>
                                
                                {/* WhatsApp Integration */}
                                <button 
                                    onClick={() => openWhatsApp(item.name, item.restaurant)}
                                    className="flex items-center gap-1 text-[10px] text-green-600 font-bold mt-2 px-2 py-1 bg-green-50 rounded-full w-fit hover:bg-green-100 transition-colors"
                                >
                                    <MessageCircle size={12} /> Chat with Restaurant
                                </button>
                            </div>
                            <div className="flex justify-between items-end mt-2">
                                <span className="font-bold text-lg">₹{item.price}</span>
                                <AddToPlateButton 
                                    count={cart[item.id] || 0} 
                                    onAdd={() => addToCart(item.id)}
                                    onRemove={() => removeFromCart(item.id)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* --- Cart Tab --- */}
        {activeTab === 'cart' && (
            <div key="cart" className="space-y-6 min-h-[60vh] animate-in slide-in-from-bottom-8 duration-500">
                <h2 className="font-bold text-2xl">Your Plate</h2>
                
                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 opacity-50 animate-in fade-in zoom-in duration-500">
                        <Utensils size={64} className="mb-4 text-gray-300" />
                        <p>Your plate is empty!</p>
                        <button onClick={() => setActiveTab('home')} className="mt-4 text-orange-500 font-bold">Browse Food</button>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom duration-500">
                        <div className={`rounded-2xl p-4 space-y-4 mb-4 ${cardClasses}`}>
                            {cartItems.map((item, idx) => (
                                <div key={item.id} className="flex justify-between items-center border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-200"></div>
                                        <div>
                                            <p className="font-bold text-sm">{item.name}</p>
                                            <p className="text-xs opacity-60">₹{item.price} x {item.count}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="font-bold text-sm">₹{item.price * item.count}</p>
                                        <AddToPlateButton 
                                            count={item.count}
                                            onAdd={() => addToCart(item.id)}
                                            onRemove={() => removeFromCart(item.id)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                         {/* Delivery Details Form */}
                        <div className={`rounded-2xl p-5 space-y-4 mb-4 ${cardClasses}`}>
                            <h3 className="font-bold text-sm uppercase tracking-wider opacity-50 mb-1">Delivery Details</h3>
                            <div className="relative">
                                <div className="absolute left-3 top-3.5 opacity-50"><User size={18} /></div>
                                <input type="text" name="name" placeholder="Your Name" value={userDetails.name} onChange={handleInputChange} className={`${inputClasses} pl-10 ${formErrors.name ? 'border-red-500' : ''}`} />
                                {formErrors.name && <p className="text-red-500 text-[10px] mt-1 ml-1">{formErrors.name}</p>}
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-3.5 opacity-50"><Building size={18} /></div>
                                <input type="text" name="hostel" placeholder="Hostel No. / Room No." value={userDetails.hostel} onChange={handleInputChange} className={`${inputClasses} pl-10 ${formErrors.hostel ? 'border-red-500' : ''}`} />
                                {formErrors.hostel && <p className="text-red-500 text-[10px] mt-1 ml-1">{formErrors.hostel}</p>}
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-3.5 opacity-50"><Phone size={18} /></div>
                                <div className="absolute left-10 top-3.5 opacity-50 font-medium text-sm border-r pr-2 border-gray-400 h-5 flex items-center">+91</div>
                                <input type="tel" name="phone" maxLength="10" placeholder="Phone Number" value={userDetails.phone} onChange={handleInputChange} className={`${inputClasses} pl-24 ${formErrors.phone ? 'border-red-500' : ''}`} />
                                {formErrors.phone && <p className="text-red-500 text-[10px] mt-1 ml-1">{formErrors.phone}</p>}
                            </div>
                        </div>

                        {/* Bill Details */}
                        <div className={`rounded-2xl p-5 space-y-3 mb-4 ${cardClasses}`}>
                            <h3 className="font-bold text-sm uppercase tracking-wider opacity-50 mb-2">Bill Details</h3>
                            <div className="flex justify-between text-sm"><span>Item Total</span><span>₹{cartTotal}</span></div>
                            <div className="flex justify-between text-sm text-green-500"><span>Discount {appliedCoupon && `(${appliedCoupon.code})`}</span><span>- ₹{discount}</span></div>
                            <div className="flex justify-between text-sm"><span>Delivery Fee</span><span className="text-green-500">Free</span></div>
                            <div className="border-t border-dashed border-gray-300 my-2"></div>
                            <div className="flex justify-between font-bold text-lg"><span>To Pay</span><span>₹{finalTotal}</span></div>
                        </div>

                        {/* Payment Method */}
                        <div className={`rounded-2xl p-5 space-y-3 ${cardClasses}`}>
                            <h3 className="font-bold text-sm uppercase tracking-wider opacity-50 mb-2">Payment Method</h3>
                            <div onClick={() => setPaymentMethod('upi')} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'upi' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-transparent bg-gray-100 dark:bg-gray-700'}`}>
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"><CreditCard size={20} className="text-blue-600" /></div>
                                <div className="flex-1"><p className="font-bold text-sm">UPI Payment</p><p className="text-[10px] opacity-60">GooglePay, PhonePe, Paytm</p></div>
                                {paymentMethod === 'upi' && <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white"></div>}
                            </div>
                            <div onClick={() => setPaymentMethod('cod')} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-transparent bg-gray-100 dark:bg-gray-700'}`}>
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"><Banknote size={20} className="text-green-600" /></div>
                                <div className="flex-1"><p className="font-bold text-sm">Cash on Delivery</p><p className="text-[10px] opacity-60">Pay at your door</p></div>
                                {paymentMethod === 'cod' && <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white"></div>}
                            </div>
                        </div>
                        
                        {/* Place Order Bar */}
                        <div className="h-20"></div> 
                        <div className={`fixed bottom-20 left-4 right-4 p-4 rounded-2xl shadow-2xl flex items-center justify-between z-40 ${isDark ? 'bg-gray-800' : 'bg-gray-900 text-white'}`}>
                            <div><p className="text-xs opacity-70 uppercase">Total</p><p className="font-bold text-xl">₹{finalTotal}</p></div>
                            <button onClick={handleCheckout} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg transform transition-all active:scale-95">Place Order</button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* --- Profile Tab (Simplified for visual consistency) --- */}
        {activeTab === 'profile' && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 opacity-60 animate-in fade-in zoom-in duration-500">
                <User size={48} />
                <p>User Profiles coming soon!</p>
                <button onClick={() => setActiveTab('home')} className="text-orange-500 font-bold">Go Home</button>
            </div>
        )}

      </main>

      {/* --- Bottom Navigation Bar --- */}
      <div className={`fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around z-50 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-[0_-5px_10px_rgba(0,0,0,0.02)]'}`}>
        {[
          { id: 'home', icon: Home, label: 'Home' },
          { id: 'cart', icon: Utensils, label: 'Plate', badge: cartItems.reduce((a,c) => a+c.count, 0) },
          { id: 'profile', icon: User, label: 'Profile' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${activeTab === tab.id ? 'text-orange-500 -translate-y-1' : (isDark ? 'text-gray-500' : 'text-gray-400')}`}
          >
            <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : ''}`}/>
            {tab.badge > 0 && (
                <span className="absolute top-2 right-[25%] w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold border-2 border-white dark:border-gray-900 animate-in zoom-in duration-300">
                    {tab.badge}
                </span>
            )}
          </button>
        ))}
      </div>

      {/* --- Modals & Overlays --- */}
      {showLocationInput && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`w-full max-w-sm p-6 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 ${cardClasses}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Set Delivery Location</h3>
                    <button onClick={() => setShowLocationInput(false)}><X size={20} /></button>
                </div>
                <div className="space-y-3">
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={`w-full p-3 rounded-xl border outline-none focus:border-orange-500 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`} />
                    <button onClick={() => setShowLocationInput(false)} className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold mt-2 hover:bg-orange-600 active:scale-95 transition-transform">Confirm Location</button>
                </div>
            </div>
        </div>
      )}

      {orderPlaced && (
        <div className="fixed inset-0 bg-green-500 z-[70] flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
            <CheckCircle size={80} className="mb-4 animate-bounce" />
            <h2 className="text-3xl font-bold mb-2 animate-in slide-in-from-bottom duration-500 delay-100">Order Placed!</h2>
            <p className="opacity-90 animate-in slide-in-from-bottom duration-500 delay-200">Delivering to: {userDetails.name}</p>
            <p className="opacity-80 text-sm mt-1 animate-in slide-in-from-bottom duration-500 delay-300">at {userDetails.hostel}</p>
        </div>
      )}
    </div>
  );
}