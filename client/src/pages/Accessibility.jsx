import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUsb, 
  FaThermometerHalf, 
  FaKeyboard, 
  FaMouse, 
  FaHeadphones, 
  FaWifi, 
  FaBluetooth,
  FaMicrochip,
  FaBolt,
  FaStar,
  FaShoppingCart,
  FaArrowLeft,
  FaFilter,
  FaChevronDown,
  FaSpinner
} from 'react-icons/fa';

const Accessibility = () => {
  const [accessories, setAccessories] = useState([]);
  const [filteredAccessories, setFilteredAccessories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch accessories from backend
  useEffect(() => {
    fetchAccessories();
  }, []);

  const BASE_URL = `http://${window.location.hostname}:4000`;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";

    // Already full URL (Cloudinary, CDN, etc.)
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // If path starts with /
    if (imagePath.startsWith("/")) {
      return `${BASE_URL}${imagePath}`;
    }

    // If only filename
    return `${BASE_URL}/uploads/${imagePath}`;
  };

  const fetchAccessories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/accessories`);
      const data = await response.json();
      
      if (data.success) {
        setAccessories(data.data);
        setFilteredAccessories(data.data);
        
        // Generate categories from fetched data
        const categoryMap = {};
        data.data.forEach(item => {
          if (!categoryMap[item.category]) {
            categoryMap[item.category] = {
              count: 0,
              totalPrice: 0
            };
          }
          categoryMap[item.category].count++;
          categoryMap[item.category].totalPrice += item.price;
        });

        const categoryList = [
          { id: 'all', name: 'All Accessories', icon: <FaMicrochip />, count: data.data.length },
          ...Object.keys(categoryMap).map(cat => ({
            id: cat,
            name: formatCategoryName(cat),
            icon: getCategoryIcon(cat),
            count: categoryMap[cat].count
          }))
        ];
        
        setCategories(categoryList);
      } else {
        setError('Failed to load accessories');
      }
    } catch (err) {
      console.error('Error fetching accessories:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Format category name for display
  const formatCategoryName = (category) => {
    const names = {
      'pendrive': 'Pen Drives',
      'heatsink': 'Heat Sinks',
      'keyboard-wired': 'Wired Keyboards',
      'keyboard-wireless': 'Wireless Keyboards',
      'mouse-wired': 'Wired Mice',
      'mouse-wireless': 'Wireless Mice',
      'mousepad': 'Mouse Pads',
      'headphone-wired': 'Wired Headphones',
      'headphone-wireless': 'Wireless Headphones'
    };
    return names[category] || category;
  };

  // Get icon for category
  const getCategoryIcon = (category) => {
    const icons = {
      'pendrive': <FaUsb />,
      'heatsink': <FaThermometerHalf />,
      'keyboard-wired': <FaKeyboard />,
      'keyboard-wireless': <FaWifi />,
      'mouse-wired': <FaMouse />,
      'mouse-wireless': <FaBluetooth />,
      'mousepad': <FaMicrochip />,
      'headphone-wired': <FaHeadphones />,
      'headphone-wireless': <FaBolt />
    };
    return icons[category] || <FaMicrochip />;
  };

  // Filter and sort accessories
  useEffect(() => {
    let filtered = [...accessories];

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
        case 'popular':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        default:
          return 0;
      }
    });

    setFilteredAccessories(filtered);
  }, [selectedCategory, sortOption, searchTerm, accessories]);

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowFilters(false);
  };

  // Handle add to cart
  const handleAddToCart = async (item) => {
    try {
      // You can integrate with your cart context here
      console.log('Adding to cart:', item);
      // Example: addToCart(item);
      
      // Show success message
      alert(`${item.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white pt-24 md:pt-28 pb-20 min-h-screen">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-64">
            <FaSpinner className="text-4xl text-black animate-spin mb-4" />
            <p className="text-gray-600">Loading accessories...</p>
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
              onClick={fetchAccessories}
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
            <FaMicrochip className="text-3xl text-black" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">Computer Accessories</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4">
            Accessibility
          </h1>
          <p className="text-lg text-gray-600">
            Everything you need to complete your setup - from storage to peripherals
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search accessories by name, brand, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
          />
        </div>

        {/* Mobile Filter Toggle */}
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center justify-between w-full border-2 border-black p-4 mb-6 bg-white"
        >
          <span className="flex items-center gap-2 font-medium">
            <FaFilter /> Categories & Sorting
          </span>
          <FaChevronDown className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Categories and Filters */}
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block mb-8`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 border-2 border-black bg-gray-50">
            
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
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

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Sort:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border-2 border-black p-2 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
              >
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-gray-500">
          Showing {filteredAccessories.length} {filteredAccessories.length === 1 ? 'product' : 'products'}
        </div>

        {/* Accessories Grid */}
        {filteredAccessories.length === 0 ? (
          <div className="text-center border-2 border-black p-12">
            <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
            <button 
              onClick={() => {
                setSelectedCategory('all');
                setSearchTerm('');
                setSortOption('popular');
              }}
              className="mt-4 bg-black text-white px-6 py-2 text-sm font-medium hover:bg-gray-800 transition-colors border-2 border-black"
            >
              CLEAR FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAccessories.map((item) => (
              <div key={item._id || item.id} className="group bg-white border-2 border-black hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
                
                {/* Product Image */}
                <div className="relative border-b-2 border-black overflow-hidden bg-gray-50">
                  <div className="aspect-square flex items-center justify-center p-6">
                    <img
                      src={getImageUrl(item.images?.[0] || item.image)}
                      alt={item.name}
                      className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Connectivity Badge */}
                  {item.connectivity && (
                    <div className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-2 py-1 border-2 border-white flex items-center gap-1">
                      {item.connectivity.includes('Bluetooth') ? <FaBluetooth /> : 
                       item.connectivity.includes('Wireless') ? <FaWifi /> : <FaUsb />}
                      <span>{item.connectivity}</span>
                    </div>
                  )}

                  {/* Discount Badge */}
                  {item.originalPrice && item.originalPrice > item.price && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 border-2 border-white">
                      -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5">
                  
                  {/* Brand/Category */}
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                      {item.brand}
                    </p>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <FaStar className="text-xs" />
                      <span className="text-xs font-bold text-black">{item.rating || 0}</span>
                      <span className="text-xs text-gray-500">({item.reviewCount || item.reviews || 0})</span>
                    </div>
                  </div>

                  {/* Product Name */}
                  <h3 className="text-base font-bold text-black mb-2 line-clamp-2">
                    {item.name}
                  </h3>

                  {/* Quick Specs */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(item.specs || []).slice(0, 3).map((spec, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 border border-gray-200">
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Features */}
                  <div className="mb-3">
                    {(item.features || []).slice(0, 2).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-1 text-xs text-gray-500">
                        <span className="text-green-500">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xl font-bold text-black">₹{item.price?.toLocaleString()}</span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-xs text-gray-400 line-through">₹{item.originalPrice.toLocaleString()}</span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="mb-3">
                    <span className={`text-xs font-bold px-2 py-1 ${item.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.inStock}
                      className={`flex-1 py-2 px-3 text-sm font-medium border-2 border-black flex items-center justify-center gap-2 ${
                        item.inStock 
                          ? 'bg-black text-white hover:bg-gray-800 transition-colors' 
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <FaShoppingCart /> ADD
                    </button>
                    <Link 
                      to={`/accessories/${item._id || item.id}`}
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

export default Accessibility;