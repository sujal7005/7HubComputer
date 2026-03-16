import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CartContext } from '../context/CartContext';
import { 
  FaStar, 
  FaShoppingCart, 
  FaArrowLeft, 
  FaArrowRight, 
  FaTimes, 
  FaCheck, 
  FaTag, 
  FaTruck, 
  FaShieldAlt, 
  FaUndo,
  FaUsb,
  FaWifi,
  FaBluetooth,
  FaMicrochip,
  FaBolt,
  FaImage
} from 'react-icons/fa';

const AccessoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [accessory, setAccessory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLargeImage, setShowLargeImage] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(null);
  const { addToCart, isLoggedIn, updateQuantity } = useContext(CartContext);

  useEffect(() => {
    fetchAccessoryDetails();
  }, [id]);

  const fetchAccessoryDetails = async () => {
    const BASE_URL = `http://${window.location.hostname}:4000`;
    console.log(`Fetching accessory details from: ${BASE_URL}/api/accessories/${id}`);
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/accessories/${id}`);
      const data = await response.json();
      console.log('Fetched accessory data:', data);
      
      if (data.success) {
        setAccessory(data.data);
      } else {
        setError('Accessory not found');
      }
    } catch (error) {
      console.error('Error fetching accessory:', error);
      setError('Failed to load accessory details');
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

  // Fixed: Changed 'product' to 'accessory'
  const handleAddToCart = () => {
    // Create a cart item object with all necessary fields
    const cartItem = {
      id: accessory._id,
      name: accessory.name,
      price: accessory.price,
      finalPrice: accessory.price,
      originalPrice: accessory.originalPrice,
      image: accessory.images && accessory.images.length > 0 ? [accessory.images[0]] : [],
      description: accessory.description,
      brand: accessory.brand,
      category: accessory.category,
      type: 'accessory',
      quantity: quantity,
      inStock: accessory.inStock,
      specs: accessory.specs,
      features: accessory.features,
      connectivity: accessory.connectivity,
      warranty: accessory.warranty
    };
    
    addToCart(cartItem);
    console.log('Adding to cart:', cartItem);
    navigate('/cart');
  };

  const handleBuyNow = () => {
    // Create a product object for payment
    const paymentProduct = {
      _id: accessory._id,
      name: accessory.name,
      price: accessory.price,
      finalPrice: accessory.price,
      originalPrice: accessory.originalPrice,
      image: accessory.images,
      description: accessory.description,
      brand: accessory.brand,
      category: accessory.category,
      type: 'accessory',
      quantity: quantity,
      specs: accessory.specs,
      features: accessory.features
    };
    
    navigate('/payment', { state: { product: paymentProduct } });
  };

  const handlePreviousImage = () => {
    if (accessory?.images?.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? accessory.images.length - 1 : prevIndex - 1
      );
    }
  };

  const handleNextImage = () => {
    if (accessory?.images?.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === accessory.images.length - 1 ? 0 : prevIndex + 1
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

  // Get connectivity icon
  const getConnectivityIcon = (connectivity) => {
    if (!connectivity) return null;
    if (connectivity.includes('Bluetooth')) return <FaBluetooth className="text-blue-500" />;
    if (connectivity.includes('Wireless')) return <FaWifi className="text-blue-500" />;
    if (connectivity.includes('USB')) return <FaUsb className="text-blue-500" />;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading accessory details...</p>
        </div>
      </div>
    );
  }

  if (error || !accessory) {
    return (
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <div className="text-center border-4 border-black p-12 max-w-lg">
          <h2 className="text-3xl font-bold text-black mb-4">Accessory Not Found</h2>
          <p className="text-gray-600 mb-8">{error || "The accessory you're looking for doesn't exist."}</p>
          <button 
            onClick={() => navigate('/accessibility')}
            className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors border-2 border-black"
          >
            BACK TO ACCESSORIES
          </button>
        </div>
      </div>
    );
  }

  const images = accessory.images || [];
  const discountPercentage = accessory.originalPrice && accessory.originalPrice > accessory.price
    ? Math.round(((accessory.originalPrice - accessory.price) / accessory.originalPrice) * 100) 
    : 0;

  return (
    <>
      <Helmet>
        <title>{accessory.name} | 7HubComputers Accessories</title>
        <meta name="description" content={accessory.description} />
      </Helmet>

      <div className="bg-white pt-24 md:pt-28 pb-20 min-h-screen">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <button onClick={() => navigate('/')} className="hover:text-black">Home</button>
            <span>/</span>
            <button onClick={() => navigate('/accessibility')} className="hover:text-black">Accessories</button>
            <span>/</span>
            <span className="text-black font-medium truncate">{accessory.name}</span>
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
                        src={images[currentImageIndex]}
                        alt={accessory.name}
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

                  {/* Connectivity Badge */}
                  {accessory.connectivity && (
                    <div className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1.5 border-2 border-white flex items-center gap-1">
                      {getConnectivityIcon(accessory.connectivity)}
                      <span>{accessory.connectivity}</span>
                    </div>
                  )}

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
                    ${accessory.inStock ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {accessory.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                  </span>
                  <span className="text-xs text-gray-500">Brand: {accessory.brand}</span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 leading-tight">
                  {accessory.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i} 
                        className={`w-5 h-5 ${
                          i < Math.floor(accessory.rating || 0) ? 'text-yellow-500' : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {accessory.rating || 0} · {accessory.reviewCount || 0} Reviews
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4">
                <span className="text-4xl md:text-5xl font-bold text-black">
                  ₹{(accessory.price * quantity).toLocaleString()}
                </span>
                {accessory.originalPrice && accessory.originalPrice > accessory.price && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      ₹{(accessory.originalPrice * quantity).toLocaleString()}
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
                  <span className="text-xs text-gray-600">{accessory.warranty || '1 Year'} Warranty</span>
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
                  {accessory.description}
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
                <span className="text-sm text-gray-500">Stock: {accessory.quantity}</span>
              </div>

              {/* Specifications */}
              {accessory.specs && accessory.specs.length > 0 && (
                <div className="border-2 border-black p-6">
                  <h3 className="text-lg font-bold text-black mb-4">Specifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {accessory.specs.map((spec, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 border border-gray-300 text-sm text-gray-700">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              {accessory.features && accessory.features.length > 0 && (
                <div className="border-2 border-black p-6">
                  <h3 className="text-lg font-bold text-black mb-4">Features</h3>
                  <ul className="space-y-2">
                    {accessory.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <FaCheck className="text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-4">
                {accessory.size && (
                  <div className="border border-gray-200 p-3">
                    <p className="text-xs text-gray-500">Size</p>
                    <p className="text-sm font-bold text-black">{accessory.size}</p>
                  </div>
                )}
                {accessory.color && (
                  <div className="border border-gray-200 p-3">
                    <p className="text-xs text-gray-500">Color</p>
                    <p className="text-sm font-bold text-black">{accessory.color}</p>
                  </div>
                )}
                {accessory.compatibility && (
                  <div className="border border-gray-200 p-3">
                    <p className="text-xs text-gray-500">Compatibility</p>
                    <p className="text-sm font-bold text-black">{accessory.compatibility}</p>
                  </div>
                )}
                {accessory.connectivity && (
                  <div className="border border-gray-200 p-3">
                    <p className="text-xs text-gray-500">Connectivity</p>
                    <p className="text-sm font-bold text-black flex items-center gap-1">
                      {getConnectivityIcon(accessory.connectivity)}
                      {accessory.connectivity}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!accessory.inStock}
                  className={`flex-1 py-4 px-6 text-lg font-medium border-2 border-black flex items-center justify-center gap-3 ${
                    accessory.inStock 
                      ? 'bg-black text-white hover:bg-gray-800 transition-colors' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaShoppingCart /> ADD TO CART
                </button>
                
                {accessory.inStock && (
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
              alt={`Large view of ${accessory.name}`}
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

export default AccessoryDetails;