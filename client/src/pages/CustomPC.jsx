// src/pages/CustomPC.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { options, prices, productImages } from '../data';

const CustomPC = () => {
  const [selectedParts, setSelectedParts] = useState({
    CPU: options.CPU[0],
    GPU: options.GPU[0],
    RAM: options.RAM[0],
    SSD: options.SSD[0],
    HDD: options.HDD[0],  
    Motherboard: options.Motherboard[0],
    PowerSupply: options.PowerSupply[0],
    CPUCooler: options.CPUCooler[0],
    ComputerCase: options.ComputerCase[0],
    WiFiCard: options.WiFiCard[0],
    Ports: options.Ports[0],
  });

  const [totalPrice, setTotalPrice] = useState(0);
  const [showDropdown, setShowDropdown] = useState(null);
  const [configurationSaved, setConfigurationSaved] = useState(false);
  const userId = JSON.parse(localStorage.getItem('user'))?._id || null;
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleSelectChange = (part, value) => {
    setSelectedParts((prevParts) => ({
      ...prevParts,
      [part]: value,
    }));
    setShowDropdown(null);
  };

  const calculateTotalPrice = () => {
    const calculatedPrice = Object.keys(selectedParts).reduce((total, part) => {
      const selectedOption = selectedParts[part];
      return total + (prices[part][selectedOption] || 0);
    }, 0);
    setTotalPrice(calculatedPrice);
  };

  const handleSaveConfiguration = async () =>{
    const configuration = { ...selectedParts, totalPrice};
    const quantity = 1;
    const customPcImage = productImages[selectedParts.ComputerCase];

    console.log('Adding to cart:', configuration);
    console.log('userId:', userId);

    if (!userId) {
      localStorage.setItem('guestConfiguration', JSON.stringify(configuration));
      setConfigurationSaved(true);
      setTimeout(() => setConfigurationSaved(false), 3000);
      alert('Configuration saved as guest. Please sign in to save permanently.');
    } else {
      console.log('Calling addToCart with:', { 
        type: 'custom pc', 
        name: 'Custom PC', 
        configuration: selectedParts, 
        totalPrice,
        userId, 
        quantity,
        image: customPcImage,
      });
      addToCart({
        type: 'custom pc', 
        name: 'Custom PC',
        configuration: selectedParts, 
        totalPrice,
        userId, 
        quantity,
        image: customPcImage,
      });
    }
     navigate('/cart');
  };

  const handleCreateOrder = async () => {
    const configuration = { 
      ...selectedParts, 
      totalPrice, 
      name: 'Custom PC' // Ensure name is included here
    };

    if (!userId) {
      navigate('/signin');
      return;
    }
    navigate('/payment', { state: { product:  configuration } });

    // const configuration = selectedParts;

    // try {
    //   const response = await fetch('http://localhost:4000/api/createOrder', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ configuration, totalPrice }),
    //   });

    //   if (response.ok) {
    //     // Optionally handle successful order creation
    //     alert('Order created successfully!');
    //   } else {
    //     alert('Failed to create order. Please try again.');
    //   }
    // } catch (error) {
    //   console.error('Error creating order:', error);
    // }
  };


  useEffect(() => {
    calculateTotalPrice();
  }, [selectedParts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        setShowDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8">Build Your Custom PC</h1>

      <div className="flex justify-center">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 mb-12">
          {Object.keys(options).map((part) => (
            <div key={part} className="text-left">
              <label className="block font-semibold text-gray-700 mb-2">{part}</label>

              <div className="relative dropdown">
                <button
                  className="w-full sm:w-[24em] md:w-[26em] lg:w-[28em] p-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500 transition duration-200"
                  onClick={() => setShowDropdown(showDropdown === part ? null : part)}
                >
                  {selectedParts[part]} - ₹{prices[part][selectedParts[part]]} <span className="float-right">▼</span>
                </button>

                {showDropdown === part && (
                  <div className="absolute mt-2 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto w-full z-10 transition-transform duration-200 ease-in-out transform">
                    {options[part].map((option) => (
                      <div
                        key={option}
                        className="p-2 flex items-center space-x-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSelectChange(part, option)}
                      >
                        <img
                          src={productImages[option] || 'https://example.com/default-image.jpg'}
                          alt={option}
                          className={`object-cover ${["GPU", "RAM", "SSD", "HDD", "PowerSupply", "ComputerCase"].includes(part) ? "w-15 h-16" : "w-12 h-12"}`}
                        />
                        <span className={selectedParts[part] === option ? 'font-semibold text-blue-500' : ''}>
                          {option} - ₹{prices[part][option]}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`bg-white shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 mx-auto w-full md:w-3/4 lg:w-2/3`}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Custom PC</h2>

        <div className="flex justify-center mb-8">
          <img
            src={productImages[selectedParts.ComputerCase] || 'https://example.com/default-image.jpg'}
            alt="Final product"
            className="w-64 h-64 object-cover rounded-lg border border-gray-200 shadow-lg"
          />
        </div>

        <ul className="text-left space-y-4">
          {Object.keys(selectedParts).map((part) => (
            <li key={part} className="flex justify-between items-center">
              <span className="text-gray-600">{part}:</span>
              <span className="font-semibold text-gray-800">{selectedParts[part]} - ₹{prices[part][selectedParts[part]]}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Total Price: ₹{totalPrice}</h3>
          <button
            onClick={handleSaveConfiguration}
            className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200`}
          > Save Configuration
          </button>

          <button
            onClick={handleCreateOrder}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200 ml-4"
          >
            Create Order
          </button>
          {configurationSaved && (
            <div className="mt-4 text-green-500 font-semibold">Configuration saved successfully!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomPC;