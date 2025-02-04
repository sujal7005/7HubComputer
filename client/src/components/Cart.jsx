import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, removeFromCart, clearCart, updateQuantity } = useContext(CartContext);
  const navigate = useNavigate();

  const totalPrice = Array.isArray(cartItems)
    ? cartItems.reduce((total, item) => {
      const price = item.price || item.totalPrice || 0;
      const quantity = item.quantity || 1;
      return total + price * quantity;
    }, 0)
    : 0;

  const handleBuyNow = (product) => {
    navigate(`/payment/`, { state: { product } });
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

  return (
    <div className="cart p-8 bg-gray-100 rounded-lg shadow-lg max-w-6xl mx-auto mt-10">
      <button
        onClick={handleBack}
        className="block sm:hidden text-blue-600 font-semibold mb-6"
      >
        &larr; Back
      </button>

      {/* Cart Title */}
      <h2 className="text-3xl font-bold mb-6 text-center mb-10 text-gray-700">Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          {/* Cart Items List */}
          <ul className="space-y-6">
            {cartItems.map((item, index) => (
              <li
                key={`${item.id}-${index}`}
                className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-lg shadow-sm"
              >

                {/* Item Details and Image */}
                <div className="flex flex-col md:flex-row items-center md:w-3/4">
                  <img
                    src={`http://localhost:5000/uploads/${item.image[0].split('\\').pop()}`}
                    alt={item.name}
                    loading='lazy'
                    className="h-24 w-24 object-cover rounded-md mr-6 mb-4 md:mb-0"
                  />
                  <div className="text-center md:text-left">
                    <span className="block font-bold text-lg text-gray-700">{item.name}</span>
                    <span className="block text-sm text-gray-500 mt-1">{item.description}</span>
                  </div>
                </div>

                {/* Quantity and Actions */}
                <div className="flex flex-col md:flex-row md:space-x-6 items-center md:w-1/4 mt-4 md:mt-0 flex-wrap max-w-full">
                  <span className="font-semibold text-lg text-gray-800">
                    ${(item.price || item.totalPrice * item.quantity).toFixed(2)}
                  </span>
                  <div className="flex items-center mt-2 md:mt-0 space-x-2">
                    <button
                      onClick={() => decrementQuantity(item.id, item.quantity)}
                      className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="px-3 text-lg font-semibold">{item.quantity || 1}</span>
                    <button
                      onClick={() => incrementQuantity(item.id, item.quantity)}
                      className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove and Buy Now Buttons */}
                  <div className="flex flex-col items-center md:items-start space-y-2 md:space-y-0 md:flex-row md:space-x-4 mt-4 md:mt-0 w-full">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 font-semibold mt-3 md:mt-0 hover:underline"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => handleBuyNow(item)}
                      className="px-5 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 w-full md:w-auto"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Total Price and Clear Cart Button */}
          <div className="mt-12 text-center md:text-right">
            <h3 className="text-2xl font-bold text-gray-700">Total: ${totalPrice.toFixed(2)}</h3>
            <button
              onClick={clearCart}
              className="mt-6 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600"
            >
              Clear Cart
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;