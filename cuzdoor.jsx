import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ShoppingCart, Moon, Sun, Home, Utensils, MessageCircle, Heart, DollarSign, MapPin, User, CreditCard, Phone } from 'lucide-react';

// --- Firebase Imports ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, addDoc, onSnapshot, collection, query, serverTimestamp, orderBy, getDoc, setDoc } from 'firebase/firestore';

// --- Utility Functions for Firebase ---
const APP_ID = typeof __app_id !== 'undefined' ? __app_id : 'cuzdoor-app';

// Helper function to get Firestore paths
const getPrivateCartRef = (db, userId) => doc(db, `artifacts/${APP_ID}/users/${userId}/cuzdoor_data/cart`);
const getPublicReviewsCollection = (db) => collection(db, `artifacts/${APP_ID}/public/data/cuzdoor_reviews`);

// --- Data Mockup ---
const createCourseOptions = (baseName) => Array.from({ length: 10 }, (_, i) => ({
    id: `${baseName}-${i}-${Math.random().toString(36).substring(2, 9)}`,
    name: `${baseName} Dish ${i + 1}`,
    price: (Math.random() * 8 + 5).toFixed(2), // Price between 5.00 and 13.00
    rating: (Math.random() * 2 + 3).toFixed(1), // Rating between 3.0 and 5.0
    description: `A delicious blend of fresh ingredients, perfectly spiced for a memorable meal.`,
    calories: Math.floor(Math.random() * 400 + 300)
}));

const mockRestaurants = [
    {
        id: 'r1',
        name: 'Curry Kingdom',
        cuisine: 'Indian',
        imageUrl: 'https://placehold.co/100x100/65A30D/ffffff?text=CK',
        menu: {
            'Starters': createCourseOptions('Samosa'),
            'Tandoori Grill': createCourseOptions('Kebab'),
            'Main Course': createCourseOptions('Curry'),
            'Bread & Rice': createCourseOptions('Naan'),
            'Desserts': createCourseOptions('Gulab Jamun'),
        },
    },
    {
        id: 'r2',
        name: 'Sushi Zen Garden',
        cuisine: 'Japanese',
        imageUrl: 'https://placehold.co/100x100/EA580C/ffffff?text=SZG',
        menu: {
            'Appetizers': createCourseOptions('Edamame'),
            'Nigiri': createCourseOptions('Salmon'),
            'Rolls': createCourseOptions('Tuna'),
            'Soups': createCourseOptions('Miso'),
            'Specials': createCourseOptions('Dragon Roll'),
        },
    },
    {
        id: 'r3',
        name: 'Burger Blast',
        cuisine: 'American',
        imageUrl: 'https://placehold.co/100x100/06B6D4/ffffff?text=BB',
        menu: {
            'Fries': createCourseOptions('Potato'),
            'Cheeseburgers': createCourseOptions('Beef Patty'),
            'Chicken Burgers': createCourseOptions('Chicken Patty'),
            'Milkshakes': createCourseOptions('Chocolate'),
            'Drinks': createCourseOptions('Soda'),
        },
    },
];

// --- Sub-Components ---

const Header = ({ theme, toggleTheme, setActiveTab, cartItemCount }) => {
    // Custom style for the logo to mimic the overlapping O's in the uploaded image
    const LogoStyle = {
        fontFamily: 'serif',
        fontSize: '1.8rem',
        fontWeight: 'bold',
        letterSpacing: '0.05em',
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md">
            <div className="container mx-auto p-4 flex justify-between items-center h-16">
                {/* Logo Section */}
                <div 
                    className="flex items-center space-x-2 cursor-pointer" 
                    onClick={() => setActiveTab('Home')}
                >
                    {/* Using the provided logo image names as sources for better visual resemblance */}
                    <img 
                        src={"/assets/logolight.jpg"} 
                        alt="Cuzdoor Logo" 
                        className="h-8 md:h-10 dark:hidden" 
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <img 
                        src={"/assets/logodark.jpg"} 
                        alt="Cuzdoor Logo (Dark)" 
                        className="h-8 md:h-10 hidden dark:block" 
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                    />
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex space-x-6">
                    {['Home', 'Restaurants', 'Reviews'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium relative"
                        >
                            {tab}
                        </button>
                    ))}
                </nav>

                {/* Controls (Cart & Theme) */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:ring-2 hover:ring-red-500 transition-all"
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    <button
                        onClick={() => setActiveTab('Cart')}
                        className="relative p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg"
                    >
                        <ShoppingCart size={20} />
                        {cartItemCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-yellow-400 text-xs font-bold text-gray-900">
                                {cartItemCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

const MobileToolbar = ({ activeTab, setActiveTab, cartItemCount }) => {
    const navItems = [
        { name: 'Home', icon: Home, tab: 'Home' },
        { name: 'Menu', icon: Utensils, tab: 'Restaurants' },
        { name: 'Reviews', icon: MessageCircle, tab: 'Reviews' },
        { name: 'Cart', icon: ShoppingCart, tab: 'Cart', count: cartItemCount },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <nav className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => setActiveTab(item.tab)}
                        className={`flex flex-col items-center justify-center p-2 text-sm transition-colors ${
                            activeTab === item.tab
                                ? 'text-red-600 dark:text-red-400 font-bold'
                                : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
                        }`}
                    >
                        <div className="relative">
                            <item.icon size={20} />
                            {item.count > 0 && item.tab === 'Cart' && (
                                <span className="absolute -top-1 -right-2 flex items-center justify-center h-4 w-4 rounded-full bg-yellow-400 text-xs font-bold text-gray-900">
                                    {item.count}
                                </span>
                            )}
                        </div>
                        <span className="mt-1">{item.name}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

const CartSidebar = ({ cart, setCart, setActiveTab, db, userId }) => {
    const [coupon, setCoupon] = useState('');
    const [discount, setDiscount] = useState(0);
    const [message, setMessage] = useState('');
    
    // NEW STATES for Checkout Details
    const [deliveryName, setDeliveryName] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryPhone, setDeliveryPhone] = useState(''); // State for phone number
    const [paymentType, setPaymentType] = useState('COD'); // Default to COD

    // Helper function to format Indian phone number (xxxxx xxxxx)
    const formatIndianPhoneNumber = (value) => {
        const digits = value.replace(/\D/g, '').substring(0, 10);
        let formatted = '';
        if (digits.length > 0) {
            formatted = digits.substring(0, 5);
        }
        if (digits.length > 5) {
            formatted += ' ' + digits.substring(5, 10);
        }
        return formatted;
    };

    const handlePhoneChange = (e) => {
        // Update state with formatted value, but validation uses raw digits
        setDeliveryPhone(e.target.value); 
    };

    const applyCoupon = () => {
        if (coupon.toUpperCase() === 'CUZDOOR20') {
            setDiscount(0.20);
            setMessage('Coupon Applied! 20% off your order.');
        } else {
            setDiscount(0);
            setMessage('Invalid or expired coupon.');
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalDiscount = subtotal * discount;
    const total = subtotal - totalDiscount;

    const updateQuantity = (id, change) => {
        setCart(prevCart => {
            const newCart = prevCart.map(item =>
                item.id === id ? { ...item, quantity: item.quantity + change } : item
            ).filter(item => item.quantity > 0);
            
            // Persist to Firestore
            if (db && userId) {
                setDoc(getPrivateCartRef(db, userId), { items: newCart })
                    .catch(e => console.error("Error updating cart:", e));
            }

            return newCart;
        });
    };

    const handleCheckout = () => {
        const rawPhone = deliveryPhone.replace(/\D/g, '');

        const showMessage = (text) => {
            const messageBox = document.getElementById('messageBox');
            const messageText = document.getElementById('messageText');
            if (messageBox && messageText) {
                messageText.textContent = text;
                messageBox.classList.remove('hidden', 'opacity-0');
                messageBox.classList.add('opacity-100');
                setTimeout(() => {
                    messageBox.classList.remove('opacity-100');
                    messageBox.classList.add('opacity-0');
                    setTimeout(() => messageBox.classList.add('hidden'), 300);
                }, 4000);
            }
        };
        
        if (cart.length === 0) {
            showMessage("Your plate is empty! Add some dishes first.");
            return;
        }

        // NEW VALIDATION for Phone Number
        if (!deliveryName.trim() || !deliveryAddress.trim() || !paymentType || rawPhone.length !== 10) {
            let errorMsg = "Please fill in all required fields.";
            if (rawPhone.length !== 10) {
                errorMsg = "Please enter a valid 10-digit Indian mobile number.";
            } else if (!deliveryName.trim()) {
                errorMsg = "Please enter your full name.";
            } else if (!deliveryAddress.trim()) {
                errorMsg = "Please enter your delivery address.";
            }
            showMessage(errorMsg);
            return;
        }

        // --- Successful Checkout Logic ---
        const orderSummary = {
            total: total.toFixed(2),
            name: deliveryName,
            phone: `+91 ${rawPhone}`,
            address: deliveryAddress,
            payment: paymentType,
            items: cart.map(item => ({ name: item.name, qty: item.quantity, price: item.price })),
            timestamp: new Date().toISOString()
        };
        
        console.log("Order Placed:", orderSummary);

        // Show success message with new details
        showMessage(`Order for ${deliveryName} Placed! Total: $${orderSummary.total} via ${paymentType}.`);

        // Reset state
        setCart([]);
        setDiscount(0);
        setCoupon('');
        setMessage('');
        setDeliveryName('');
        setDeliveryAddress('');
        setDeliveryPhone(''); // Reset phone
        setPaymentType('COD');

        // Persist empty cart
        if (db && userId) {
            setDoc(getPrivateCartRef(db, userId), { items: [] })
                .catch(e => console.error("Error clearing cart:", e));
        }
        setActiveTab('Home');
    };

    return (
        <div className="min-h-screen pt-24 pb-20 md:pb-8 p-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <h2 className="text-3xl font-extrabold text-red-600 dark:text-red-400 mb-6 border-b pb-2">Your Plate</h2>
            
            {cart.length === 0 ? (
                <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium">Your plate is empty!</p>
                    <p className="text-sm text-gray-500">Find delicious food in the Restaurants section.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Cart Items */}
                    <div className="space-y-4">
                        {cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md transition-shadow hover:shadow-lg">
                                <div className="flex-grow">
                                    <p className="font-semibold text-lg">{item.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.restaurantName}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="font-bold text-red-600 dark:text-red-400">${(item.price * item.quantity).toFixed(2)}</span>
                                    <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg transition-colors">
                                            -
                                        </button>
                                        <span className="p-2 font-medium w-6 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg transition-colors">
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>


                    {/* Delivery Details Section */}
                    <div className="pt-2">
                        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md space-y-4">
                            <h3 className="font-bold text-lg flex items-center text-red-600 dark:text-red-400"><MapPin size={20} className="mr-2"/>Delivery Details</h3>
                            
                            {/* Name Input */}
                            <input
                                type="text"
                                value={deliveryName}
                                onChange={(e) => setDeliveryName(e.target.value)}
                                placeholder="Your Full Name (Required)"
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-red-500 focus:border-red-500"
                            />

                            {/* Mobile Number Input (Indian Format) */}
                            <div className="mt-1 flex rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition duration-200">
                                
                                <span className="inline-flex items-center px-3 rounded-l-lg border-r border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm font-medium">
                                    <Phone size={16} className="mr-1" /> 🇮🇳 +91
                                </span>

                                <input 
                                    type="tel" 
                                    id="delivery-phone" 
                                    name="delivery-phone" 
                                    placeholder="Mobile Number (10 digits)"
                                    value={formatIndianPhoneNumber(deliveryPhone)}
                                    onChange={handlePhoneChange}
                                    className="flex-1 block w-full rounded-r-lg px-4 py-3 placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-0 focus:border-transparent text-base"
                                    required
                                    maxLength="12" // 10 digits + 1 space
                                />
                            </div>
                            
                            {/* Location Input */}
                            <input
                                type="text"
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                placeholder="Delivery Address (Required)"
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                    </div>

                    {/* Payment Method Section */}
                    <div>
                        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md space-y-3">
                            <h3 className="font-bold text-lg flex items-center text-red-600 dark:text-red-400"><CreditCard size={20} className="mr-2"/>Payment Method</h3>
                            <div className="flex flex-wrap gap-6 pt-1">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="COD"
                                        checked={paymentType === 'COD'}
                                        onChange={() => setPaymentType('COD')}
                                        className="form-radio text-red-600 h-5 w-5 border-gray-300 dark:border-gray-600 focus:ring-red-500"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">Cash on Delivery (COD)</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="UPI"
                                        checked={paymentType === 'UPI'}
                                        onChange={() => setPaymentType('UPI')}
                                        className="form-radio text-red-600 h-5 w-5 border-gray-300 dark:border-gray-600 focus:ring-red-500"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">UPI/Card (Online)</span>
                                </label>
                            </div>
                        </div>
                    </div>


                    {/* Coupon Section */}
                    <div className="mt-6 p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md space-y-3">
                        <h3 className="font-bold flex items-center"><DollarSign size={20} className="mr-2 text-green-500"/>Coupon Code</h3>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={coupon}
                                onChange={(e) => setCoupon(e.target.value)}
                                placeholder="Enter coupon code (e.g., CUZDOOR20)"
                                className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-red-500 focus:border-red-500"
                            />
                            <button
                                onClick={applyCoupon}
                                className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Apply
                            </button>
                        </div>
                        {message && (
                            <p className={`text-sm ${discount > 0 ? 'text-green-500' : 'text-red-500'}`}>{message}</p>
                        )}
                    </div>

                    {/* Totals Summary */}
                    <div className="mt-6 p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md space-y-3 font-semibold">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                            <span>Discount ({discount * 100}%):</span>
                            <span>- ${totalDiscount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl border-t pt-3 border-gray-300 dark:border-gray-700">
                            <span>Total:</span>
                            <span className="text-red-600 dark:text-red-400 font-extrabold">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        className="w-full mt-6 py-4 bg-red-600 text-white font-bold text-lg rounded-xl hover:bg-red-700 transition-transform transform hover:scale-[1.01] shadow-xl"
                    >
                        Place Order
                    </button>
                </div>
            )}
        </div>
    );
};


const HomePage = ({ setActiveTab }) => {
    return (
        <div className="min-h-screen pt-24 pb-20 md:pb-8 p-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
                    Hungry? <span className="text-red-600">We deliver.</span>
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                    Order from your favorite local restaurants today.
                </p>
            </div>

            {/* Featured Section (Placeholder) */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <div className="p-6 bg-red-100 dark:bg-red-900/50 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveTab('Restaurants')}>
                    <h3 className="text-2xl font-bold text-red-800 dark:text-red-300">Fast Delivery</h3>
                    <p className="mt-2 text-red-700 dark:text-red-400">Get your food in under 30 minutes, guaranteed.</p>
                </div>
                <div className="p-6 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                    <h3 className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">Daily Deals</h3>
                    <p className="mt-2 text-yellow-700 dark:text-yellow-400">Save up to 50% on selected meals every day.</p>
                </div>
                <div className="p-6 bg-blue-100 dark:bg-blue-900/50 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveTab('Reviews')}>
                    <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-300">Top Rated</h3>
                    <p className="mt-2 text-blue-700 dark:text-blue-400">Only the best restaurants with 4.5+ star reviews.</p>
                </div>
            </div>

            {/* Restaurant List Snippet */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Popular Restaurants</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mockRestaurants.slice(0, 3).map(restaurant => (
                    <div
                        key={restaurant.id}
                        className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                        onClick={() => setActiveTab('RestaurantDetail', { restaurantId: restaurant.id })}
                    >
                        <div className="p-5">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors">{restaurant.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{restaurant.cuisine}</p>
                            <div className="flex items-center mt-3 space-x-1">
                                <span className="text-yellow-500">★</span>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">4.7</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">(900+ reviews)</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-10">
                <button
                    onClick={() => setActiveTab('Restaurants')}
                    className="px-8 py-3 bg-red-600 text-white font-semibold rounded-full shadow-lg hover:bg-red-700 transition-all transform hover:scale-105"
                >
                    View All Restaurants
                </button>
            </div>
        </div>
    );
};

const RestaurantsPage = ({ setActiveTab }) => {
    return (
        <div className="min-h-screen pt-24 pb-20 md:pb-8 p-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <h2 className="text-3xl font-extrabold text-red-600 dark:text-red-400 mb-8 border-b pb-2">All Restaurants</h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mockRestaurants.map(restaurant => (
                    <div
                        key={restaurant.id}
                        className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 cursor-pointer group"
                        onClick={() => setActiveTab('RestaurantDetail', { restaurantId: restaurant.id })}
                    >
                        <div className="p-5">
                            <div className="flex items-center space-x-4">
                                <img 
                                    src={restaurant.imageUrl} 
                                    alt={restaurant.name} 
                                    className="w-16 h-16 rounded-full object-cover shadow-md"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/A3A3A3/ffffff?text=' + restaurant.name.substring(0, 2); }}
                                />
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors">{restaurant.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{restaurant.cuisine}</p>
                                </div>
                            </div>
                            <div className="flex items-center mt-3 space-x-1 text-sm">
                                <span className="text-yellow-500">★ 4.7</span>
                                <span className="text-gray-500 dark:text-gray-400"> | Est. Delivery: 35 min</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RestaurantDetail = ({ restaurant, cart, setCart, db, userId }) => {
    const [selectedCourse, setSelectedCourse] = useState(Object.keys(restaurant.menu)[0]);

    const addToCart = (dish) => {
        const itemExists = cart.find(item => item.id === dish.id);

        let newCart;
        if (itemExists) {
            newCart = cart.map(item =>
                item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        } else {
            newCart = [...cart, { 
                ...dish, 
                quantity: 1, 
                restaurantId: restaurant.id, 
                restaurantName: restaurant.name 
            }];
        }
        setCart(newCart);
        
        // Persist to Firestore
        if (db && userId) {
            setDoc(getPrivateCartRef(db, userId), { items: newCart })
                .catch(e => console.error("Error saving cart to Firestore:", e));
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-20 md:pb-8 p-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            {/* Scrollbar hide utility added here (custom CSS trick) */}
            <style>
                {`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                    .scrollbar-hide {
                        -ms-overflow-style: none;  /* IE and Edge */
                        scrollbar-width: none;  /* Firefox */
                    }
                `}
            </style>
            
            {/* Restaurant Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-8">
                <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">{restaurant.name}</h2>
                <p className="text-xl text-red-600 dark:text-red-400 mt-1">{restaurant.cuisine}</p>
                <div className="flex items-center mt-3 space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <p className="flex items-center text-yellow-500 font-semibold">★ 4.7</p>
                    <p>• Fast Delivery</p>
                </div>
            </div>

            {/* Course Navigation */}
            <div className="sticky top-[64px] z-30 bg-gray-100 dark:bg-gray-800 py-3 shadow-lg border-b border-red-600/30 -mx-4 px-4 md:-mx-8 md:px-8">
                <div className="flex space-x-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {Object.keys(restaurant.menu).map(course => (
                        <button
                            key={course}
                            onClick={() => setSelectedCourse(course)}
                            className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-200 flex-shrink-0 
                                ${selectedCourse === course 
                                    ? 'bg-red-600 text-white shadow-xl ring-4 ring-red-300 dark:ring-red-800' 
                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-red-600'
                                }`}
                        >
                            {course}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Items */}
            <div className="mt-8 space-y-6">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white border-b-2 border-red-600/50 pb-2">
                    {selectedCourse}
                </h3>
                
                {restaurant.menu[selectedCourse].map(dish => (
                    <div key={dish.id} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg transition-transform hover:shadow-xl hover:translate-y-[-2px]">
                        <div className="flex-grow">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white">{dish.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{dish.description}</p>
                            <div className="flex items-center space-x-3 mt-2 text-sm">
                                <span className="text-yellow-500 font-semibold">★ {dish.rating}</span>
                                <span className="text-gray-500 dark:text-gray-400">{dish.calories} cal</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-4 md:mt-0">
                            <span className="text-2xl font-extrabold text-red-600 dark:text-red-400">${dish.price}</span>
                            <button
                                onClick={() => addToCart(dish)}
                                className="px-6 py-2 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition-colors shadow-md flex items-center"
                            >
                                <Utensils size={18} className="mr-2"/> Add to Plate
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ReviewsPage = ({ db, userId, reviews }) => {
    const [newReview, setNewReview] = useState('');
    const [rating, setRating] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newReview.trim()) {
            setMessage("Please write a review before submitting.");
            return;
        }

        if (!db || !userId) {
            setMessage("Authentication error. Cannot submit review.");
            return;
        }

        setIsSubmitting(true);
        setMessage('');

        try {
            await addDoc(getPublicReviewsCollection(db), {
                userId: userId,
                text: newReview,
                rating: rating,
                createdAt: serverTimestamp(),
            });
            setNewReview('');
            setRating(5);
            setMessage("Review submitted successfully!");
        } catch (e) {
            console.error("Error adding review: ", e);
            setMessage("Failed to submit review. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-20 md:pb-8 p-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <h2 className="text-3xl font-extrabold text-red-600 dark:text-red-400 mb-8 border-b pb-2">Customer Reviews</h2>

            {/* Review Submission Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-10">
                <h3 className="text-xl font-bold mb-4">Leave a Review</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <label className="font-medium">Rating:</label>
                        <select
                            value={rating}
                            onChange={(e) => setRating(parseInt(e.target.value))}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        >
                            {[5, 4, 3, 2, 1].map(r => (
                                <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                            ))}
                        </select>
                    </div>
                    <textarea
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        placeholder="Share your experience..."
                        rows="4"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-red-500 focus:border-red-500"
                    ></textarea>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors disabled:bg-red-400"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
                {message && <p className={`mt-3 text-sm ${message.includes('success') ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Your User ID (for debugging): {userId || 'Authenticating...'}
                </p>
            </div>

            {/* Display Reviews */}
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">What People Are Saying ({reviews.length})</h3>
                {reviews.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 italic">Be the first to leave a review!</p>
                ) : (
                    reviews.map((review, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border-l-4 border-red-600 dark:border-red-400">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center space-x-2">
                                    <Heart size={18} className="text-red-500"/>
                                    <span className="font-semibold">{review.userId.substring(0, 8)}...</span>
                                </div>
                                <div className="text-yellow-500 font-bold">
                                    {Array(review.rating).fill('★').join('')}
                                </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 italic">"{review.text}"</p>
                            <p className="text-xs text-right text-gray-400 mt-2">
                                {review.createdAt ? new Date(review.createdAt.toDate()).toLocaleDateString() : 'Loading Date...'}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};


// --- Message Box Component ---
const MessageBox = () => (
    <div 
        id="messageBox" 
        className="fixed bottom-24 md:bottom-8 left-1/2 transform -translate-x-1/2 hidden opacity-0 bg-gray-800 text-white p-3 rounded-xl shadow-2xl z-[100] transition-opacity duration-300"
    >
        <p id="messageText" className="font-semibold"></p>
    </div>
);


// --- Main App Component ---

const App = () => {
    // --- State & Context ---
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [activeTab, setActiveTabState] = useState('Home');
    const [cart, setCart] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [detailParams, setDetailParams] = useState(null);

    // Firebase state
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    // Function to handle tab navigation, including detail view parameters
    const setActiveTab = useCallback((tab, params = null) => {
        setDetailParams(params);
        setActiveTabState(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Effect for Theme Management
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    // --- Firebase Initialization and Auth ---
    useEffect(() => {
        const firebaseConfig = typeof __firebase_config !== 'undefined'
            ? JSON.parse(__firebase_config)
            : null;

        if (firebaseConfig) {
            try {
                const app = initializeApp(firebaseConfig);
                const firestoreDb = getFirestore(app);
                const firebaseAuth = getAuth(app);

                setDb(firestoreDb);
                setAuth(firebaseAuth);

                const initialAuth = async () => {
                    try {
                        const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
                        if (token) {
                            await signInWithCustomToken(firebaseAuth, token);
                        } else {
                            await signInAnonymously(firebaseAuth);
                        }
                    } catch (error) {
                        console.error("Firebase Auth Error:", error);
                        // Fallback to anonymous sign-in if custom token fails
                        await signInAnonymously(firebaseAuth);
                    }
                };
                initialAuth();

                const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
                    if (user) {
                        setUserId(user.uid);
                    } else {
                        setUserId(crypto.randomUUID());
                    }
                    setIsAuthReady(true);
                });

                return () => unsubscribe();

            } catch (e) {
                console.error("Firebase initialization failed:", e);
                setIsAuthReady(true);
            }
        } else {
            // No firebase config available, run in mock mode
            setIsAuthReady(true);
        }
    }, []);

    // --- Firestore Data Listeners (Reviews and Cart) ---
    useEffect(() => {
        if (!isAuthReady || !db || !userId) return;

        // 1. Listen for Reviews (Public Data)
        const reviewsQuery = query(getPublicReviewsCollection(db), orderBy('createdAt', 'desc'));
        const unsubscribeReviews = onSnapshot(reviewsQuery, (snapshot) => {
            const fetchedReviews = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt // Keep the timestamp object for date conversion
            }));
            setReviews(fetchedReviews);
        }, (error) => console.error("Error fetching reviews:", error));

        // 2. Listen for Cart (Private Data)
        const cartRef = getPrivateCartRef(db, userId);
        const unsubscribeCart = onSnapshot(cartRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().items) {
                setCart(docSnap.data().items);
            } else {
                setCart([]);
                // Create the document if it doesn't exist to ensure onSnapshot works
                setDoc(cartRef, { items: [] }, { merge: true }).catch(e => console.error("Error initializing cart:", e));
            }
        }, (error) => console.error("Error fetching cart:", error));


        return () => {
            unsubscribeReviews();
            unsubscribeCart();
        };
    }, [isAuthReady, db, userId]);

    // Derived State
    const cartItemCount = useMemo(() => cart.reduce((count, item) => count + item.quantity, 0), [cart]);

    const renderContent = () => {
        switch (activeTab) {
            case 'Home':
                return <HomePage setActiveTab={setActiveTab} />;
            case 'Restaurants':
                return <RestaurantsPage setActiveTab={setActiveTab} />;
            case 'RestaurantDetail':
                const restaurant = mockRestaurants.find(r => r.id === detailParams.restaurantId);
                return restaurant ? (
                    <RestaurantDetail 
                        restaurant={restaurant} 
                        cart={cart} 
                        setCart={setCart} 
                        db={db} 
                        userId={userId} 
                    />
                ) : <HomePage setActiveTab={setActiveTab} />; // Fallback
            case 'Reviews':
                return <ReviewsPage db={db} userId={userId} reviews={reviews} />;
            case 'Cart':
                return <CartSidebar cart={cart} setCart={setCart} setActiveTab={setActiveTab} db={db} userId={userId} />;
            default:
                return <HomePage setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div className="min-h-screen antialiased bg-gray-50 dark:bg-gray-900 transition-colors">
            <Header
                theme={theme}
                toggleTheme={toggleTheme}
                setActiveTab={setActiveTab}
                cartItemCount={cartItemCount}
            />

            <main>
                {renderContent()}
            </main>

            <MobileToolbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                cartItemCount={cartItemCount}
            />
            
            {/* Custom message box for alerts */}
            <MessageBox />
        </div>
    );
};

export default App;