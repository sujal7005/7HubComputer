import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { CartProvider } from './context/CartContext';
import './index.css';

const stripePromise = loadStripe('your-publishable-key-from-stripe');
const clientId = "863030671533-t2ja342l6vmi58oqopqeoqtnjlfce0kh.apps.googleusercontent.com";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId={clientId}>
    <Elements stripe={stripePromise}>
      <Router>
        <CartProvider>
          <App />
        </CartProvider>
      </Router>
    </Elements>
  </GoogleOAuthProvider>
);