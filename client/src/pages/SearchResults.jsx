import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  FaSearch, 
  FaFilter, 
  FaTimes, 
  FaTv, 
  FaMicrochip, 
  FaDesktop,
  FaGamepad,
  FaExpand,
  FaMobileAlt,
  FaPlug,
  FaUsb,
  FaWifi,
  FaRuler,
  FaPalette,
  FaBolt,
  FaTachometerAlt
} from 'react-icons/fa';

const SearchResults = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [productType, setProductType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

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
        console.warn('Image path is not a string:', imagePath);
        return '/placeholder-image.jpg';
      }
      
      // If it's already a full URL, return it
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      
      // Extract just the filename (remove any path)
      // Handle both Windows and Unix paths
      const filename = imagePath.split(/[\\/]/).pop();
      
      // If we couldn't extract a filename, return placeholder
      if (!filename) {
        return '/placeholder-image.jpg';
      }
      
      // Construct the full URL
      return `http://localhost:4000/uploads/${filename}`;
      
    } catch (error) {
      console.error('Error in getImageUrl:', error);
      return '/placeholder-image.jpg';
    }
  };

  // Helper function to get product URL
  const getProductUrl = (item) => {
    // Determine product type and generate appropriate URL
    if (item.type === 'display' || item.category === 'display' || item._type === 'display') {
      return `/display/${item._id}`;
    } else if (item.type === 'accessory' || item.category === 'accessory' || item._type === 'accessory') {
      return `/accessories/${item._id}`;
    } else {
      // Handle PC products
      const type = item.type?.toLowerCase() || '';
      if (type.includes('mini pc')) {
        return `/mini-pcs/${item._id}`;
      } else if (type.includes('refurbished')) {
        return `/refurbished/${item._id}`;
      } else {
        return `/pc/${item._id}`;
      }
    }
  };

  // Helper function to get category icon
  const getCategoryIcon = (category) => {
    switch(category?.toLowerCase()) {
      case 'gaming': return <FaGamepad className="text-xs" />;
      case 'professional': return <FaDesktop className="text-xs" />;
      case 'ultrawide': return <FaExpand className="text-xs" />;
      case 'portable': return <FaMobileAlt className="text-xs" />;
      case 'office': return <FaDesktop className="text-xs" />;
      default: return <FaTv className="text-xs" />;
    }
  };

  // Fetch all products on search
  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Search Query:", query);
        
        // Fetch from all three endpoints
        const [productsRes, displaysRes, accessoriesRes] = await Promise.all([
          fetch(`http://localhost:4000/api/admin/products`),
          fetch(`http://localhost:4000/api/displays`),
          fetch(`http://localhost:4000/api/accessories`)
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

        // Filter by search query if provided
        if (query) {
          const searchLower = query.toLowerCase();
          allItems = allItems.filter(item => 
            (item.name?.toLowerCase().includes(searchLower)) ||
            (item.description?.toLowerCase().includes(searchLower)) ||
            (item.brand?.toLowerCase().includes(searchLower)) ||
            (item.category?.toLowerCase().includes(searchLower))
          );
        }

        setAllProducts(allItems);
        setFilteredProducts(allItems);
        
        if (allItems.length === 0) {
          setError("No products found matching your search.");
        }

      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, [query]);

  // Apply filters
  useEffect(() => {
    let filtered = [...allProducts];

    // Filter by product type
    if (productType !== 'all') {
      filtered = filtered.filter(item => item._type === productType);
    }

    // Filter by category
    if (category) {
      filtered = filtered.filter(item => 
        item.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by brand
    if (brand) {
      filtered = filtered.filter(item => 
        item.brand?.toLowerCase() === brand.toLowerCase()
      );
    }

    // Filter by price range
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(item => {
        const price = item.finalPrice || item.price;
        if (max) {
          return price >= min && price <= max;
        } else {
          return price >= min;
        }
      });
    }

    setFilteredProducts(filtered);
  }, [allProducts, category, brand, priceRange, productType]);

  // Get unique brands for filter
  const uniqueBrands = [...new Set(allProducts.map(item => item.brand).filter(Boolean))];

  // Get unique categories for filter
  const uniqueCategories = [...new Set(allProducts.map(item => item.category).filter(Boolean))];

  const clearFilters = () => {
    setCategory('');
    setBrand('');
    setPriceRange('');
    setProductType('all');
  };

  // Format price
  const formatPrice = (price) => {
    return price?.toLocaleString() || '0';
  };

  // Calculate discount percentage
  const getDiscount = (item) => {
    if (item.originalPrice && item.price) {
      return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
    }
    return 0;
  };

  return (
    <div className="bg-white pt-24 md:pt-28 pb-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="border-b-2 border-black pb-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FaSearch className="text-3xl text-black" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">Search Results</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-2">
            {query ? `"${query}"` : 'All Products'}
          </h1>
          <p className="text-lg text-gray-600">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center justify-between w-full border-2 border-black p-4 mb-6 bg-white"
        >
          <span className="flex items-center gap-2 font-medium">
            <FaFilter /> Filters
          </span>
          <span className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {/* Filters Section */}
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block mb-8`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 border-2 border-black bg-gray-50">
            
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Filter by:</span>
              
              {/* Product Type Filter */}
              <select 
                className="border-2 border-black p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm min-w-[150px]"
                value={productType} 
                onChange={(e) => setProductType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="pc">PCs</option>
                <option value="display">Displays</option>
                <option value="accessory">Accessories</option>
              </select>

              {/* Category Filter */}
              <select 
                className="border-2 border-black p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm min-w-[150px]"
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Brand Filter */}
              <select 
                className="border-2 border-black p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm min-w-[150px]"
                value={brand} 
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="">All Brands</option>
                {uniqueBrands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              {/* Price Range Filter */}
              <select 
                className="border-2 border-black p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm min-w-[150px]"
                value={priceRange} 
                onChange={(e) => setPriceRange(e.target.value)}
              >
                <option value="">All Prices</option>
                <option value="0-50000">Under ₹50,000</option>
                <option value="50000-100000">₹50,000 - ₹1,00,000</option>
                <option value="100000-200000">₹1,00,000 - ₹2,00,000</option>
                <option value="200000-9999999">Above ₹2,00,000</option>
              </select>

              {/* Clear Filters */}
              {(category || brand || priceRange || productType !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-black border-b border-black pb-0.5"
                >
                  <FaTimes className="text-xs" /> Clear All
                </button>
              )}
            </div>

            <div className="text-sm text-gray-500">
              {filteredProducts.length} results
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Searching products...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center border-2 border-black p-12 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-black mb-4">No Results Found</h3>
            <p className="text-gray-600 mb-8">{error}</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors border-2 border-black"
            >
              RETURN HOME
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const productUrl = getProductUrl(product);
                const discount = getDiscount(product);
                const imageUrl = getImageUrl(product);

                return (
                  <div key={product._id} className="group bg-white border-2 border-black hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
                    
                    {/* Product Image */}
                    <Link to={productUrl} className="block relative border-b-2 border-black overflow-hidden bg-gray-50">
                      <div className="aspect-square flex items-center justify-center p-6">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                      </div>

                      {/* Product Type Badge */}
                      <div className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-2 py-1 border-2 border-white flex items-center gap-1">
                        {product._type === 'display' && <FaTv className="text-xs" />}
                        {product._type === 'accessory' && <FaMicrochip className="text-xs" />}
                        {product._type === 'pc' && <FaDesktop className="text-xs" />}
                        <span className="capitalize">{product._type}</span>
                      </div>

                      {/* Discount Badge */}
                      {discount > 0 && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 border-2 border-white">
                          -{discount}%
                        </div>
                      )}
                    </Link>

                    {/* Product Info */}
                    <div className="p-5 text-left">
                      
                      {/* Category/Brand */}
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                          {product.brand || "7HUB"}
                        </p>
                        {product._type === 'display' && product.specs?.size && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <FaRuler className="text-xs" />
                            {product.specs.size}
                          </div>
                        )}
                      </div>

                      {/* Product Name */}
                      <Link to={productUrl} className="block group">
                        <h3 className="text-base font-bold text-black mb-2 hover:underline line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Display specific specs */}
                      {product._type === 'display' && product.specs && (
                        <div className="grid grid-cols-2 gap-1 mb-3">
                          {product.specs.resolution && (
                            <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 border border-gray-200">
                              {product.specs.resolution.split(' ')[0]}
                            </div>
                          )}
                          {product.specs.panel && (
                            <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 border border-gray-200">
                              {product.specs.panel}
                            </div>
                          )}
                          {product.specs.refreshRate && (
                            <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 border border-gray-200">
                              {product.specs.refreshRate}
                            </div>
                          )}
                        </div>
                      )}

                      {/* PC specific specs */}
                      {product._type === 'pc' && product.specs && (
                        <p className="text-xs text-gray-600 mb-3 line-clamp-1">
                          {product.specs.processor?.split(' ').slice(0, 2).join(' ') || 'Intel'} • 
                          {product.specs.ram || '16GB'} • 
                          {product.specs.storage || '512GB'}
                        </p>
                      )}

                      {/* Features */}
                      {product.features && product.features.length > 0 && (
                        <div className="mb-3">
                          {product.features.slice(0, 1).map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-1 text-xs text-gray-500">
                              <span className="text-green-500">✓</span>
                              <span className="truncate">{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-xl font-bold text-black">
                          ₹{formatPrice(product.finalPrice || product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className="mb-3">
                        <span className={`text-xs font-bold px-2 py-1 ${
                          product.inStock !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>

                      {/* View Details Button */}
                      <Link to={productUrl}>
                        <button className="w-full bg-black text-white py-3 px-4 text-sm font-medium hover:bg-gray-800 transition-colors border-2 border-black">
                          VIEW DETAILS
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-16 border-2 border-black">
                <p className="text-gray-600 text-lg">No products match your search criteria.</p>
                <button 
                  onClick={clearFilters}
                  className="mt-4 bg-black text-white px-6 py-2 text-sm font-medium hover:bg-gray-800 transition-colors border-2 border-black"
                >
                  CLEAR FILTERS
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;