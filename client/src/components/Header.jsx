// src/components/Header.jsx
import React, { useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FaShoppingCart, FaUserCircle, FaSearch, FaGift, FaFire, FaPercent, FaTimes } from 'react-icons/fa';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { cartItems } = useContext(CartContext);
  const [suggestions, setSuggestions] = useState([]);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [deliveredOrdersCount, setDeliveredOrdersCount] = useState(0);
  const [error, setError] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();
  const BASE_URL = `http://${window.location.hostname}:4000`;

  // Handle scroll effect for glass morphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
        setSearchTerm('');
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch all products for search suggestions
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        // Fetch from all three endpoints
        const [productsRes, displaysRes, accessoriesRes] = await Promise.all([
          fetch(`${BASE_URL}/api/admin/products`),
          fetch(`${BASE_URL}/api/displays`),
          fetch(`${BASE_URL}/api/accessories`)
        ]);

        const productsData = await productsRes.json();
        const displaysData = await displaysRes.json();
        const accessoriesData = await accessoriesRes.json();

        let allItems = [];

        // Process PC products
        if (productsData && !productsData.error) {
          const pcProducts = [
            ...(productsData.prebuildPC || []).map(p => ({ ...p, _type: 'pc', category: p.category || 'pc' })),
            ...(productsData.officePC || []).map(p => ({ ...p, _type: 'pc', category: p.category || 'office' })),
            ...(productsData.refurbishedProducts || []).map(p => ({ ...p, _type: 'pc', category: 'refurbished' })),
            ...(productsData.miniPCs || []).map(p => ({ ...p, _type: 'pc', category: 'mini-pc' }))
          ];
          allItems = [...allItems, ...pcProducts];
        }

        // Process displays
        if (displaysData.success && displaysData.data) {
          const displayItems = displaysData.data.map(d => ({ 
            ...d, 
            _type: 'display',
            type: 'display',
            image: d.image || (d.images && d.images[0])
          }));
          allItems = [...allItems, ...displayItems];
        }

        // Process accessories
        if (accessoriesData.success && accessoriesData.data) {
          const accessoryItems = accessoriesData.data.map(a => ({ 
            ...a, 
            _type: 'accessory',
            type: 'accessory' 
          }));
          allItems = [...allItems, ...accessoryItems];
        }

        setAllProducts(allItems);

      } catch (err) {
        console.error('Error fetching products for search:', err);
      }
    };

    fetchAllProducts();
  }, []);

  // Helper function to get image URL
  const getImageUrl = (item) => {
    try {
      // Check if item exists
      if (!item) return '/placeholder-image.jpg';
      
      // Get image path - could be string, array, or undefined
      let imagePath = null;
      
      // Check for image property (could be string or array)
      if (item.image) {
        imagePath = item.image;
      } 
      // Check for images array
      else if (item.images && Array.isArray(item.images) && item.images.length > 0) {
        imagePath = item.images[0];
      }
      
      // If no image found
      if (!imagePath) {
        return '/placeholder-image.jpg';
      }
      
      // Handle case where imagePath is an array (take first item)
      if (Array.isArray(imagePath)) {
        if (imagePath.length === 0) return '/placeholder-image.jpg';
        imagePath = imagePath[0];
      }
      
      // Ensure imagePath is a string before using string methods
      if (typeof imagePath !== 'string') {
        return '/placeholder-image.jpg';
      }
      
      // If it's already a full URL, return it
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      
      // Extract just the filename (remove any path)
      const filename = imagePath.split(/[\\/]/).pop();
      
      if (!filename) {
        return '/placeholder-image.jpg';
      }
      
      return `${BASE_URL}/uploads/${filename}`;
      
    } catch (error) {
      console.error('Error in getImageUrl:', error);
      return '/placeholder-image.jpg';
    }
  };

  // Update suggestions based on search term
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = allProducts
      .filter(item => 
        (item.name?.toLowerCase().includes(searchLower)) ||
        (item.description?.toLowerCase().includes(searchLower)) ||
        (item.brand?.toLowerCase().includes(searchLower))
      )
      .slice(0, 5); // Limit to 5 suggestions

    setSuggestions(filtered);
  }, [searchTerm, allProducts]);

  // Fetch delivered orders count
  const fetchDeliveredOrdersCount = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      if (!user || !token) return;

      const response = await fetch(`${BASE_URL}/api/users/${user._id}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('❌ Failed to fetch orders:', response.statusText);
        throw new Error('Failed to fetch orders');
      }

      const orders = await response.json();

      // Count delivered orders
      const deliveredCount = orders.filter(order => {
        return order.status && order.status.toLowerCase() === 'delivered';
      }).length;

      setDeliveredOrdersCount(deliveredCount);

    } catch (error) {
      console.error('❌ Error in fetchDeliveredOrdersCount:', error);
      setDeliveredOrdersCount(0);
    }
  };

  // Fetch delivered orders when component mounts and when user logs in/out
  useEffect(() => {
    fetchDeliveredOrdersCount();

    // Add event listener for storage changes (login/logout)
    const handleStorageChange = () => {
      fetchDeliveredOrdersCount();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
      setSuggestions([]);
      setIsSearchOpen(false);
    }
  };

  const generateUrl = (product) => {
    // Check product type
    if (product._type === 'display') {
      return `/display/${product._id}`;
    } else if (product._type === 'accessory') {
      return `/accessories/${product._id}`;
    } else {
      // Handle PC products
      let type = product.type || "";
      if (typeof type !== "string") type = "pc";
      let basePath = "pc";
      const lowerCaseType = type.toLowerCase();
      if (lowerCaseType.includes("mini pc")) basePath = "mini-pcs";
      else if (lowerCaseType.includes("refurbished")) basePath = "refurbished";
      return `/${basePath}/${product._id}`;
    }
  };

  const handleSuggestionClick = (product) => {
    const productUrl = generateUrl(product);
    navigate(productUrl);
    setSearchTerm('');
    setSuggestions([]);
    setIsSearchOpen(false);
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleAccountMenu = () => setIsAccountMenuOpen(!isAccountMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  const isLoggedIn = Boolean(localStorage.getItem('user'));

  const handleSignOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsAccountMenuOpen(false);
    navigate('/');
  };

  const closeNotification = () => {
    setShowNotification(false);
  };

  return (
    <>
      {/* 🔥 HIGHLIGHTED NOTIFICATION BAR - Full Width Solid Red */}
      {showNotification && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-10">
              
              {/* Left side - Fire Icon with NO extra spacing */}
              <div className="flex items-center flex-shrink-0 pl-4">
                <FaFire className="text-white text-xl animate-pulse" />
              </div>
                
                {/* Scrolling Text Container - full width */}
                <div className="overflow-hidden flex-1 mx-0">
                  <div className="flex items-center space-x-8 animate-scroll">
                    <span className="text-sm font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-2">
                      <FaGift className="text-white" /> SUMMER SALE - 40% OFF
                    </span>
                    <span className="text-sm font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-2">
                      <FaPercent className="text-white" /> GAMING PCs UP TO 40% OFF
                    </span>
                    <span className="text-sm font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-2">
                      <FaFire className="text-white" /> FREE SHIPPING ON ALL ORDERS
                    </span>
                    <span className="text-sm font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-2">
                      <FaGift className="text-white" /> EXTRA 10% OFF FIRST PURCHASE
                    </span>
                    {/* Duplicate content for seamless looping */}
                    <span className="text-sm font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-2">
                      <FaGift className="text-white" /> SUMMER SALE - 40% OFF
                    </span>
                    <span className="text-sm font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-2">
                      <FaPercent className="text-white" /> GAMING PCs UP TO 40% OFF
                    </span>
                  </div>
                </div>
              

              {/* Right side - Close button only */}
              <button 
                onClick={closeNotification}
                className="text-white/90 hover:text-white transition-colors flex-shrink-0 pr-4"
                aria-label="Close notification"
              >
                <FaTimes size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Glass Header - Full Width */}
      <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-lg' 
          : 'bg-white/70 backdrop-blur-sm'
      } ${showNotification ? 'top-10' : 'top-0'}`}>
        
        {/* Top Bar - Full Width */}
        <div className={`border-b transition-all duration-300 ${
          isScrolled ? 'border-white/20' : 'border-gray-200/50'
        } bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-sm`}>
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-8 text-xs text-gray-700">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Free shipping on orders over ₹50,000</span>
                <span className="ml-2 text-orange-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                  {deliveredOrdersCount}+ deliveries completed
                </span>
              </span>
              <div className="flex items-center space-x-6">
                <span className="hidden md:inline hover:text-black cursor-pointer transition-colors">Store Locator</span>
                <span className="hidden md:inline hover:text-black cursor-pointer transition-colors">Track Order</span>
                <span className="hover:text-black cursor-pointer transition-colors">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header - Full Width */}
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Logo - Left */}
            <Link to="/" className="flex-shrink-0 group">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-black">
                7HUB<span className="text-gray-500 font-light group-hover:text-orange-500 transition-colors">COMPUTERS</span>
              </h1>
              <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-gray-500/80 -mt-1">Since 2020</p>
            </Link>

            {/* Desktop Navigation - Center with less space */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {[
                { name: 'Home', path: '/' },
                { name: 'Pre-Built', path: '/prebuilt' },
                { name: 'Laptops', path: '/laptops' },
                { name: 'Mini PCs', path: '/mini-pcs' },
                { name: 'Custom PC', path: '/custom'},
                { name: 'Accessibility', path: '/accessibility'},
                { name: 'Display', path: '/display'},
                { name: 'About', path: '/about' },
              ].map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `text-sm font-medium tracking-wide text-gray-800 hover:text-orange-600 transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-orange-600 after:scale-x-0 hover:after:scale-x-100 after:transition-transform ${
                      isActive ? 'after:scale-x-100 text-orange-600' : ''
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>

            {/* Right Icons - Larger Icons */}
            <div className="flex items-center space-x-4 md:space-x-5">
              
              {/* Desktop Search - Icon that opens input */}
              <div className="hidden md:block relative" ref={searchContainerRef}>
                {!isSearchOpen ? (
                  <button
                    onClick={toggleSearch}
                    className="text-gray-700 hover:text-orange-600 transition-colors"
                  >
                    <FaSearch size={22} />
                  </button>
                ) : (
                  <form onSubmit={handleSearch} className="absolute right-0 top-1/2 transform -translate-y-1/2 w-64">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search products..."
                      className="w-full px-4 py-2 pr-10 border-2 border-orange-500 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 text-black"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-600"
                    >
                      <FaSearch size={16} />
                    </button>
                    
                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                      <div className="absolute top-full right-0 mt-2 w-full bg-white/95 backdrop-blur-md border-2 border-black shadow-xl rounded-lg overflow-hidden z-50 max-h-96 overflow-y-auto">
                        {suggestions.map((product, index) => (
                          <div
                            key={index}
                            className="p-3 hover:bg-orange-50 cursor-pointer flex items-center gap-3 border-b border-gray-200 last:border-0 transition-colors"
                            onClick={() => handleSuggestionClick(product)}
                          >
                            <img
                              src={getImageUrl(product)}
                              alt={product.name}
                              className="w-12 h-12 object-contain"
                              onError={(e) => {
                                e.target.src = '/placeholder-image.jpg';
                              }}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm font-bold text-orange-600">₹{(product.finalPrice || product.price)?.toLocaleString()}</p>
                              <p className="text-xs text-gray-500 capitalize">{product._type}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </form>
                )}
              </div>

              {/* Mobile Search Icon - Larger */}
              <button 
                onClick={toggleSearch}
                className="md:hidden text-gray-700 hover:text-orange-600 transition-colors"
              >
                <FaSearch size={22} />
              </button>

              {/* Account - Larger Icon */}
              <div className="relative">
                <button 
                  onClick={toggleAccountMenu} 
                  className="text-gray-700 hover:text-orange-600 transition-colors"
                >
                  <FaUserCircle size={26} />
                </button>
                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white/95 backdrop-blur-md border-2 border-black shadow-xl rounded-md z-50">
                    {isLoggedIn ? (
                      <>
                        <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors">
                          Profile
                        </Link>
                        <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors border-t border-gray-200">
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/signin" className="block px-4 py-2 text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors">
                          Sign In
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart - Larger Icon */}
              <Link to="/cart" className="relative group">
                <FaShoppingCart className="text-gray-700 group-hover:text-orange-600 transition-colors" size={24} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 flex items-center justify-center text-xs font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-full w-5 h-5 animate-pulse">
                    {cartItems.length}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button - Larger Icon */}
              <button
                className="md:hidden text-gray-700 hover:text-orange-600 focus:outline-none transition-colors"
                onClick={toggleMenu}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden border-t border-gray-200/50 p-4 bg-white/80 backdrop-blur-md">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-3 pr-12 bg-white/70 backdrop-blur-sm border-2 border-orange-500 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-600"
              >
                <FaSearch size={18} />
              </button>
            </form>
            
            {/* Mobile Suggestions */}
            {suggestions.length > 0 && (
              <div className="mt-2 bg-white/95 backdrop-blur-md border-2 border-black shadow-xl rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                {suggestions.map((product, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-orange-50 cursor-pointer flex items-center gap-3 border-b border-gray-200 last:border-0 transition-colors"
                    onClick={() => handleSuggestionClick(product)}
                  >
                    <img
                      src={getImageUrl(product)}
                      alt={product.name}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm font-bold text-orange-600">₹{(product.finalPrice || product.price)?.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 capitalize">{product._type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu */}
        {isOpen && (
          <nav className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/50">
            {[
              { name: 'Home', path: '/' },
              { name: 'Pre-Built PCs', path: '/prebuilt' },
              { name: 'Laptops', path: '/laptops' },
              { name: 'Mini PCs', path: '/mini-pcs' },
              { name: 'About', path: '/about' },
              { name: 'Custom PC', path: '/custom' },
              { name: 'Contact', path: '/contact' },
            ].map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `block px-4 py-3 text-sm text-gray-800 border-b border-gray-100 hover:bg-orange-50 hover:text-orange-600 transition-colors ${
                    isActive ? 'font-semibold text-orange-600 bg-orange-50/50' : ''
                  }`
                }
                onClick={toggleMenu}
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
    </>
  );
};

export default Header;