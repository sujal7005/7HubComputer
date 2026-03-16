import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  FaTv, 
  FaStar, 
  FaShoppingCart, 
  FaArrowLeft, 
  FaArrowRight, 
  FaTimes, 
  FaCheck, 
  FaTruck, 
  FaShieldAlt, 
  FaUndo,
  FaRuler,
  FaMicrochip,
  FaPalette,
  FaBolt,
  FaTachometerAlt,
  FaExpand,
  FaMobileAlt,
  FaPlug,
  FaUsb,
  FaWifi,
  FaGamepad,
  FaDesktop,
  FaImage
} from 'react-icons/fa';

const DisplayDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [display, setDisplay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLargeImage, setShowLargeImage] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(null);
  const BASE_URL = `http://${window.location.hostname}:4000`;

  useEffect(() => {
    fetchDisplayDetails();
  }, [id]);

  const fetchDisplayDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/displays/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setDisplay(data.data);
      } else {
        setError('Display not found');
      }
    } catch (error) {
      console.error('Error fetching display:', error);
      setError('Failed to load display details');
    } finally {
      setLoading(false);
    }
  };

  const handleIncrease = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    const cartItem = {
      id: display._id,
      name: display.name,
      price: display.price,
      finalPrice: display.price,
      originalPrice: display.originalPrice,
      image: [display.image],
      description: display.description,
      brand: display.brand,
      category: display.category,
      type: 'display',
      quantity: quantity,
      inStock: display.inStock,
      specs: display.specs
    };
    
    console.log('Adding to cart:', cartItem);
    alert(`${display.name} added to cart!`);
  };

  const handleBuyNow = () => {
    navigate('/payment', { state: { product: display } });
  };

  const handlePreviousImage = () => {
    const images = display.images || [display.image];
    if (images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
    }
  };

  const handleNextImage = () => {
    const images = display.images || [display.image];
    if (images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handleThumbnailClick = (index) => {
    setModalImageIndex(index);
    setShowLargeImage(true);
  };

  const handleCancelImage = () => {
    setShowLargeImage(false);
    setModalImageIndex(null);
  };

  const getPortIcon = (port) => {
    if (port.includes('USB')) return <FaUsb className="text-xs" />;
    if (port.includes('HDMI') || port.includes('DisplayPort')) return <FaPlug className="text-xs" />;
    if (port.includes('Thunderbolt')) return <FaBolt className="text-xs" />;
    return <FaPlug className="text-xs" />;
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'gaming': return <FaGamepad />;
      case 'professional': return <FaDesktop />;
      case 'ultrawide': return <FaExpand />;
      case 'portable': return <FaMobileAlt />;
      default: return <FaTv />;
    }
  };

  const getDisplayImageUrl = (display) => {
    // Get the image path - check both image and images array
    let imagePath = display.image;
    
    // If no image, try the first item in images array
    if (!imagePath && display.images && display.images.length > 0) {
      imagePath = display.images[0];
    }

    // If still no image, return placeholder
    if (!imagePath) {
      return '/placeholder-image.jpg';
    }

    // If it's already a full URL, return it
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Extract just the filename (remove any path)
    const filename = imagePath.split(/[\\/]/).pop();

    // Construct the full URL
    return `${BASE_URL}/uploads/${filename}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading display details...</p>
        </div>
      </div>
    );
  }

  if (error || !display) {
    return (
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <div className="text-center border-4 border-black p-12 max-w-lg">
          <h2 className="text-3xl font-bold text-black mb-4">Display Not Found</h2>
          <p className="text-gray-600 mb-8">{error || "The display you're looking for doesn't exist."}</p>
          <button 
            onClick={() => navigate('/display')}
            className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors border-2 border-black"
          >
            BACK TO DISPLAYS
          </button>
        </div>
      </div>
    );
  }

  const images = display.images && display.images.length > 0 ? display.images : [display.image];
  const discountPercentage = display.originalPrice && display.originalPrice > display.price
    ? Math.round(((display.originalPrice - display.price) / display.originalPrice) * 100) 
    : 0;

  return (
    <>
      <Helmet>
        <title>{display.name} | 7HubComputers Displays</title>
        <meta name="description" content={display.description} />
      </Helmet>

      <div className="bg-white pt-24 md:pt-28 pb-20 min-h-screen">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <button onClick={() => navigate('/')} className="hover:text-black">Home</button>
            <span>/</span>
            <button onClick={() => navigate('/display')} className="hover:text-black">Displays</button>
            <span>/</span>
            <span className="text-black font-medium truncate">{display.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Left Column - Product Images */}
            <div className="relative">
              <div className="sticky top-28">
                {/* Main Image */}
                <div className="border-4 border-black bg-white mb-4 group relative overflow-hidden">
                  <div className="aspect-square flex items-center justify-center p-8 bg-gray-50">
                    {images.length > 0 ? (
                      <img
                        src={getDisplayImageUrl(display)}
                        alt={display.name}
                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <FaImage className="text-6xl text-gray-300" />
                    )}
                  </div>

                  {/* Discount Badge */}
                  {discountPercentage > 0 && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white text-sm font-bold px-3 py-1.5 border-2 border-white">
                      -{discountPercentage}%
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1.5 border-2 border-white flex items-center gap-1">
                    {getCategoryIcon(display.category)}
                    <span className="capitalize">{display.category}</span>
                  </div>

                  {/* Navigation Buttons */}
                  {images.length > 1 && (
                    <>
                      <button 
                        onClick={handlePreviousImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaArrowLeft className="text-black" />
                      </button>
                      <button 
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaArrowRight className="text-black" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="grid grid-cols-5 gap-3">
                    {images.slice(0, 5).map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`aspect-square border-2 transition-all bg-white p-2
                          ${currentImageIndex === idx ? 'border-black scale-95' : 'border-gray-200 hover:border-gray-400'}`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Product Details */}
            <div className="space-y-6">
              
              {/* Product Header */}
              <div className="border-b-2 border-black pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-bold px-3 py-1.5 border-2 border-black 
                    ${display.inStock ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {display.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                  </span>
                  <span className="text-xs text-gray-500">Brand: {display.brand}</span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 leading-tight">
                  {display.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i} 
                        className={`w-5 h-5 ${
                          i < Math.floor(display.rating || 0) ? 'text-yellow-500' : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {display.rating || 0} · {display.reviewCount || 0} Reviews
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4">
                <span className="text-4xl md:text-5xl font-bold text-black">
                  ₹{(display.price * quantity).toLocaleString()}
                </span>
                {display.originalPrice && display.originalPrice > display.price && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      ₹{(display.originalPrice * quantity).toLocaleString()}
                    </span>
                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1.5 border border-green-200">
                      Save {discountPercentage}%
                    </span>
                  </>
                )}
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-3 gap-4 py-4 border-y-2 border-gray-200">
                <div className="flex items-center gap-2">
                  <FaTruck className="text-gray-600" />
                  <span className="text-xs text-gray-600">Free Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="text-gray-600" />
                  <span className="text-xs text-gray-600">{display.warranty || '1 Year'} Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUndo className="text-gray-600" />
                  <span className="text-xs text-gray-600">7 Day Returns</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-black mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {display.description}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-600">Quantity:</span>
                <div className="flex items-center border-2 border-black">
                  <button
                    onClick={handleDecrease}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors text-xl"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center border-x-2 border-black font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrease}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors text-xl"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500">Stock: {display.quantity}</span>
              </div>

              {/* Specifications */}
              <div className="border-4 border-black p-6 bg-white">
                <h3 className="text-xl font-bold text-black mb-6 border-b-2 border-black pb-2 flex items-center gap-2">
                  <FaTv /> Display Specifications
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {display.specs?.size && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200">
                      <FaRuler className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Size</p>
                        <p className="text-sm font-bold text-black">{display.specs.size}</p>
                      </div>
                    </div>
                  )}
                  
                  {display.specs?.resolution && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200">
                      <FaTv className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Resolution</p>
                        <p className="text-sm font-bold text-black">{display.specs.resolution}</p>
                      </div>
                    </div>
                  )}
                  
                  {display.specs?.panel && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200">
                      <FaMicrochip className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Panel Type</p>
                        <p className="text-sm font-bold text-black">{display.specs.panel}</p>
                      </div>
                    </div>
                  )}
                  
                  {display.specs?.refreshRate && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200">
                      <FaTachometerAlt className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Refresh Rate</p>
                        <p className="text-sm font-bold text-black">{display.specs.refreshRate}</p>
                      </div>
                    </div>
                  )}
                  
                  {display.specs?.responseTime && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200">
                      <FaBolt className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Response Time</p>
                        <p className="text-sm font-bold text-black">{display.specs.responseTime}</p>
                      </div>
                    </div>
                  )}
                  
                  {display.specs?.aspectRatio && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200">
                      <FaExpand className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Aspect Ratio</p>
                        <p className="text-sm font-bold text-black">{display.specs.aspectRatio}</p>
                      </div>
                    </div>
                  )}
                  
                  {display.specs?.brightness && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200">
                      <FaTv className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Brightness</p>
                        <p className="text-sm font-bold text-black">{display.specs.brightness}</p>
                      </div>
                    </div>
                  )}
                  
                  {display.specs?.contrast && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200">
                      <FaTv className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Contrast Ratio</p>
                        <p className="text-sm font-bold text-black">{display.specs.contrast}</p>
                      </div>
                    </div>
                  )}
                  
                  {display.specs?.colorGamut && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200">
                      <FaPalette className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Color Gamut</p>
                        <p className="text-sm font-bold text-black">{display.specs.colorGamut}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              {display.features && display.features.length > 0 && (
                <div className="border-2 border-black p-6">
                  <h3 className="text-lg font-bold text-black mb-4">Features</h3>
                  <ul className="space-y-2">
                    {display.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <FaCheck className="text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ports */}
              {display.ports && display.ports.length > 0 && (
                <div className="border-2 border-black p-6">
                  <h3 className="text-lg font-bold text-black mb-4">Connectivity</h3>
                  <div className="flex flex-wrap gap-2">
                    {display.ports.map((port, idx) => (
                      <span key={idx} className="px-3 py-2 bg-gray-100 border border-gray-300 text-sm text-gray-700 flex items-center gap-1">
                        {getPortIcon(port)}
                        {port}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!display.inStock}
                  className={`flex-1 py-4 px-6 text-lg font-medium border-2 border-black flex items-center justify-center gap-3 ${
                    display.inStock 
                      ? 'bg-black text-white hover:bg-gray-800 transition-colors' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaShoppingCart /> ADD TO CART
                </button>
                
                {display.inStock && (
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-white text-black py-4 px-6 text-lg font-medium hover:bg-gray-100 transition-colors border-2 border-black"
                  >
                    BUY NOW
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showLargeImage && modalImageIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-5xl w-full mx-4">
            <button
              onClick={handleCancelImage}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <FaTimes size={24} />
            </button>
            
            <img
              src={images[modalImageIndex]}
              alt={`Large view of ${display.name}`}
              className="w-full h-auto max-h-[80vh] object-contain"
            />

            {/* Thumbnail Navigation in Modal */}
            {images.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {images.map((thumb, index) => (
                  <button
                    key={index}
                    onClick={() => setModalImageIndex(index)}
                    className={`w-16 h-16 border-2 transition-all ${
                      modalImageIndex === index ? 'border-white scale-110' : 'border-gray-600'
                    }`}
                  >
                    <img
                      src={thumb}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DisplayDetails;