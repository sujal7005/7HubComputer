import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import axios from 'axios';
import { FaCreditCard, FaGooglePay, FaPhone, FaMoneyBill, FaArrowLeft, FaArrowRight, FaCheck, FaTag } from 'react-icons/fa';
import { SiPaytm, SiPaypal, SiRazorpay } from 'react-icons/si';

const BASE_URL = `http://${window.location.hostname}:4000`;

const Payment = () => {
  const location = useLocation();
  const product = location.state?.product;
  const { cart } = useContext(CartContext);
  const [quantity, setQuantity] = useState(product?.quantity || 1);
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
  const [selectedRam, setSelectedRam] = useState(null);
  const [selectedStorage1, setSelectedStorage1] = useState(null);
  const [selectedStorage2, setSelectedStorage2] = useState(null);
  const [discountedPrice, setDiscountedPrice] = useState(product?.finalPrice);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [userWithUserId, setUserWithUserId] = useState(null);
  const navigate = useNavigate();

  // Add Razorpay state
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [razorpayOrder, setRazorpayOrder] = useState(null);

  // Helper function to get image URL dynamically
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('data:')) return imagePath;
    
    // Handle different path formats
    const filename = imagePath.split(/[\\/]/).pop();
    return `${BASE_URL}/uploads/${filename}`;
  };

  // Helper function to get the main product image
  const getProductImage = (product) => {
    if (!product) return '';
    
    // If product has images array
    if (product.images && product.images.length > 0) {
      return getImageUrl(product.images[0]);
    }
    
    // If product has image array
    if (product.image && product.image.length > 0) {
      return getImageUrl(product.image[0]);
    }
    
    // If product has single image field
    if (product.imageUrl) {
      return getImageUrl(product.imageUrl);
    }
    
    // Fallback placeholder image
    return '/api/placeholder/200/200';
  };

  // Helper function to get all product images
  const getAllProductImages = (product) => {
    if (!product) return [];
    
    const images = [];
    
    if (product.images && Array.isArray(product.images)) {
      images.push(...product.images.map(img => getImageUrl(img)));
    }
    
    if (product.image && Array.isArray(product.image)) {
      images.push(...product.image.map(img => getImageUrl(img)));
    }
    
    if (product.imageUrl && !images.includes(getImageUrl(product.imageUrl))) {
      images.push(getImageUrl(product.imageUrl));
    }
    
    return images.length > 0 ? images : ['/api/placeholder/200/200'];
  };

  useEffect(() => {
    const loggedInUserId = localStorage.getItem('user');
    const parsedUser = loggedInUserId ? JSON.parse(loggedInUserId) : null;
    
    const newUserWithId = {
      ...userDetails,
      userId: parsedUser ? parsedUser._id : null
    };
    
    console.log('Setting userWithUserId:', newUserWithId);
    setUserWithUserId(newUserWithId);
  }, [userDetails]);

  useEffect(() => {
    console.log('paypalLoaded state changed:', paypalLoaded);
  }, [paypalLoaded]);

  useEffect(() => {
    console.log('paymentMethod changed:', paymentMethod);
    console.log('step changed:', step);
  }, [paymentMethod, step]);

  // Auto-initialize PayPal when script loads and user is on step 3 with PayPal selected
  useEffect(() => {
    if (paypalLoaded && paymentMethod === 'paypal' && step === 3 && userWithUserId?.userId) {
      console.log('Auto-initializing PayPal with user:', userWithUserId);
      setTimeout(() => {
        initializePayPalButtons(userWithUserId);
      }, 100);
    }
  }, [paypalLoaded, paymentMethod, step, userWithUserId]);

  useEffect(() => {
    const fetchUserData = async () => {
      const loggedInUser = localStorage.getItem('user');
      if (!loggedInUser) return;

      try {
        const parsedUser = JSON.parse(loggedInUser);
        const userId = parsedUser?._id;

        if (!userId) return;

        const userResponse = await axios.get(`${BASE_URL}/api/users/${userId}`);
        const userData = userResponse.data;

        const addressResponse = await axios.get(`${BASE_URL}/api/users/${userId}/addresses`);
        const addresses = addressResponse.data;

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
    if (Array.isArray(cartItems) && cartItems.length > 0) {
      const cartProduct = cart.find((item) => item._id === product._id);
      if (cartProduct) {
        setQuantity(cartProduct.quantity);
      }
    }
  }, [cart, product]);

  // Load PayPal script when PayPal is selected
  useEffect(() => {
    if (paymentMethod === 'paypal' && step === 3) {
      console.log('Attempting to load PayPal script...');
      if (!paypalLoaded) {
        loadPayPalScript();
      } else {
        console.log('PayPal already loaded');
      }
    }
  }, [paymentMethod, step, paypalLoaded]);

  const calculateTotalPrice = () => {
    let basePrice = product?.finalPrice || 0;

    if (discountApplied) {
      basePrice -= discountAmount;
    }
  
    let ramPrice = selectedRam ? selectedRam.price : product?.specs?.ramOptions?.[0]?.price || 0;
    let storage1Price = selectedStorage1 ? selectedStorage1.price : product?.specs?.storage1Options?.[0]?.price || 0;
    let storage2Price = selectedStorage2 ? selectedStorage2.price : product?.specs?.storage2Options?.[0]?.price || 0;
  
    return (basePrice + ramPrice + storage1Price + storage2Price) * quantity;
  };
  
  useEffect(() => {
    setDiscountedPrice(calculateTotalPrice());
  }, [selectedRam, selectedStorage1, selectedStorage2, product, discountApplied, discountAmount, quantity]);

  const handleNextStep = () => {
    if (step === 1) {
      if (!userDetails.name || !userDetails.email || !userDetails.phoneNumber || !userDetails.address?.line1) {
        alert('Please fill in all user details.');
        return;
      }
    } else if (step === 2) {
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        setRazorpayLoaded(true);
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        setRazorpayLoaded(true);
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay SDK');
        setPaymentStatus({ error: 'Failed to load payment gateway. Please try again.', success: '' });
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    if (!userWithUserId?.userId) {
      setPaymentStatus({ error: 'User information is missing', success: '' });
      return;
    }

    setLoading(true);
    setPaymentStatus({ error: '', success: 'Creating order...' });

    try {
      if (!razorpayLoaded) {
        await loadRazorpayScript();
      }

      const response = await fetch(`${BASE_URL}/api/create-razorpay-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderDetails: {
            product,
            userDetails: userWithUserId,
            quantity,
            totalPrice: calculateTotalPrice()
          }
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create order');
      }

      setRazorpayOrder(data);

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: '7HubComputer',
        description: product.name,
        image: getProductImage(product), // Using dynamic image
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          const verifyResponse = await fetch(`${BASE_URL}/api/verify-razorpay-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails: {
                product,
                userDetails: userWithUserId,
                quantity,
                totalPrice: calculateTotalPrice()
              }
            })
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            setPaymentStatus({ success: 'Payment successful! Redirecting...', error: '' });
            setTimeout(() => navigate('/profile'), 2000);
          } else {
            setPaymentStatus({ error: 'Payment verification failed', success: '' });
          }
        },
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.phoneNumber
        },
        notes: {
          address: `${userDetails.address?.line1}, ${userDetails.address?.city}`
        },
        theme: {
          color: '#000000'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setPaymentStatus({ error: 'Payment cancelled', success: '' });
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (error) {
      console.error('Razorpay payment error:', error);
      setPaymentStatus({ error: error.message, success: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!userDetails.name || !userDetails.email || !userDetails.phoneNumber || !userDetails.address?.line1) {
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
    const parsedUser = loggedInUserId ? JSON.parse(loggedInUserId) : null;
  
    const userWithUserId = {
      ...userDetails,
      userId: parsedUser ? parsedUser._id : null
    };
  
    if (!userWithUserId.userId) {
      alert('User is not logged in or userId is missing.');
      return;
    }

    const razorpayMethods = ['creditCard', 'gpay', 'phonepay', 'netbanking'];
    
    if (razorpayMethods.includes(paymentMethod)) {
      handleRazorpayPayment();
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

    if (paymentMethod === 'paypal') {
      handlePayPalPayment(userWithUserId);
      return;
    }
  
    try {
      const apiUrl = apiUrlMap[paymentMethod];
      if (!apiUrl) {
        setPaymentStatus({ error: 'Invalid payment method', success: '' });
        return;
      }
    
      setPaymentStatus({ error: '', success: 'Processing payment...' });
    
      const response = await fetch(`${BASE_URL}${apiUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderDetails: {
            product,
            userDetails: userWithUserId,
            quantity,
            totalPrice: calculateTotalPrice(),
          },
        }),
      });
    
      const data = await response.json();
      console.log('Payment response:', data);
    
      if (response.ok) {
        if (paymentMethod === 'paytm' && data.paytmParams) {
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = data.paytmUrl;
          form.target = '_blank';
          
          Object.keys(data.paytmParams).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = data.paytmParams[key];
            form.appendChild(input);
          });
          
          document.body.appendChild(form);
          form.submit();
          document.body.removeChild(form);
          
          setPaymentStatus({ 
            success: 'Redirecting to Paytm...', 
            error: '' 
          });
        } else {
          setPaymentStatus({ success: 'Payment successful!', error: '' });
          setTimeout(() => navigate('/profile'), 2000);
        }
      } else {
        setPaymentStatus({ error: data.error || 'Payment failed.', success: '' });
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentStatus({ error: err.message, success: '' });
    }
  };

  const loadPayPalScript = () => {
    return new Promise((resolve) => {
      if (window.paypal) {
        setPaypalLoaded(true);
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=USD&enable-funding=venmo,paylater`;
      script.async = true;
      script.onload = () => {
        setPaypalLoaded(true);
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load PayPal SDK');
        setPaymentStatus({ error: 'Failed to load PayPal. Please try again.', success: '' });
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const initializePayPalButtons = (userData) => {
    console.log('Initializing PayPal buttons with user:', userData);
    
    const container = document.getElementById('paypal-button-container');
    if (container) {
      container.innerHTML = '';
    }

    if (!window.paypal) {
      console.error('PayPal SDK not loaded');
      return;
    }

    window.paypal.Buttons({
      createOrder: (data, actions) => {
        const inrAmount = (calculateTotalPrice() / 83).toFixed(2);

        return actions.order.create({
          purchase_units: [{
            amount: {
              value: inrAmount,
              currency_code: 'USD'
            },
            description: product?.name || 'Product',
            custom_id: userData.userId,
            soft_descriptor: '7HUBCOMPUTER'
          }],
          application_context: {
          brand_name: '7HubComputer',
          landing_page: 'BILLING',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          return_url: `${window.location.origin}/payment/success`,
          cancel_url: `${window.location.origin}/payment/cancel`
        }
        });
      },

      onApprove: async (data, actions) => {
        try {
          setLoading(true);
          setPaymentStatus({ error: '', success: 'Processing payment...' });

          const captureResponse = await fetch(`${BASE_URL}/api/capture-paypal-order/${data.orderID}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          const captureData = await captureResponse.json();

          if (captureData.success) {
            setPaymentStatus({ success: 'Payment successful! Redirecting...', error: '' });
            setTimeout(() => navigate('/profile'), 2000);
          } else {
            throw new Error(captureData.error || 'Payment capture failed');
          }
        } catch (error) {
          console.error('Capture error:', error);
          setPaymentStatus({ error: error.message, success: '' });
        } finally {
          setLoading(false);
        }
      },

      onError: (err) => {
        console.error('PayPal error:', err);
        setPaymentStatus({ error: 'Payment failed. Please try again.', success: '' });
      },

      onCancel: () => {
        setPaymentStatus({ error: 'Payment cancelled', success: '' });
      }
    }).render('#paypal-button-container');
  };

  const handlePayPalPayment = async (userWithUserId) => {
    console.log('handlePayPalPayment called with:', userWithUserId);

    if (!userWithUserId || !userWithUserId.userId) {
      setPaymentStatus({ error: 'User information is missing. Please refresh and try again.', success: '' });
      return;
    }

    setLoading(true);
    setPaymentStatus({ error: '', success: 'Initializing PayPal...' });

    try {
      const response = await fetch(`${BASE_URL}/api/create-paypal-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          orderDetails: {
            product,
            userDetails: userWithUserId,
            quantity,
            totalPrice: calculateTotalPrice(),
            currency: 'USD'
          }
        })
      });

      const data = await response.json();
      console.log('PayPal order response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to create PayPal order');
      }

      if (window.paypal) {
        initializePayPalButtons(userWithUserId);
      } else {
        await loadPayPalScript();
        initializePayPalButtons(userWithUserId);
      }

    } catch (error) {
      console.error('PayPal payment error:', error);
      setPaymentStatus({ error: error.message, success: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'name' || name === 'email' || name === 'phoneNumber') {
      setUserDetails((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setUserDetails((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        },
      }));
    }
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    setQuantity(newQuantity > 0 ? newQuantity : 1);
  };

  const applyDiscount = async () => {
    if (discountCode.trim() === "") {
      setDiscountError("Please enter a discount code.");
      return;
    }
    const loggedInUserId = localStorage.getItem("user");
    const parsedUser = loggedInUserId ? JSON.parse(loggedInUserId) : null;
    const userId = parsedUser ? parsedUser._id : null;

    try {
      const response = await fetch(`${BASE_URL}/api/apply-discount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode, totalAmount: calculateTotalPrice(), userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setDiscountedPrice(data.discountedPrice);
        setDiscountAmount(data.discountValue);
        setDiscountApplied(true);
        setDiscountError("");
      } else {
        setDiscountError(data.error);
        setDiscountApplied(false);
      }
    } catch (error) {
      setDiscountError("Failed to apply discount. Try again.");
      console.error("Error:", error);
    }
  };

  const paymentIcons = {
    creditCard: <FaCreditCard className="text-xl" />,
    gpay: <FaGooglePay className="text-xl" />,
    phonepay: <FaPhone className="text-xl" />,
    paytm: <SiPaytm className="text-xl" />,
    paypal: <SiPaypal className="text-xl" />,
    netbanking: <FaMoneyBill className="text-xl" />,
    cashOnDelivery: <FaMoneyBill className="text-xl" />,
    razorpay: <SiRazorpay className="text-xl" />
  };

  // Image Error Handler Component
  const ImageWithFallback = ({ src, alt, className, ...props }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [error, setError] = useState(false);

    const handleError = () => {
      if (!error) {
        setError(true);
        setImgSrc('/api/placeholder/200/200');
      }
    };

    return (
      <img
        {...props}
        src={imgSrc}
        alt={alt}
        className={className}
        onError={handleError}
        loading="lazy"
      />
    );
  };

  return (
    <div className="bg-white pt-24 md:pt-28 pb-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
        
        {/* Page Header */}
        <div className="border-b-2 border-black pb-6 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-black">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your purchase in 3 simple steps</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 border-2 border-black font-bold text-lg
                ${step >= i ? 'bg-black text-white' : 'bg-white text-black'}`}>
                {i}
              </div>
              <div className={`flex-1 h-0.5 mx-2 ${step > i ? 'bg-black' : 'bg-gray-300'}`}></div>
            </div>
          ))}
        </div>

        {/* Payment Status Messages */}
        {paymentStatus.success && (
          <div className="mb-6 border-2 border-green-500 bg-green-50 p-4">
            <p className="text-green-700 font-medium">{paymentStatus.success}</p>
          </div>
        )}
        {paymentStatus.error && (
          <div className="mb-6 border-2 border-red-500 bg-red-50 p-4">
            <p className="text-red-700 font-medium">{paymentStatus.error}</p>
          </div>
        )}

        {/* Product Summary with Dynamic Images */}
        {product && (
          <div className="border-4 border-black bg-white p-6 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              
              {/* Product Image - Using dynamic image handler */}
              <div className="md:w-1/3 border-2 border-black p-4 bg-gray-50">
                <ImageWithFallback
                  src={getProductImage(product)}
                  alt={product.name}
                  className="w-full h-40 object-contain"
                />
              </div>

              {/* Product Details */}
              <div className="md:w-2/3">
                <h2 className="text-2xl font-bold text-black mb-2">{product.name}</h2>
                <p className="text-gray-600 mb-4">{product.description}</p>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-black">
                      ₹{(discountApplied ? discountedPrice : calculateTotalPrice()).toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{(product.originalPrice * quantity).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-bold text-gray-600">Qty:</label>
                    <select
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="border-2 border-black p-2 focus:outline-none focus:ring-2 focus:ring-black text-black"
                    >
                      {[1,2,3,4,5].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Additional Product Images Gallery (Optional) */}
                {getAllProductImages(product).length > 1 && (
                  <div className="mt-4">
                    <p className="text-sm font-bold text-gray-600 mb-2">More Images:</p>
                    <div className="flex gap-2">
                      {getAllProductImages(product).slice(0, 3).map((img, idx) => (
                        <div key={idx} className="w-12 h-12 border border-gray-300 p-1">
                          <ImageWithFallback
                            src={img}
                            alt={`${product.name} view ${idx + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {discountApplied && (
                  <p className="text-green-600 font-bold mt-2 flex items-center gap-2">
                    <FaCheck /> Discount Applied: ₹{discountAmount} off
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: User Details */}
        {step === 1 && (
          <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-bold text-black mb-6 border-b-2 border-black pb-2">
              Step 1: Your Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={userDetails.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={userDetails.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={userDetails.phoneNumber}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Address Line 1
                </label>
                <input
                  type="text"
                  name="line1"
                  value={userDetails.address?.line1 || ''}
                  onChange={handleChange}
                  placeholder="Street address"
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="line2"
                  value={userDetails.address?.line2 || ''}
                  onChange={handleChange}
                  placeholder="Apartment, suite, etc."
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={userDetails.address?.city || ''}
                  onChange={handleChange}
                  placeholder="Mumbai"
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={userDetails.address?.state || ''}
                  onChange={handleChange}
                  placeholder="Maharashtra"
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zip"
                  value={userDetails.address?.zip || ''}
                  onChange={handleChange}
                  placeholder="400001"
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleNextStep}
                className="px-8 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors border-2 border-black flex items-center gap-2"
              >
                Continue to Payment <FaArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Payment Method */}
        {step === 2 && (
          <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-bold text-black mb-6 border-b-2 border-black pb-2">
              Step 2: Payment Method
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { value: 'creditCard', label: 'Credit Card', icon: <FaCreditCard /> },
                { value: 'gpay', label: 'Google Pay', icon: <FaGooglePay /> },
                { value: 'phonepay', label: 'PhonePe', icon: <FaPhone /> },
                { value: 'paytm', label: 'Paytm', icon: <SiPaytm /> },
                { value: 'paypal', label: 'PayPal', icon: <SiPaypal /> },
                { value: 'netbanking', label: 'Net Banking', icon: <FaMoneyBill /> },
                { value: 'cashOnDelivery', label: 'Cash on Delivery', icon: <FaMoneyBill /> },
              ].map((method) => (
                <button
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value)}
                  className={`flex items-center gap-3 p-4 border-2 transition-all ${
                    paymentMethod === method.value
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 bg-white text-black hover:border-black'
                  }`}
                >
                  <span className="text-xl">{method.icon}</span>
                  <span className="font-medium">{method.label}</span>
                </button>
              ))}
            </div>

            {/* Credit Card Details */}
            {paymentMethod === 'creditCard' && (
              <div className="border-2 border-black p-4 mb-6">
                <h3 className="font-bold text-black mb-4">Card Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardDetails.cardNumber}
                      onChange={handleCardChange}
                      placeholder="Card Number"
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="expiryDate"
                      value={cardDetails.expiryDate}
                      onChange={handleCardChange}
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="cvv"
                      value={cardDetails.cvv}
                      onChange={handleCardChange}
                      placeholder="CVV"
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Discount Code */}
            <div className="border-2 border-black p-4 mb-6">
              <h3 className="font-bold text-black mb-4 flex items-center gap-2">
                <FaTag /> Apply Discount Code
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                />
                <button
                  onClick={applyDiscount}
                  disabled={discountApplied}
                  className={`px-6 py-3 font-semibold border-2 ${
                    discountApplied
                      ? 'bg-gray-300 text-gray-600 border-gray-300 cursor-not-allowed'
                      : 'bg-black text-white border-black hover:bg-gray-800'
                  }`}
                >
                  Apply
                </button>
              </div>
              {discountError && <p className="text-red-600 mt-2">{discountError}</p>}
              {discountApplied && (
                <p className="text-green-600 mt-2 font-bold">
                  Discount applied! You saved ₹{discountAmount}
                </p>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4">
              <button
                onClick={handlePreviousStep}
                className="px-6 py-3 bg-white text-black border-2 border-black font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <FaArrowLeft /> Back
              </button>
              <button
                onClick={handleNextStep}
                className="px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors border-2 border-black flex items-center gap-2"
              >
                Review Order <FaArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm Order */}
        {step === 3 && (
          <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-bold text-black mb-6 border-b-2 border-black pb-2">
              Step 3: Confirm Order
            </h2>

            {/* Order Summary */}
            <div className="space-y-4 mb-6">
              <div className="border-2 border-black p-4">
                <h3 className="font-bold text-black mb-3">Shipping Address</h3>
                <p className="text-gray-700">{userDetails.name}</p>
                <p className="text-gray-700">{userDetails.address?.line1}</p>
                {userDetails.address?.line2 && <p className="text-gray-700">{userDetails.address.line2}</p>}
                <p className="text-gray-700">{userDetails.address?.city}, {userDetails.address?.state} - {userDetails.address?.zip}</p>
                <p className="text-gray-700">Phone: {userDetails.phoneNumber}</p>
                <p className="text-gray-700">Email: {userDetails.email}</p>
              </div>

              <div className="border-2 border-black p-4">
                <h3 className="font-bold text-black mb-3">Payment Method</h3>
                <p className="text-gray-700 flex items-center gap-2">
                  {paymentIcons[paymentMethod]} {paymentMethod === 'creditCard' ? 'Credit Card' : 
                    paymentMethod === 'gpay' ? 'Google Pay' :
                    paymentMethod === 'phonepay' ? 'PhonePe' :
                    paymentMethod === 'paytm' ? 'Paytm' :
                    paymentMethod === 'paypal' ? 'PayPal' :
                    paymentMethod === 'netbanking' ? 'Net Banking' : 'Cash on Delivery'}
                </p>
              </div>

              <div className="border-2 border-black p-4">
                <h3 className="font-bold text-black mb-3">Order Total</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-bold text-black">₹{calculateTotalPrice().toFixed(2)}</span>
                  </div>
                  {discountApplied && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping:</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t-2 border-black pt-2 mt-2">
                    <div className="flex justify-between font-bold text-black text-lg">
                      <span>Total:</span>
                      <span>₹{calculateTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between gap-4">
              <button
                onClick={handlePreviousStep}
                className="px-6 py-3 bg-white text-black border-2 border-black font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <FaArrowLeft /> Back
              </button>
              <div className="flex-1">
                {paymentMethod === 'paypal' ? (
                  <>
                    <div id="paypal-button-container" className="mt-4 min-h-[200px]"></div>
                    {loading && (
                      <div className="text-center mt-4">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-gray-600 mt-2">{paymentStatus.success || 'Processing PayPal...'}</p>
                      </div>
                    )}
                  </>
                ) : paymentMethod === 'paytm' ? (
                  <button
                    onClick={handleConfirmPayment}
                    className="w-full py-4 px-6 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors border-2 border-blue-600 flex items-center justify-center gap-2 rounded-lg"
                  >
                    <SiPaytm className="text-xl" />
                    Pay with Paytm
                  </button>
                ) : paymentMethod === 'cashOnDelivery' ? (
                  <button
                    onClick={handleConfirmPayment}
                    className="w-full py-4 px-6 bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors border-2 border-green-600 flex items-center justify-center gap-2 rounded-lg"
                  >
                    <FaMoneyBill className="text-xl" />
                    Place Order (COD)
                  </button>
                ) : (
                  <button
                    onClick={handleConfirmPayment}
                    disabled={loading}
                    className={`w-full py-4 px-6 bg-black text-white font-semibold hover:bg-gray-800 transition-colors border-2 border-black flex items-center justify-center gap-2 rounded-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <SiRazorpay className="text-xl" />
                        Pay with Razorpay
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;