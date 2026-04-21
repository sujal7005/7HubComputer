import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaTrash, FaArrowLeft, FaPlus, FaMinus, FaCreditCard } from 'react-icons/fa';

const Cart = () => {
  const { cartItems, removeFromCart, clearCart, updateQuantity } = useContext(CartContext);
  const navigate = useNavigate();

  const totalPrice = Array.isArray(cartItems)
    ? cartItems.reduce((total, item) => {
        const price = item.finalPrice || item.price || item.totalPrice || 0;
        const quantity = item.quantity || 1;
        return total + price * quantity;
      }, 0)
    : 0;

  const BASE_URL = `http://${window.location.hostname}:4000`;

  const handleBuyNow = (product) => {
    navigate(`/payment`, { state: { product } });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const incrementQuantity = (id, quantity) => {
    if (quantity < 10) updateQuantity(id, quantity + 1);
  };

  const decrementQuantity = (id, quantity) => {
    if (quantity > 1) updateQuantity(id, quantity - 1);
  };

  const handleCheckout = () => {
    navigate('/checkout', { state: { cartItems, totalPrice } });
  };

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const filename = imagePath.split(/[\\/]/).pop();
    return `${BASE_URL}/uploads/${filename}`;
  };

  return (
    <div className="bg-white pt-24 md:pt-28 pb-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="border-b-2 border-black pb-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FaShoppingCart className="text-3xl text-black" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">Your Cart</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-2">
            Shopping Cart
          </h1>
          <p className="text-lg text-gray-600">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {/* Back Button - Mobile */}
        <button
          onClick={handleBack}
          className="lg:hidden flex items-center gap-2 text-gray-600 hover:text-black border-b border-black pb-1 mb-6 transition-colors"
        >
          <FaArrowLeft className="text-xs" /> Back
        </button>

        {cartItems.length === 0 ? (
          <div className="text-center border-4 border-black p-16 max-w-2xl mx-auto">
            <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-black mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-black text-white px-8 py-4 text-lg font-medium hover:bg-gray-800 transition-colors border-2 border-black"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cart Items - Left Column */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="border-4 border-black bg-white p-6 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    
                    {/* Product Image */}
                    <div className="md:w-1/4">
                      <div className="border-2 border-black p-4 bg-gray-50">
                        <img
                          src={getImageUrl(item.image?.[0])}
                          alt={item.name}
                          className="w-full h-32 object-contain"
                        />
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="md:w-3/4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-black mb-2">{item.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{item.description || item.category}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <FaTrash />
                        </button>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-baseline gap-3">
                          <span className="text-2xl font-bold text-black">
                            ₹{((item.finalPrice || item.price || item.totalPrice || 0) * (item.quantity || 1)).toLocaleString()}
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              ₹{(item.originalPrice * (item.quantity || 1)).toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center border-2 border-black">
                          <button
                            onClick={() => decrementQuantity(item.id, item.quantity)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <FaMinus className="text-xs" />
                          </button>
                          <span className="w-12 h-10 flex items-center justify-center border-x-2 border-black font-medium">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => incrementQuantity(item.id, item.quantity)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            disabled={item.quantity >= 10}
                          >
                            <FaPlus className="text-xs" />
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                        <button
                          onClick={() => handleBuyNow(item)}
                          className="flex-1 bg-black text-white py-3 px-4 text-sm font-medium hover:bg-gray-800 transition-colors border-2 border-black"
                        >
                          BUY NOW
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary - Right Column */}
            <div className="lg:col-span-1">
              <div className="border-4 border-black bg-white p-6 sticky top-28 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
                <h2 className="text-2xl font-bold text-black mb-6 border-b-2 border-black pb-3">
                  Order Summary
                </h2>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span className="font-medium text-black">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (GST)</span>
                    <span className="font-medium text-black">Included</span>
                  </div>
                  <div className="border-t-2 border-black pt-3 mt-3">
                    <div className="flex justify-between font-bold text-black text-lg">
                      <span>Total</span>
                      <span>₹{totalPrice.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Including all taxes</p>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white py-4 text-lg font-medium hover:bg-gray-800 transition-colors border-2 border-black mb-3 flex items-center justify-center gap-2"
                >
                  <FaCreditCard /> PROCEED TO CHECKOUT
                </button>

                <button
                  onClick={clearCart}
                  className="w-full bg-white text-red-500 py-3 text-sm font-medium hover:bg-red-50 transition-colors border-2 border-red-500"
                >
                  CLEAR CART
                </button>

                {/* Continue Shopping */}
                <div className="text-center mt-6">
                  <button
                    onClick={() => navigate('/products')}
                    className="text-sm text-gray-600 hover:text-black border-b border-black pb-0.5"
                  >
                    Continue Shopping →
                  </button>
                </div>

                {/* Accepted Payment Methods */}
                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                  <p className="text-xs text-gray-500 text-center mb-3">We Accept</p>
                  <div className="flex justify-center gap-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider border-2 border-gray-300 px-2 py-1">Visa</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider border-2 border-gray-300 px-2 py-1">Master</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider border-2 border-gray-300 px-2 py-1">UPI</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider border-2 border-gray-300 px-2 py-1">Rupay</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;