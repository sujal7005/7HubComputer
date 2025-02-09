import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import axios from 'axios';

const Payment = () => {
  const location = useLocation();
  const product = location.state?.product; // Retrieve product data from Cart
  const { cart } = useContext(CartContext);
  const [quantity, setQuantity] = useState(product.quantity || 1);
  const [step, setStep] = useState(1);
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
  });
  const [userAddresses, setUserAddresses] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [paymentStatus, setPaymentStatus] = useState({
    success: '',
    error: '',
  });
  const [confirmation, setConfirmation] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountedPrice, setDiscountedPrice] = useState(product?.originalPrice || 0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const loggedInUser = localStorage.getItem('user');
      if (!loggedInUser) return;

      try {
        const parsedUser = JSON.parse(loggedInUser);
        const userId = parsedUser?._id;

        if (!userId) return;

        const userResponse = await axios.get(`http://localhost:4000/api/users/${userId}`);
        const userData = userResponse.data;

        const addressResponse = await axios.get(`http://localhost:4000/api/users/${userId}/addresses`);
        const addresses = addressResponse.data;
        // console.log('User addresses:', addresses);

        setUserDetails((prev) => ({
          ...prev,
          name: userData?.name || '',
          email: userData?.email || '',
          phoneNumber: userData?.phoneNumber || '',
          address: addresses?.length > 0
            ? {
              line1: addresses[0].line1 || '',
              line2: addresses[0].line2 || '',
              city: addresses[0].city || '',
              state: addresses[0].state || '',
              zip: addresses[0].zip || ''
            }
            : { line1: '', line2: '', city: '', state: '', zip: '' },
        }));

        setUserAddresses(Array.isArray(addresses) ? addresses : []);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    // If the product is from the cart, update the quantity from the cart
    if (Array.isArray(cartItems) && cartItems.length > 0) {
      const cartProduct = cart.find((item) => item._id === product._id);
      if (cartProduct) {
        setQuantity(cartProduct.quantity);
      }
    }
  }, [cart, product]);

  const handleNextStep = () => {
    if (step === 1) {
      // Validate user details before proceeding
      if (!userDetails.name || !userDetails.email || !userDetails.phoneNumber || !userDetails.address) {
        alert('Please fill in all user details.');
        return;
      }
    } else if (step === 2) {
      // Validate payment method
      if (!paymentMethod) {
        alert('Please select a payment method.');
        return;
      }
      if (paymentMethod === 'creditCard' && (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv)) {
        alert('Please fill in all card details.');
        return;
      }
    }
    setStep((prevStep) => Math.min(prevStep + 1, 3));
  };

  const handlePreviousStep = () => setStep((prevStep) => Math.max(prevStep - 1, 1));

  const handleConfirmPayment = async () => {
    if (!userDetails.name || !userDetails.email || !userDetails.phoneNumber || !userDetails.address) {
      alert('All user details are required.');
      return;
    }

    if (!paymentMethod) {
      alert('Please select a payment method.');
      return;
    }
    if (paymentMethod === 'creditCard' && (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv)) {
      alert('Please fill in all card details.');
      return;
    }

    const loggedInUserId = localStorage.getItem('user');
    // console.log('Logged in user from localStorage:', loggedInUserId);

    const parsedUser = loggedInUserId ? JSON.parse(loggedInUserId) : null;
    // console.log('Parsed user:', parsedUser);

    const userWithUserId = {
      ...userDetails,
      userId: parsedUser ? parsedUser._id : null
    };

    if (!userWithUserId.userId) {
      alert('User is not logged in or userId is missing.');
      return;
    }

    const apiUrlMap = {
      paypal: '/api/create-paypal-order',
      creditCard: '/api/credit-card',
      gpay: '/api/google-pay',
      phonepay: '/api/phone-pay',
      paytm: '/api/paytm',
      netbanking: '/api/net-banking',
      cashOnDelivery: '/api/cash-on-delivery',
    };
    // Simulate payment confirmation

    try {
      const apiUrl = apiUrlMap[paymentMethod];
      if (!apiUrl) {
        setPaymentStatus({ error: 'Invalid payment method', success: '' });
        return;
      }

      const response = await fetch(`http://localhost:4000${apiUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderDetails: { product, userDetails: userWithUserId, quantity, } })
      });
      console.log('Sending data:', { product, userDetails: userWithUserId });

      if (response.ok) {
        setPaymentStatus({ success: 'Payment successful!', error: '' });
        navigate('/profile');
      } else {
        const error = await response.json();
        setPaymentStatus({ error: error.message || 'Payment failed.', success: '' });
      }
    } catch (err) {
      setPaymentStatus({ error: err.message, success: '' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,  // Update the specific field in the address object
      },
    }));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    setQuantity(newQuantity > 0 ? newQuantity : 1);
  };

  // Function to apply discount dynamically
  const applyDiscount = () => {
    if (discountCode.trim() === "") {
      setDiscountError("Please enter a discount code.");
      setDiscountApplied(false);
      return;
    }

    // Define random discount values dynamically
    const discountAmounts = [250, 500, 1000,]; // Add more values if needed
    const randomDiscount = discountAmounts[Math.floor(Math.random() * discountAmounts.length)];

    // Ensure the final price never goes below zero
    const newPrice = Math.max(product.originalPrice - randomDiscount, 0);

    setDiscountedPrice(newPrice);
    setDiscountAmount(randomDiscount);
    setDiscountApplied(true);
    setDiscountError("");
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800 text-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Payment Process</h2>

      {paymentStatus.success && (
        <div className="p-4 bg-green-500 text-white rounded">
          {paymentStatus.success}
        </div>
      )}
      {paymentStatus.error && (
        <div className="p-4 bg-red-500 text-white rounded">
          {paymentStatus.error}
        </div>
      )}

      {/* Display selected product details */}
      {product && (
        <div className="mb-6">
          <h3 className="text-xl font-bold">
            {product?.name || 'No Name Available'}
          </h3>
          <p>{product.description}</p>
          <p className="font-semibold">
            Price: ${discountApplied ? discountedPrice.toFixed(2) : (product.finalPrice * quantity).toFixed(2)}
          </p>
          {discountApplied && (
            <p className="text-green-400">Discount Applied: ₹{discountAmount} off 🎉</p>
          )}
          {/* {console.log(product)} */}
          {/* Quantity Display */}
          <label className="block mt-3">
            <span className="font-semibold">Quantity:</span>
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-16 ml-2 text-center border border-gray-500 rounded bg-gray-700 text-white"
              min="1"
            />
          </label>
        </div>
      )}

      {/* Step 1: User Details */}
      {step === 1 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Enter Your Details</h3>
          {['name', 'email', 'phoneNumber'].map((field) => (
            <input
              key={field}
              type={field === 'email' ? 'email' : 'text'}
              name={field}
              value={userDetails[field]}
              onChange={handleChange}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="p-2 border border-gray-500 rounded w-full mb-2 text-black"
            />
          ))}

          {/* Separate inputs for each address field */}
          {['line1', 'line2', 'city', 'state', 'zip'].map((field) => (
            <div key={field} className="mb-4">
              <label htmlFor={field} className="block text-sm font-medium text-white">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                id={field}
                type="text"
                name={field}
                value={userDetails.address?.[field] || ''}
                onChange={(e) => handleChange({ target: { name: field, value: e.target.value } })}
                placeholder={`Enter your ${field}`}
                className="p-2 border border-gray-500 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
          ))}

          <button onClick={handleNextStep} className="bg-blue-500 text-white p-2 rounded w-full mt-4">
            Next
          </button>
        </div>
      )}

      {/* Step 2: Payment Method Selection */}
      {step === 2 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Select Payment Method</h3>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="p-2 border border-gray-500 rounded w-full mb-4 text-black"
          >
            <option value="">Choose a payment method</option>
            <option value="creditCard">Credit Card</option>
            <option value="gpay">Google Pay</option>
            <option value="phonepay">Phone Pay</option>
            <option value="paytm">Paytm</option>
            <option value="paypal">PayPal</option>
            <option value="netbanking">Net Banking</option>
            <option value="cashOnDelivery">Cash on Delivery</option>
          </select>

          {paymentMethod === 'creditCard' && (
            <div>
              <input
                type="text"
                name="cardNumber"
                value={cardDetails.cardNumber}
                onChange={handleCardChange}
                placeholder="Card Number"
                className="p-2 border border-gray-500 rounded w-full mb-2 text-black"
              />
              <input
                type="text"
                name="expiryDate"
                value={cardDetails.expiryDate}
                onChange={handleCardChange}
                placeholder="Expiry Date (MM/YY)"
                className="p-2 border border-gray-500 rounded w-full mb-2 text-black"
              />
              <input
                type="text"
                name="cvv"
                value={cardDetails.cvv}
                onChange={handleCardChange}
                placeholder="CVV"
                className="p-2 border border-gray-500 rounded w-full mb-2 text-black"
              />
            </div>
          )}

          {/* Discount Code Section */}
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">Apply Discount Code</h3>
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Enter discount code"
              className="p-2 border border-gray-500 rounded w-full text-black"
            />
            <button
              onClick={applyDiscount}
              disabled={discountApplied} // Disable button after applying discount
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded w-full mt-2"
            >
              {discountApplied ? "Discount Applied" : "Apply Discount"}
            </button>
            {discountError && <p className="text-red-400 mt-2">{discountError}</p>}
            {discountApplied && (
              <p className="text-green-400 mt-2">
                Discount Applied! ₹{product.originalPrice - discountedPrice} off 🎉 New Price: ₹{discountedPrice.toFixed(2)}
              </p>
            )}
          </div>


          <div className="flex justify-between">
            <button onClick={handlePreviousStep} className="bg-gray-500 text-white p-2 rounded w-1/3">
              Back
            </button>
            <button onClick={handleNextStep} className="bg-blue-500 text-white p-2 rounded w-1/3">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm Payment */}
      {step === 3 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Confirm Purchase</h3>
          <p className="mb-2">Name: {userDetails.name}</p>
          <p className="mb-2">Email: {userDetails.email}</p>
          <p className="mb-2">Phone: {userDetails.phoneNumber}</p>
          <p className="mb-4">Payment Method: {paymentMethod}</p>
          {confirmation ? (
            <p className="text-green-500">Payment Confirmed!</p>
          ) : (
            <button onClick={handleConfirmPayment} className="bg-green-500 text-white p-2 rounded w-full">
              Confirm Payment
            </button>
          )}
          <button onClick={handlePreviousStep} className="bg-gray-500 text-white p-2 rounded w-full mt-2">
            Back
          </button>
        </div>
      )}
    </div>
  );
};

export default Payment;