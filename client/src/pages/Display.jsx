// src/pages/Display.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { 
  FaTv,
  FaDesktop,
  FaGamepad,
  FaRuler,
  FaClock,
  FaStar,
  FaShoppingCart,
  FaArrowLeft,
  FaFilter,
  FaChevronDown,
  FaMicrochip,
  FaPalette,
  FaBolt,
  FaTachometerAlt,
  FaExpand,
  FaMobileAlt,
  FaPlug,
  FaUsb,
  FaWifi,
  FaSpinner,
  FaCheckCircle
} from 'react-icons/fa';

const Display = () => {
  const [displays, setDisplays] = useState([]);
  const [filteredDisplays, setFilteredDisplays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState({}); // Track which items were added
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedResolution, setSelectedResolution] = useState('all');
  const [sortOption, setSortOption] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);

  // Helper function to get correct image URL
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
    return `http://localhost:4000/uploads/${filename}`;
  };

  // Fetch displays from backend
  useEffect(() => {
    fetchDisplays();
  }, []);

  const fetchDisplays = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/displays');
      const data = await response.json();
      
      if (data.success) {
        setDisplays(data.data);
        setFilteredDisplays(data.data);
        
        // Generate categories from fetched data
        const categoryMap = {};
        data.data.forEach(item => {
          if (!categoryMap[item.category]) {
            categoryMap[item.category] = 0;
          }
          categoryMap[item.category]++;
        });

        const categoryList = [
          { id: 'all', name: 'All Displays', icon: <FaTv />, count: data.data.length },
          ...Object.keys(categoryMap).map(cat => ({
            id: cat,
            name: cat.charAt(0).toUpperCase() + cat.slice(1),
            icon: getCategoryIcon(cat),
            count: categoryMap[cat]
          }))
        ];
        
        setCategories(categoryList);
      } else {
        setError('Failed to load displays');
      }
    } catch (err) {
      console.error('Error fetching displays:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Get icon for category
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'gaming': return <FaGamepad />;
      case 'professional': return <FaDesktop />;
      case 'ultrawide': return <FaExpand />;
      case 'portable': return <FaMobileAlt />;
      case 'office': return <FaDesktop />;
      default: return <FaTv />;
    }
  };

  // Filter and sort displays
  useEffect(() => {
    let filtered = [...displays];

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply size filter
    if (selectedSize !== 'all') {
      filtered = filtered.filter(item => {
        const sizeInches = parseInt(item.specs?.size);
        if (selectedSize === 'small') return sizeInches < 24;
        if (selectedSize === 'medium') return sizeInches >= 24 && sizeInches <= 30;
        if (selectedSize === 'large') return sizeInches > 30;
        return true;
      });
    }

    // Apply resolution filter
    if (selectedResolution !== 'all') {
      filtered = filtered.filter(item => {
        const res = item.specs?.resolution || '';
        if (selectedResolution === 'fhd') return res.includes('1080') || res.includes('FHD');
        if (selectedResolution === 'qhd') return res.includes('1440') || res.includes('QHD') || res.includes('2K');
        if (selectedResolution === '4k') return res.includes('2160') || res.includes('4K') || res.includes('UHD');
        if (selectedResolution === 'uw') return res.includes('3440') || res.includes('5120') || res.includes('Ultrawide');
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    setFilteredDisplays(filtered);
  }, [selectedCategory, selectedSize, selectedResolution, sortOption, displays]);

  const sizes = [
    { id: 'all', name: 'All Sizes' },
    { id: 'small', name: 'Under 24"' },
    { id: 'medium', name: '24"-30"' },
    { id: 'large', name: '30"+' }
  ];

  const resolutions = [
    { id: 'all', name: 'All Resolutions' },
    { id: 'fhd', name: 'FHD (1080p)' },
    { id: 'qhd', name: 'QHD/2K' },
    { id: '4k', name: '4K UHD' },
    { id: 'uw', name: 'Ultrawide' }
  ];

  // Helper function to get port icon
  const getPortIcon = (port) => {
    if (port?.includes('USB')) return <FaUsb className="text-xs" />;
    if (port?.includes('HDMI') || port?.includes('DisplayPort')) return <FaPlug className="text-xs" />;
    if (port?.includes('WiFi') || port?.includes('Bluetooth')) return <FaWifi className="text-xs" />;
    return <FaPlug className="text-xs" />;
  };

  // Handle add to cart - FIXED VERSION
  const handleAddToCart = (display, e) => {
    e.preventDefault(); // Prevent navigation if inside a link
    e.stopPropagation(); // Stop event bubbling
    
    // Create cart item object
    const cartItem = {
      id: display._id,
      productId: display._id,
      name: display.name,
      price: display.price,
      finalPrice: display.price,
      originalPrice: display.originalPrice || display.price,
      image: display.image || (display.images && display.images[0]),
      description: display.description,
      brand: display.brand,
      category: display.category,
      type: 'display',
      quantity: 1,
      inStock: display.inStock,
      specs: display.specs
    };
    
    // Add to cart using context
    addToCart(cartItem);

    // Navigate to cart
    navigate('/cart');
    
    // Show visual feedback
    setAddedToCart(prev => ({ ...prev, [display._id]: true }));
    
    // Optional: Show success message
    console.log(`${display.name} added to cart`);
    
    // Reset the "added" state after 2 seconds
    setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [display._id]: false }));
    }, 2000);
  };

  if (loading) {
    return (
      <div className="bg-white pt-24 md:pt-28 pb-20 min-h-screen">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-64">
            <FaSpinner className="text-4xl text-black animate-spin mb-4" />
            <p className="text-gray-600">Loading displays...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white pt-24 md:pt-28 pb-20 min-h-screen">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center border-4 border-black p-12 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-black mb-4">Error</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <button 
              onClick={fetchDisplays}
              className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors border-2 border-black"
            >
              TRY AGAIN
            </button>
          </div>
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
            <FaTv className="text-3xl text-black" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">Visual Excellence</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4">
            Displays & Monitors
          </h1>
          <p className="text-lg text-gray-600">
            From gaming to professional color-critical work - find your perfect display
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center justify-between w-full border-2 border-black p-4 mb-6 bg-white"
        >
          <span className="flex items-center gap-2 font-medium">
            <FaFilter /> Filters & Sorting
          </span>
          <FaChevronDown className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Filters */}
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block mb-8`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 border-2 border-black bg-gray-50">
            
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 text-sm font-medium border-2 transition-all flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? 'bg-black text-white border-black'
                      : 'border-gray-300 text-black hover:border-black hover:bg-gray-100'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    selectedCategory === cat.id
                      ? 'bg-white text-black'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Size Filter */}
            <div className="flex items-center gap-2">
              <FaRuler className="text-gray-500" />
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="border-2 border-black p-2 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
              >
                {sizes.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Resolution Filter */}
            <div className="flex items-center gap-2">
              <FaMicrochip className="text-gray-500" />
              <select
                value={selectedResolution}
                onChange={(e) => setSelectedResolution(e.target.value)}
                className="border-2 border-black p-2 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
              >
                {resolutions.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <FaTachometerAlt className="text-gray-500" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border-2 border-black p-2 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
              >
                <option value="popular">Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-gray-500">
          Showing {filteredDisplays.length} {filteredDisplays.length === 1 ? 'display' : 'displays'}
        </div>

        {/* Displays Grid */}
        {filteredDisplays.length === 0 ? (
          <div className="text-center border-2 border-black p-12">
            <p className="text-gray-600 text-lg">No displays found matching your criteria.</p>
            <button 
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSize('all');
                setSelectedResolution('all');
                setSortOption('popular');
              }}
              className="mt-4 bg-black text-white px-6 py-2 text-sm font-medium hover:bg-gray-800 transition-colors border-2 border-black"
            >
              CLEAR FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredDisplays.map((display) => (
              <div key={display._id} className="group bg-white border-2 border-black hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
                
                {/* Product Image */}
                <div className="relative border-b-2 border-black overflow-hidden bg-gray-50">
                  <Link to={`/display/${display._id}`}>
                    <div className="aspect-square flex items-center justify-center p-6">
                      <img
                        src={getDisplayImageUrl(display)}
                        alt={display.name}
                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>
                  </Link>

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-2 py-1 border-2 border-white flex items-center gap-1">
                    {display.category === 'gaming' && <FaGamepad />}
                    {display.category === 'professional' && <FaDesktop />}
                    {display.category === 'ultrawide' && <FaExpand />}
                    {display.category === 'portable' && <FaMobileAlt />}
                    <span className="capitalize">{display.category}</span>
                  </div>

                  {/* Discount Badge */}
                  {display.originalPrice && display.originalPrice > display.price && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 border-2 border-white">
                      -{Math.round(((display.originalPrice - display.price) / display.originalPrice) * 100)}%
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5">
                  
                  {/* Brand */}
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                      {display.brand}
                    </p>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <FaStar className="text-xs" />
                      <span className="text-xs font-bold text-black">{display.rating || 0}</span>
                      <span className="text-xs text-gray-500">({display.reviewCount || 0})</span>
                    </div>
                  </div>

                  {/* Product Name */}
                  <Link to={`/display/${display._id}`}>
                    <h3 className="text-base font-bold text-black mb-2 hover:underline line-clamp-2">
                      {display.name}
                    </h3>
                  </Link>

                  {/* Key Specs */}
                  <div className="grid grid-cols-2 gap-1 mb-3">
                    {display.specs?.size && (
                      <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 border border-gray-200 flex items-center gap-1">
                        <FaRuler className="text-xs" />
                        {display.specs.size}
                      </div>
                    )}
                    {display.specs?.resolution && (
                      <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 border border-gray-200">
                        {display.specs.resolution.split(' ')[0]}
                      </div>
                    )}
                    {display.specs?.panel && (
                      <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 border border-gray-200">
                        {display.specs.panel}
                      </div>
                    )}
                    {display.specs?.refreshRate && (
                      <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 border border-gray-200">
                        {display.specs.refreshRate}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  {display.features && display.features.length > 0 && (
                    <div className="mb-3">
                      {display.features.slice(0, 2).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-1 text-xs text-gray-500">
                          <span className="text-green-500">✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ports */}
                  {display.ports && display.ports.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {display.ports.slice(0, 2).map((port, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 border border-gray-200 flex items-center gap-1">
                          {getPortIcon(port)}
                          {port}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Color Gamut */}
                  {display.specs?.colorGamut && (
                    <div className="mb-3 flex items-center gap-1">
                      <FaPalette className="text-gray-400 text-xs" />
                      <span className="text-xs text-gray-500">{display.specs.colorGamut}</span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xl font-bold text-black">₹{display.price?.toLocaleString()}</span>
                    {display.originalPrice && display.originalPrice > display.price && (
                      <span className="text-xs text-gray-400 line-through">₹{display.originalPrice?.toLocaleString()}</span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="mb-3">
                    <span className={`text-xs font-bold px-2 py-1 ${display.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {display.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Actions - FIXED */}
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => handleAddToCart(display, e)}
                      disabled={!display.inStock}
                      className={`flex-1 py-2 px-3 text-sm font-medium border-2 border-black flex items-center justify-center gap-2 transition-all ${
                        display.inStock 
                          ? addedToCart[display._id]
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-black text-white hover:bg-gray-800' 
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {addedToCart[display._id] ? (
                        <>
                          <FaCheckCircle /> ADDED
                        </>
                      ) : (
                        <>
                          <FaShoppingCart /> ADD
                        </>
                      )}
                    </button>
                    
                    <Link 
                      to={`/display/${display._id}`}
                      className="px-3 py-2 border-2 border-black text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Home Button */}
        <div className="text-center mt-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-black border-b-2 border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors"
          >
            <FaArrowLeft /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Display;