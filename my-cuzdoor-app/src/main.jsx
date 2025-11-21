import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // 1. Imports your main application component
import './index.css';              // 2. Imports the global CSS (where Tailwind is configured)

// This line finds the <div id="root"> element in index.html and tells React 
// to render the entire application (the <App /> component) inside it.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);