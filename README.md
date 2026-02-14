# CuzDoor - Food Delivery App

A modern, responsive food delivery web application built with React, Vite, and Tailwind CSS. CuzDoor is designed for campus food delivery, allowing students to order food from various restaurants and hostels.

![CuzDoor Logo](my-cuzdoor-app/public/lightlogo.jpg)

## Features

### 🛒 Core Functionality
- **Food Browsing**: Browse restaurants and food items by category (Meals, Fast Food, Drinks, Desserts)
- **Search**: Find your favorite food or restaurants quickly
- **Shopping Cart**: Add/remove items, adjust quantities
- **Crazy Combos**: Special discounted combo deals

### 💳 Checkout & Payments
- **Multiple Payment Methods**: UPI Payment and Cash on Delivery
- **Coupon System**: Apply discount codes (STUDENT50, HOSTELNIGHT)
- **Bill Details**: View item total, discounts, and final amount

### 🎨 User Experience
- **Dark/Light Theme**: Toggle between dark and light modes
- **Responsive Design**: Works on mobile and desktop
- **WhatsApp Integration**: Chat directly with restaurants
- **Order Confirmation**: Visual feedback when order is placed

### 📍 Delivery
- **Location Selection**: Set delivery location (Hostel/Room number)
- **Customer Details**: Name, Hostel, and Phone number for delivery

## Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: JavaScript/JSX

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fooddevilery
```

2. Navigate to the project directory:
```bash
cd my-cuzdoor-app
```

3. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Create a production build:
```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
my-cuzdoor-app/
├── public/
│   ├── darklogo.jpg       # Dark theme logo
│   └── lightlogo.jpg      # Light theme logo
├── src/
│   ├── App.jsx            # Main application component
│   ├── index.css         # Global styles
│   └── main.jsx          # Entry point
├── index.html             # HTML template
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── postcss.config.js    # PostCSS configuration
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Key Components

### Theme Toggle
- Switch between dark and light modes
- Persists preference during session

### Food Categories
- All, Meals, Fast Food, Drinks, Desserts
- Animated category selection

### Cart System
- Add/remove items
- Quantity adjustment
- Real-time total calculation

### Coupons
- STUDENT50: ₹50 OFF on orders above ₹200
- HOSTELNIGHT: Flat ₹100 OFF on late night cravings

## Customization

### Adding New Food Items
Edit the `FOOD_ITEMS` array in `src/App.jsx`:
```javascript
const FOOD_ITEMS = [
  {
    id: 7,
    name: 'New Food Item',
    restaurant: 'Restaurant Name',
    price: 100,
    rating: 4.5,
    time: '20 min',
    category: 'Fast Food',
    image: 'image-url',
    description: 'Item description'
  },
];
```

### Adding New Categories
Edit the `CATEGORIES` array in `src/App.jsx`:
```javascript
const CATEGORIES = [
  { id: 6, name: 'New Category', icon: '🍕' },
];
```

### Modifying Coupons
Edit the `COUPONS` array in `src/App.jsx`:
```javascript
const COUPONS = [
  { id: 'NEWCoupon', code: 'NEWCoupon', discount: 75, desc: '₹75 OFF description' },
];
```

## Configuration

### Tailwind CSS
Customize colors, fonts, and more in `tailwind.config.js`

### Vite
Modify build options in `vite.config.js`

## Dependencies

### Production
- `react`: ^19.2.0
- `react-dom`: ^19.2.0
- `lucide-react`: ^0.554.0

### Development
- `vite`: ^7.2.5
- `tailwindcss`: ^3.4.8
- `eslint`: ^9.39.1

## License

This project is for educational/demonstration purposes.

## Screenshots

The app includes:
- Animated food category selection
- Combo deals with discounts
- Coupon carousel
- Cart with checkout flow
- Dark/Light theme toggle
- Order confirmation animation

---

Built with ❤️ using React + Vite + Tailwind CSS

