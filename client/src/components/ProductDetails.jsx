import React, { useContext, useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useStripe } from '@stripe/react-stripe-js';
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
  FaMicrochip,
  FaMemory,
  FaHdd,
  FaTv,
  FaWindows,
  FaVideo,
  FaImages,
  FaStar as FaStarIcon,
  FaListUl,
  FaPlay
} from 'react-icons/fa';

const ProductDetails = () => {
  const stripe = useStripe();
  const { id } = useParams();
  const location = useLocation();
  const isRefurbished = location.pathname.includes('refurbished');
  const isMiniPC = location.pathname.includes('mini-pcs');

  const productType = isRefurbished
    ? 'refurbished-laptop'
    : isMiniPC
      ? 'Mini PC'
      : 'Pre-Built PC';

  const productId = id;

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart, isLoggedIn, updateQuantity } = useContext(CartContext);
  const navigate = useNavigate();

  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLargeImage, setShowLargeImage] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  const { 
    image: images = [], 
    name, 
    code, 
    description, 
    condition, 
    specs = {}, 
    finalPrice, 
    originalPrice, 
    discount, 
    otherTechnicalDetails: otherDetails, 
    bonuses, 
    reviews: initialReviews = [],
    keyFeatures = [],
    specifications = [],
    additionalImages = [],
    videos = []
  } = product || {};

  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [newReview, setNewReview] = useState("");
  const reviewsSectionRef = useRef(null);
  const [newImage, setNewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllAdditionalImages, setShowAllAdditionalImages] = useState(false);

  const [selectedSpecs, setSelectedSpecs] = useState({
    ramOptions: "",
    storage1Options: "",
    storage2Options: "",
  });

  const BASE_URL = `http://${window.location.hostname}:4000`;

  // Helper function to safely get value from specs
  const getSpecValue = (spec, defaultValue = 'Not specified') => {
    if (!spec) return defaultValue;
    if (Array.isArray(spec) && spec.length > 0) {
      return spec[0].value || spec[0] || defaultValue;
    }
    if (typeof spec === 'object') {
      return spec.value || spec.name || defaultValue;
    }
    return spec || defaultValue;
  };

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const filename = imagePath.split(/[\\/]/).pop();
    return `${BASE_URL}/uploads/${filename}`;
  };

  // Helper function to get video embed URL
  const getVideoEmbedUrl = (url) => {
    if (!url) return '';
    
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/(?:vimeo\.com\/)([0-9]+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    return url;
  };

  useEffect(() => {
    if (specs && specs.ramOptions && specs.storage1Options && specs.storage2Options) {
      setSelectedSpecs({
        ramOptions: specs.ramOptions[0]?._id || "",
        storage1Options: specs.storage1Options[0]?._id || "",
        storage2Options: specs.storage2Options[0]?._id || "",
      });
    }
  }, [specs]);

  useEffect(() => {
    const fetchProduct = async (page = 1, limit = 10) => {
      try {
        const response = await fetch(`${BASE_URL}/api/admin/products?page=${page}&limit=${limit}`);
        if (response.ok) {
          const data = await response.json();

          let productItem;

          if (isRefurbished) {
            productItem = data.refurbishedProducts.find((item) => item._id === id);
          } else if (isMiniPC) {
            productItem = data.miniPCs.find((item) => item._id === id);
          } else {
            productItem = [...data.prebuildPC, ...data.officePC].find((item) => item._id === id);
          }

          console.log('Found Product:', productItem);

          if (productItem) {
            setProduct(productItem);
            setReviews(productItem.reviews || []);
          } else {
            console.log('Product not found in the selected category');
            setProduct(null);
          }
        } else {
          console.log('Product not found in the API');
          setProduct(null);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct(1, 10);
  }, [id, isRefurbished, isMiniPC]);

  // Auto-scrolling for images
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3400);

    return () => clearInterval(interval);
  }, [images]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <div className="text-center border-4 border-black p-12 max-w-lg">
          <h2 className="text-3xl font-bold text-black mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors border-2 border-black"
          >
            RETURN HOME
          </button>
        </div>
      </div>
    );
  }

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
      updateQuantity(product.id, quantity - 1);
    }
  };

  // Function to calculate the price of the selected specs
  const getSelectedSpecsPrice = () => {
    let finalPrice = product.finalPrice;

    Object.entries(selectedSpecs).forEach(([category, selectedValue]) => {
      const specOptions = product.specs[category];
      if (specOptions) {
        const selectedOption = specOptions.find((option) => option._id === selectedValue);
        if (selectedOption) {
          finalPrice += selectedOption.price || 0;
        }
      }
    });

    return finalPrice;
  };

  const handleSpecChange = (category, value, isOther = false) => {
    if (isOther) {
      setSelectedSpecs(prevState => ({
        ...prevState,
        [`other_${category}`]: value,
      }));
    } else {
      setSelectedSpecs(prevState => ({
        ...prevState,
        [category]: value,
      }));
    }
  };

  const handlePreviousImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
    }
  };

  const handleNextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    console.log(`${product.name} added to cart`);
    navigate('/cart')
  };

  const getStarRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push('full');
      } else if (rating >= i - 0.5) {
        stars.push('half');
      } else {
        stars.push('empty');
      }
    }
    return stars;
  };

  const stars = getStarRating(product.rating);

  const handleStarClick = (star) => {
    setReviewRating(star);
    if (reviewsSectionRef.current) {
      reviewsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Selected file:', file);
      const previewURL = URL.createObjectURL(file);
      setNewImage(previewURL);
      setImageFile(file);
    }
  };

  const handleAddReview = async () => {
    if (newReview.trim()) {

      const user = JSON.parse(localStorage.getItem('userId'));
      const reviewerName = user?.name || 'Anonymous';

      const formData = new FormData();
      formData.append('reviewerName', reviewerName);
      formData.append('text', newReview);
      formData.append('rating', reviewRating);

      if (imageFile) {
        formData.append('image', imageFile);
      } else {
        console.error('No valid image selected');
      }

      for (let pair of formData.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }

      try {
        const apiUrl = `http://${window.location.hostname}:4000`;

        const response = await fetch(`${apiUrl}/api/admin/products/${encodeURIComponent(productType)}/${encodeURIComponent(productId)}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Server response:", data);
          if (data && data.review) {
            setReviews([...reviews, data.review]);
            setNewReview("");
            setNewImage(null);
            setReviewRating(0);
          }
        } else {
          console.error('Failed to submit review');
        }
      } catch (error) {
        console.error('Error submitting review:', error);
      }
    }
  };

  const downloadQuotation = async (productId, productName) => {
    try {
      const response = await fetch(`${BASE_URL}/api/download-quotation/${productId}`);

      if (!response.ok) throw new Error("Failed to fetch quotation");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Quotation-${productName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download Error:", error);
    }
  };

  const handleConfirmPayment = async () => {
    navigate('/payment', { state: { product } });
  };

  const handleThumbnailClick = (index) => {
    setModalImageIndex(index);
    setShowLargeImage(true);
  };

  const handleCancelImage = () => {
    setShowLargeImage(false);
    setModalImageIndex(null);
  };

  const handleVideoClick = (index) => {
    setActiveVideoIndex(index);
    setShowVideoModal(true);
  };

  const handleCloseVideo = () => {
    setShowVideoModal(false);
    setActiveVideoIndex(null);
  };

  const totalPrice = getSelectedSpecsPrice() * quantity;
  const discountPercentage = originalPrice ? Math.round(((originalPrice - totalPrice) / originalPrice) * 100) : 0;

  // Combine main images and additional images for display
  const allImages = [...(images || []), ...(additionalImages || [])];

  // Render refurbished laptop specifications
  const renderRefurbishedSpecs = () => {
    if (!isRefurbished) return null;

    return (
      <div className="border-4 border-black p-6 bg-white mt-8">
        <h3 className="text-xl font-bold text-black mb-6 border-b-2 border-black pb-2 flex items-center gap-2">
          <FaMicrochip /> Laptop Specifications
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Processor / CPU */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 border-2 border-black">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-full flex-shrink-0">
              <FaMicrochip />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Processor</p>
              <p className="text-base font-bold text-black">
                {getSpecValue(specs?.cpu)}
              </p>
            </div>
          </div>

          {/* RAM */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 border-2 border-black">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-full flex-shrink-0">
              <FaMemory />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">RAM</p>
              <p className="text-base font-bold text-black">
                {getSpecValue(specs?.ram) || '8GB DDR4'}
              </p>
            </div>
          </div>

          {/* Storage */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 border-2 border-black">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-full flex-shrink-0">
              <FaHdd />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Storage</p>
              <p className="text-base font-bold text-black">
                {getSpecValue(specs?.storage) || '512GB SSD'}
              </p>
            </div>
          </div>

          {/* Display */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 border-2 border-black">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-full flex-shrink-0">
              <FaTv />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Display</p>
              <p className="text-base font-bold text-black">
                {getSpecValue(specs?.display) || '15.6" FHD (1920x1080)'}
              </p>
            </div>
          </div>

          {/* Graphics Card */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 border-2 border-black">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-full flex-shrink-0">
              <FaVideo />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Graphics Card</p>
              <p className="text-base font-bold text-black">
                {getSpecValue(specs?.GraphicCard)}
              </p>
            </div>
          </div>

          {/* Operating System */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 border-2 border-black">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-full flex-shrink-0">
              <FaWindows />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Operating System</p>
              <p className="text-base font-bold text-black">
                {getSpecValue(specs?.os) || 'Windows 11 Pro'}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Specs if available */}
        {(specs?.condition || condition) && (
          <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-500">
            <div className="flex items-center gap-3">
              <span className="text-yellow-600 font-bold">Condition:</span>
              <span className="text-black font-medium">{condition || specs?.condition || 'Excellent'}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Pre-Built PC and Mini PC specifications
  const renderStandardSpecs = () => {
    if (!specs || Object.keys(specs).length === 0) return null;

    return (
      <div className="border-4 border-black p-6 bg-white mt-8">
        <h3 className="text-xl font-bold text-black mb-6 border-b-2 border-black pb-2 flex items-center gap-2">
          <FaMicrochip /> System Specifications
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* RAM */}
          {specs.ram && (
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">RAM</span>
              <span className="text-sm font-bold text-black">{getSpecValue(specs.ram)}</span>
            </div>
          )}

          {/* Storage */}
          {specs.storage && (
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Storage</span>
              <span className="text-sm font-bold text-black">{getSpecValue(specs.storage)}</span>
            </div>
          )}

          {/* Graphics Card */}
          {(specs.graphiccard || specs.gpu) && (
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Graphics Card</span>
              <span className="text-sm font-bold text-black">
                {getSpecValue(specs.graphiccard) || getSpecValue(specs.gpu)}
              </span>
            </div>
          )}

          {/* CPU */}
          {specs.cpu && (
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">CPU</span>
              <span className="text-sm font-bold text-black">{getSpecValue(specs.cpu)}</span>
            </div>
          )}

          {/* platform */}
          {specs.platform && (
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Platform</span>
              <span className="text-sm font-bold text-black">{getSpecValue(specs.platform)}</span>
            </div>
          )}

          {/* Motherboard */}
          {specs.motherboard && (
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Motherboard</span>
              <span className="text-sm font-bold text-black">{getSpecValue(specs.motherboard)}</span>
            </div>
          )}

          {/* Power Supply */}
          {specs.smps && (
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Power Supply</span>
              <span className="text-sm font-bold text-black">{getSpecValue(specs.smps)}</span>
            </div>
          )}
          

          {/* Cabinet/Case */}
          {specs.cabinet && (
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Cabinet</span>
              <span className="text-sm font-bold text-black">{getSpecValue(specs.cabinet)}</span>
            </div>
          )}

          {/* Cooling System */}
          {specs.liquidcooler && (
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Liquid Cooling</span>
              <span className="text-sm font-bold text-black">{getSpecValue(specs.liquidcooler)}</span>
            </div>
          )}

          {/* Operating System */}
          {specs.os && (
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Operating System</span>
              <span className="text-sm font-bold text-black">{getSpecValue(specs.os)}</span>
            </div>
          )}

          {/* SMPS */}
          {specs.smps && (
            <div className="flex justify-between items-center p-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">SMPS</span>
              <span className="text-sm font-bold text-black">{getSpecValue(specs.smps)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>{product ? `${product.name} | 7HubComputers` : "Product Details"}</title>
        <meta name="description" content={product?.description || "Product details page"} />
        <meta property="og:title" content={product?.name || "Product Details"} />
        <meta property="og:description" content={product?.description || "Product details page"} />
        <meta property="og:image" content={images?.[0] ? getImageUrl(images[0]) : "default-image-url"} />
      </Helmet>

      <div className="bg-white pt-24 md:pt-28 pb-20 min-h-screen">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <button onClick={() => navigate('/')} className="hover:text-black">Home</button>
            <span>/</span>
            <button onClick={() => navigate(`/${isRefurbished ? 'laptops' : isMiniPC ? 'mini-pcs' : 'prebuilt'}`)} 
                    className="hover:text-black">
              {isRefurbished ? 'Laptops' : isMiniPC ? 'Mini PCs' : 'Pre-Built PCs'}
            </button>
            <span>/</span>
            <span className="text-black font-medium truncate">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Left Column - Product Images */}
            <div className="relative">
              <div className="sticky top-28">
                {/* Main Image */}
                <div className="border-4 border-black bg-white mb-4 group relative overflow-hidden">
                  <div className="aspect-square flex items-center justify-center p-8 bg-gray-50">
                    <img
                      src={getImageUrl(images[currentImageIndex])}
                      alt={product.name}
                      className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  
                  {product.type === "Refurbished Laptop" && (
                    <div className="absolute bottom-4 left-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1.5 border-2 border-white">
                      {condition || 'New'}
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
                          src={getImageUrl(img)}
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
                    ${product.inStock ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {product.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                  </span>
                  <span className="text-xs text-gray-500">SKU: {code || '7HUB-001'}</span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 leading-tight">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    {stars.map((star, index) => (
                      <FaStar 
                        key={index} 
                        className={`w-5 h-5 ${
                          star === 'full' ? 'text-yellow-500' : 
                          star === 'half' ? 'text-yellow-500 opacity-50' : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating || '4.8'} · {reviews.length || 0} Reviews
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4">
                <span className="text-4xl md:text-5xl font-bold text-black">
                  ₹{totalPrice.toLocaleString()}
                </span>
                {originalPrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      ₹{(originalPrice * quantity).toLocaleString()}
                    </span>
                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1.5 border border-green-200">
                      Save {discountPercentage}%
                    </span>
                  </>
                )}
              </div>

              {/* Bonus Info */}
              {bonuses && (
                <p className="text-sm text-blue-600 font-medium flex items-center gap-2">
                  <FaTag /> +{bonuses} bonuses with purchase
                </p>
              )}

              {/* Key Features - NEW SECTION */}
              {keyFeatures && keyFeatures.length > 0 && (
                <div className="border-4 border-black p-6 bg-gradient-to-br from-gray-50 to-white">
                  <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
                    <FaStarIcon className="text-yellow-500" /> Key Features
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {keyFeatures.map((feature, index) => (
                      <div key={index} className="border-2 border-black p-4 bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                        <h4 className="font-bold text-black text-lg mb-2">{feature.title}</h4>
                        <p className="text-gray-700 text-sm">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 py-4 border-y-2 border-gray-200">
                <div className="flex items-center gap-2">
                  <FaTruck className="text-gray-600" />
                  <span className="text-xs text-gray-600">Free Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUndo className="text-gray-600" />
                  <span className="text-xs text-gray-600">30 Day Returns</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-black mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {description || 'Experience premium performance with this high-quality system.'}
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
              </div>

              {/* Refurbished Laptop Specifications */}
              {isRefurbished && renderRefurbishedSpecs()}

              {/* Pre-Built PC and Mini PC Specifications */}
              {!isRefurbished && renderStandardSpecs()}

              {/* Specifications Dropdowns (for Pre-Built PCs with options) */}
              {!isRefurbished && specs && (specs.ramOptions || specs.storage1Options || specs.storage2Options) && (
                <div className="space-y-4 border-2 border-black p-6">
                  <h3 className="text-lg font-bold text-black">Customize Your Build</h3>
                  
                  {specs.ramOptions && (
                    <div>
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                        RAM Options
                      </label>
                      <select 
                        className="w-full border-2 border-black p-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-black"
                        value={selectedSpecs.ramOptions || ''}
                        onChange={(e) => handleSpecChange('ramOptions', e.target.value)}
                      >
                        {specs.ramOptions.map((opt, idx) => (
                          <option key={idx} value={opt._id}>
                            {opt.value} {opt.price > 0 && `(+₹${opt.price})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {specs.storage1Options && (
                    <div>
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                        Primary Storage
                      </label>
                      <select 
                        className="w-full border-2 border-black p-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-black"
                        value={selectedSpecs.storage1Options || ''}
                        onChange={(e) => handleSpecChange('storage1Options', e.target.value)}
                      >
                        {specs.storage1Options.map((opt, idx) => (
                          <option key={idx} value={opt._id}>
                            {opt.value} {opt.price > 0 && `(+₹${opt.price})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {specs.storage2Options && (
                    <div>
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                        Secondary Storage
                      </label>
                      <select 
                        className="w-full border-2 border-black p-3 bg-white focus:outline-none focus:ring-2 focus:ring-black text-black"
                        value={selectedSpecs.storage2Options || ''}
                        onChange={(e) => handleSpecChange('storage2Options', e.target.value)}
                      >
                        {specs.storage2Options.map((opt, idx) => (
                          <option key={idx} value={opt._id}>
                            {opt.value} {opt.price > 0 && `(+₹${opt.price})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-black text-white py-4 px-6 text-lg font-medium hover:bg-gray-800 transition-colors border-2 border-black flex items-center justify-center gap-3"
                >
                  <FaShoppingCart /> ADD TO CART
                </button>
                
                {product.inStock && (
                  <button
                    onClick={handleConfirmPayment}
                    disabled={!stripe}
                    className="flex-1 bg-white text-black py-4 px-6 text-lg font-medium hover:bg-gray-100 transition-colors border-2 border-black"
                  >
                    BUY NOW
                  </button>
                )}
              </div>

              {productType === "Pre-Built PC" && (
                <button
                  onClick={() => downloadQuotation(product._id, product.name)}
                  className="w-full bg-yellow-500 text-black py-3 px-6 text-sm font-medium hover:bg-yellow-600 transition-colors border-2 border-yellow-500"
                >
                  DOWNLOAD QUOTATION
                </button>
              )}

              {/* Error/Success Messages */}
              {paymentError && (
                <div className="border-2 border-red-500 bg-red-50 p-4">
                  <p className="text-red-700">{paymentError}</p>
                </div>
              )}
              {paymentSuccess && (
                <div className="border-2 border-green-500 bg-green-50 p-4">
                  <p className="text-green-700">{paymentSuccess}</p>
                </div>
              )}
            </div>
          </div>

          {/* GROUPED SPECIFICATIONS SECTION - NEW */}
          {specifications && specifications.length > 0 && (
            <div className="mt-16 border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-bold text-black mb-6 border-b-2 border-black pb-2 flex items-center gap-2">
                <FaListUl className="text-indigo-600" /> Detailed Specifications
              </h2>
              
              <div className="space-y-8">
                {specifications.map((group, groupIndex) => (
                  <div key={groupIndex} className="border-2 border-black p-6 bg-gray-50">
                    <h3 className="text-xl font-bold text-black mb-4 bg-white inline-block px-4 py-2 border-2 border-black">
                      {group.title}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.specs && group.specs.map((spec, specIndex) => (
                        <div key={specIndex} className="flex justify-between items-center p-3 border-b border-gray-300">
                          <span className="text-sm font-medium text-gray-700">{spec.name}</span>
                          <span className="text-sm font-bold text-black">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADDITIONAL IMAGES GALLERY - NEW SECTION */}
          {additionalImages && additionalImages.length > 0 && (
            <div className="mt-16 border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-bold text-black mb-6 border-b-2 border-black pb-2 flex items-center gap-2">
                <FaImages className="text-green-600" /> Additional Product Images
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(showAllAdditionalImages ? additionalImages : additionalImages.slice(0, 8)).map((img, index) => (
                  <div 
                    key={index} 
                    className="border-2 border-black p-2 bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow cursor-pointer"
                    onClick={() => handleThumbnailClick(images.length + index)}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={getImageUrl(img)}
                        alt={`Additional ${index + 1}`}
                        className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {additionalImages.length > 8 && !showAllAdditionalImages && (
                <button
                  onClick={() => setShowAllAdditionalImages(true)}
                  className="mt-6 bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors border-2 border-black mx-auto block"
                >
                  View All {additionalImages.length} Images
                </button>
              )}
            </div>
          )}

          {/* VIDEOS SECTION - NEW */}
          {videos && videos.length > 0 ? (
            <div className="mt-16 border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-bold text-black mb-6 border-b-2 border-black pb-2 flex items-center gap-2">
                <FaVideo className="text-purple-600" /> Product Videos
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((video, index) => (
                  <div key={index} className="border-2 border-black p-4 bg-gray-50">
                    <div 
                      className="relative aspect-video bg-black cursor-pointer group"
                      onClick={() => handleVideoClick(index)}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${getVideoEmbedUrl(video.url)?.split('/').pop()}/0.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/video-placeholder.jpg';
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center border-4 border-white group-hover:scale-110 transition-transform">
                          <FaPlay className="text-white text-2xl ml-1" />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-black mt-3">{video.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-16 border-4 border-gray-300 p-8 bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
              <div className="flex flex-col items-center justify-center text-center">
                <FaVideo className="text-gray-400 text-5xl mb-4" />
                <h2 className="text-2xl font-bold text-gray-500 mb-2">Product Videos</h2>
                <p className="text-gray-400 text-lg">No videos available for this product</p>
              </div>
            </div>
          )}

          {/* Technical Specifications Table */}
          {otherDetails && otherDetails.length > 0 && (
            <div className="mt-16 border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-bold text-black mb-6 border-b-2 border-black pb-2">
                Technical Specifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherDetails.map((detail, index) => {
                  // Handle different possible object structures
                  let name = '';
                  let value = '';

                  if (typeof detail === 'string') {
                    // If it's just a string, try to split by colon
                    const parts = detail.split(':');
                    if (parts.length > 1) {
                      name = parts[0].trim();
                      value = parts.slice(1).join(':').trim();
                    } else {
                      name = `Specification ${index + 1}`;
                      value = detail;
                    }
                  } else if (detail && typeof detail === 'object') {
                    // Try different common property names
                    name = detail.name || detail.label || detail.key || detail.title || 
                           detail.spec || detail.attribute || `Specification ${index + 1}`;

                    value = detail.value || detail.val || detail.description || detail.data || 
                            detail.specification || JSON.stringify(detail).replace(/[{}"]/g, '');
                  }

                  return (
                    <div 
                      key={index} 
                      className="group flex items-start gap-3 py-3 border-b border-gray-200 hover:bg-gray-50 px-2 transition-colors duration-200"
                    >
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {name}
                        </div>
                        <div className="text-sm font-medium text-black mt-1 break-words">
                          {value}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes Section */}
          {product.notes && product.notes.length > 0 && (
            <div className="mt-16 border-4 border-yellow-500 bg-yellow-50 p-8">
              <h2 className="text-2xl font-bold text-yellow-700 mb-4">Important Notes</h2>
              <ul className="list-disc list-inside space-y-2">
                {product.notes.map((note, index) => (
                  <li key={index} className="text-yellow-800">
                    {note.replace(/[\[\],\\]/g, '').trim()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reviews Section */}
          <div ref={reviewsSectionRef} className="mt-16 border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-bold text-black mb-6 border-b-2 border-black pb-2">
              Customer Reviews
            </h2>

            {/* Add Review Form */}
            <div className="border-2 border-black p-6 mb-8">
              <h3 className="text-lg font-bold text-black mb-4">Write a Review</h3>
              
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className={`cursor-pointer text-2xl ${
                      reviewRating >= star ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:bg-white file:text-black hover:file:bg-gray-100"
              />
              
              {newImage && (
                <img src={newImage} alt="Review" className="w-20 h-20 object-cover border-2 border-black mb-4" />
              )}

              <textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="Share your experience with this product..."
                className="w-full p-4 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black mb-4"
                rows="4"
              />

              <button
                onClick={handleAddReview}
                className="bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors border-2 border-black"
              >
                SUBMIT REVIEW
              </button>
            </div>

            {/* Existing Reviews */}
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-black">{review.username || `User ${index + 1}`}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{new Date().toLocaleDateString()}</span>
                    </div>
                    {review.image && (
                      <img 
                        src={getImageUrl(review.image)} 
                        alt="Review" 
                        className="w-20 h-20 object-cover border-2 border-black mb-3"
                      />
                    )}
                    <p className="text-gray-700 text-sm">{review.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
            )}
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
              src={getImageUrl(allImages[modalImageIndex])}
              alt={`Large view of ${product.name}`}
              className="w-full h-auto max-h-[80vh] object-contain"
            />

            {/* Thumbnail Navigation in Modal */}
            <div className="flex justify-center gap-2 mt-6 overflow-x-auto pb-2">
              {allImages.map((thumb, index) => (
                <button
                  key={index}
                  onClick={() => setModalImageIndex(index)}
                  className={`w-16 h-16 border-2 transition-all flex-shrink-0 ${
                    modalImageIndex === index ? 'border-white scale-110' : 'border-gray-600'
                  }`}
                >
                  <img
                    src={getImageUrl(thumb)}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Video Modal - Keep this outside the conditional */}
      {showVideoModal && activeVideoIndex !== null && videos[activeVideoIndex] && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-4xl w-full mx-4">
            <button
              onClick={handleCloseVideo}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <FaTimes size={24} />
            </button>
            
            <div className="aspect-video bg-black">
              <iframe
                src={getVideoEmbedUrl(videos[activeVideoIndex].url)}
                title={videos[activeVideoIndex].title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            
            <h3 className="text-white text-xl font-bold mt-4">{videos[activeVideoIndex].title}</h3>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetails;