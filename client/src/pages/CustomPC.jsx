import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaCreditCard, FaSave, FaCog, FaArrowLeft, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import axios from 'axios';

const CustomPC = () => {
  const [componentOptions, setComponentOptions] = useState({});
  const [prices, setPrices] = useState({});
  const [selectedParts, setSelectedParts] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [showDropdown, setShowDropdown] = useState(null);
  const [configurationSaved, setConfigurationSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [compatibilityIssues, setCompatibilityIssues] = useState([]);
  const [savedConfigurations, setSavedConfigurations] = useState([]);
  const [showSavedConfigs, setShowSavedConfigs] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user')) || null;
  const userId = user?._id || null;
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Fetch component options from backend
  useEffect(() => {
    fetchComponentOptions();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserConfigurations();
    }
  }, [userId]);

  const fetchComponentOptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/custom-pc/components');
      
      if (response.data.success) {
        setComponentOptions(response.data.options);
        setPrices(response.data.prices);
        
        // Initialize selected parts with first option from each category
        const initialParts = {};
        Object.keys(response.data.options).forEach(category => {
          if (response.data.options[category]?.length > 0) {
            initialParts[category] = response.data.options[category][0];
          }
        });
        setSelectedParts(initialParts);
      }
    } catch (error) {
      console.error("Error fetching components:", error);
      setError('Failed to load components. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserConfigurations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:4000/api/custom-pc/user/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data.success) {
        setSavedConfigurations(response.data.customPCs || []);
      }
    } catch (error) {
      console.error("Error fetching user configurations:", error);
    }
  };

  const handleSelectChange = (category, selectedItem) => {
    const updatedParts = {
      ...selectedParts,
      [category]: selectedItem
    };
    setSelectedParts(updatedParts);
    setShowDropdown(null);
    
    // Check compatibility after selection
    checkCompatibility(updatedParts);
  };

  const checkCompatibility = async (configuration) => {
    try {
      const response = await axios.post('http://localhost:4000/api/custom-pc/check-compatibility', {
        configuration
      });
      
      if (response.data.success) {
        if (!response.data.compatible) {
          setCompatibilityIssues(response.data.issues || []);
        } else {
          setCompatibilityIssues([]);
        }
      }
    } catch (error) {
      console.error("Error checking compatibility:", error);
    }
  };

  const calculateTotalPrice = () => {
    const calculatedPrice = Object.values(selectedParts).reduce((total, part) => {
      return total + (part?.price || 0);
    }, 0);
    setTotalPrice(calculatedPrice);
  };

  useEffect(() => {
    calculateTotalPrice();
  }, [selectedParts]);

  const handleSaveConfiguration = async () => {
    if (!userId) {
      // Save to local storage for guest
      const guestConfig = {
        configuration: selectedParts,
        totalPrice,
        name: 'Guest Custom PC',
        dateAdded: new Date().toISOString()
      };
      localStorage.setItem('guestConfiguration', JSON.stringify(guestConfig));
      setConfigurationSaved(true);
      setTimeout(() => setConfigurationSaved(false), 3000);
      alert('Configuration saved locally. Sign in to save permanently.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:4000/api/custom-pc/save', {
        userId,
        configuration: selectedParts,
        totalPrice,
        name: 'My Custom PC'
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data.success) {
        setConfigurationSaved(true);
        setTimeout(() => setConfigurationSaved(false), 3000);
        fetchUserConfigurations(); // Refresh saved configs
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      alert('Failed to save configuration. Please try again.');
    }
  };

  const handleAddToCart = () => {
    if (Object.keys(selectedParts).length === 0) {
      alert('Please select at least one component');
      return;
    }

    if (compatibilityIssues.length > 0) {
      if (!window.confirm('There are compatibility issues. Add to cart anyway?')) {
        return;
      }
    }

    const customPCItem = {
      type: 'custom pc',
      name: 'Custom PC',
      configuration: selectedParts,
      totalPrice,
      userId,
      quantity: 1,
      image: selectedParts.ComputerCase?.image || '/default-pc-case.jpg'
    };

    addToCart(customPCItem);
    navigate('/cart');
  };

  // Check if any selected component is out of stock
  const hasOutOfStockComponents = () => {
    // If no parts selected yet, consider it as having out of stock issues
    if (Object.keys(selectedParts).length === 0) return true;

    // Check each selected part
    for (const category in selectedParts) {
      const part = selectedParts[category];
      // If part exists and stock is 0 or less, it's out of stock
      if (part && (part.stock === undefined || part.stock <= 0)) {
        return true;
      }
    }
    return false;
  };

  const handleCheckout = () => {
    if (!userId) {
      navigate('/signin');
      return;
    }

    if (Object.keys(selectedParts).length === 0) {
      alert('Please select components first');
      return;
    }

    // Check for out of stock components
    if (hasOutOfStockComponents()) {
      alert('Cannot proceed to checkout. Some components are out of stock.');
      return;
    }

    if (compatibilityIssues.length > 0) {
      alert('Please resolve compatibility issues before checkout.');
      return;
    }

    // Prepare product data for payment
    const productData = {
      _id: 'custom-pc',
      name: 'Custom PC',
      finalPrice: totalPrice,
      quantity: 1,
      configuration: selectedParts,
      image: selectedParts.ComputerCase?.image ? [selectedParts.ComputerCase.image] : ['/default-pc-case.jpg']
    };

    navigate('/payment', { 
      state: { 
        product: productData
      } 
    });
  };

  const loadSavedConfiguration = (config) => {
    setSelectedParts(config.configuration || {});
    setShowSavedConfigs(false);
  };

  if (loading) {
    return (
      <div className="bg-white pt-24 md:pt-28 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600">Loading components...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white pt-24 md:pt-28 pb-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="border-b-2 border-black pb-8 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <FaCog className="text-3xl text-black" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">Design Your Dream Machine</span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black">
              Build Your Custom PC
            </h1>
            {userId && savedConfigurations?.length > 0 && (
              <button
                onClick={() => setShowSavedConfigs(!showSavedConfigs)}
                className="px-4 py-2 border-2 border-black hover:bg-gray-100 transition-colors"
              >
                {showSavedConfigs ? 'Hide Saved' : 'Load Saved'} ({savedConfigurations.length})
              </button>
            )}
          </div>
          <p className="text-lg text-gray-600 mt-4">
            Choose every component to create your perfect system. All parts are guaranteed compatible.
          </p>
        </div>

        {/* Saved Configurations Dropdown */}
        {showSavedConfigs && savedConfigurations?.length > 0 && (
          <div className="mb-8 border-4 border-black p-4 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-bold text-black mb-4">Your Saved Configurations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedConfigurations.map((config, index) => (
                <div
                  key={config._id || index}
                  className="border-2 border-black p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => loadSavedConfiguration(config)}
                >
                  <p className="font-medium text-black">{config.name || 'Custom PC'}</p>
                  <p className="text-sm text-gray-600">
                    Saved: {new Date(config.dateAdded || config.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-lg font-bold text-black mt-2">
                    ₹{(config.totalPrice || 0).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compatibility Warnings */}
        {compatibilityIssues.length > 0 && (
          <div className="mb-8 border-2 border-yellow-500 bg-yellow-50 p-4 flex items-start gap-3">
            <FaExclamationTriangle className="text-yellow-600 text-xl flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-yellow-800 mb-1">Compatibility Issues Detected:</p>
              <ul className="text-sm text-yellow-700 list-disc list-inside">
                {compatibilityIssues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Component Selection */}
          <div className="lg:col-span-2">
            <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-bold text-black mb-6 border-b-2 border-black pb-2">
                Select Your Components
              </h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border-2 border-red-500 text-red-600">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(componentOptions).map((category) => (
                  <div key={category} className="space-y-2">
                    <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider">
                      {category}
                    </label>

                    <div className="relative dropdown">
                      <button
                        type="button"
                        className="w-full px-4 py-3 border-2 border-black text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                        onClick={() => setShowDropdown(showDropdown === category ? null : category)}
                      >
                        <span className="text-black font-medium truncate pr-2">
                          {selectedParts[category]?.name || 'Select...'}
                        </span>
                        <span className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-black font-bold">
                            ₹{(selectedParts[category]?.price || 0).toLocaleString()}
                          </span>
                          <span className="text-black">▼</span>
                        </span>
                      </button>

                      {showDropdown === category && componentOptions[category] && (
                        <div className="absolute mt-2 w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-80 overflow-y-auto z-50">
                          {componentOptions[category].map((item) => (
                            <div
                              key={item._id}
                              className="p-3 flex items-center gap-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-0"
                              onClick={() => handleSelectChange(category, item)}
                            >
                              {item.image && (
                                <img
                                  src={`http://localhost:4000/uploads/${item.image.split('/').pop()}`}
                                  alt={item.name}
                                  className={`object-contain ${
                                    ["GPU", "RAM", "SSD", "HDD", "PowerSupply", "ComputerCase"].includes(category) 
                                      ? "w-12 h-12" 
                                      : "w-8 h-8"
                                  }`}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/placeholder-image.jpg';
                                  }}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-700 truncate">
                                  {item.name}
                                </p>
                                {item.brand && (
                                  <p className="text-xs text-gray-500">{item.brand}</p>
                                )}
                              </div>
                              <p className="text-sm font-bold text-black flex-shrink-0">
                                ₹{(item.price || 0).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              
              {/* Current Build Preview */}
              <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-xl font-bold text-black mb-4 border-b-2 border-black pb-2">
                  Your Build
                </h2>
                
                <div className="flex justify-center mb-6">
                  <div className="border-2 border-black p-4 bg-gray-50">
                    {selectedParts.ComputerCase?.image ? (
                      <img
                        src={`http://localhost:4000/uploads/${selectedParts.ComputerCase.image.split('/').pop()}`}
                        alt="Your PC Case"
                        className="w-40 h-40 object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-40 h-40 flex items-center justify-center text-gray-400">
                        No case selected
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {Object.keys(selectedParts).map((category) => (
                    <div key={category} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                      <span className="text-sm text-gray-600">{category}:</span>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">
                          {selectedParts[category]?.name?.length > 30 
                            ? selectedParts[category]?.name?.substring(0, 30) + '...' 
                            : selectedParts[category]?.name || 'Not selected'}
                        </p>
                        <p className="text-sm font-bold text-black">
                          ₹{(selectedParts[category]?.price || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t-4 border-black">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-black">Total:</span>
                    <span className="text-3xl font-bold text-black">₹{totalPrice.toLocaleString()}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={handleSaveConfiguration}
                      className="w-full bg-black text-white py-3 px-4 text-sm font-medium hover:bg-gray-800 transition-colors border-2 border-black flex items-center justify-center gap-2"
                    >
                      <FaSave /> Save Configuration
                    </button>

                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-white text-black py-3 px-4 text-sm font-medium hover:bg-gray-100 transition-colors border-2 border-black flex items-center justify-center gap-2"
                    >
                      <FaShoppingCart /> Add to Cart
                    </button>

                    <button
                      onClick={handleCheckout}
                      className="w-full bg-green-600 text-white py-3 px-4 text-sm font-medium hover:bg-green-700 transition-colors border-2 border-green-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={compatibilityIssues.length > 0 || Object.keys(selectedParts).length === 0 || hasOutOfStockComponents()}
                    >
                      <FaCreditCard /> Proceed to Checkout
                    </button>
                  </div>

                  {configurationSaved && (
                    <div className="mt-4 p-3 bg-green-50 border-2 border-green-500 flex items-center gap-2">
                      <FaCheck className="text-green-600" />
                      <p className="text-green-700 text-sm font-medium">
                        Configuration saved successfully!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stock Status */}
              {Object.keys(selectedParts).length > 0 && (
                <div className="border-2 border-black p-4 bg-gray-50">
                  <h3 className="font-bold text-black mb-2">Component Status</h3>
                  {Object.keys(selectedParts).map(category => (
                    <div key={category} className="flex justify-between text-sm py-1">
                      <span className="text-gray-600">{category}:</span>
                      <span className={selectedParts[category]?.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                        {selectedParts[category]?.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Stock Warning */}
              {hasOutOfStockComponents() && Object.keys(selectedParts).length > 0 && (
                <div className="mb-8 border-2 border-red-500 bg-red-50 p-4 flex items-start gap-3">
                  <FaExclamationTriangle className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-800 mb-1">Out of Stock Components Detected:</p>
                    <ul className="text-sm text-red-700 list-disc list-inside">
                      {Object.keys(selectedParts).map(category => {
                        const part = selectedParts[category];
                        if (part && (part.stock === undefined || part.stock <= 0)) {
                          return <li key={category}>{category}: {part.name} is out of stock</li>;
                        }
                        return null;
                      })}
                    </ul>
                  </div>
                </div>
              )}

              {/* Compatibility Note */}
              <div className="border-2 border-black p-4 bg-gray-50">
                <p className="text-xs text-gray-600 flex items-start gap-2">
                  <span className="font-bold text-black">Note:</span>
                  All components are checked for compatibility. Prices are subject to change based on availability.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-sm font-medium text-black border-b-2 border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors"
          >
            <FaArrowLeft /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomPC;