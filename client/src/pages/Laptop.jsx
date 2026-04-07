import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { FaStar, FaFilter, FaSort, FaChevronDown, FaLaptop } from 'react-icons/fa';

const Laptop = () => {
  const { id } = useParams();
  const [category, setCategory] = useState("All");
  const [sortOption, setSortOption] = useState("newest");
  const [laptops, setLaptops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Fetch laptop data from the server
    const fetchLaptops = async (page = 1, limit = 12) => {
      setLoading(true);
      setLaptops([]);
      try {
        const response = await fetch(`http://localhost:4000/api/admin/products?page=${page}&limit=${limit}`);
        const data = await response.json();
        setLaptops(data.refurbishedProducts || []);
        setLoading(false);
      } catch (error) {
        setError('An error occurred. Please try again.');
        setLoading(false);
      }
    };

    fetchLaptops(1, 12);
  }, [id]);

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/default-product.png"; // fallback

    // ✅ Case 1: Already full URL (Cloudinary, CDN, etc.)
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // ✅ Case 2: Already contains uploads path
    if (imagePath.startsWith("uploads")) {
      return `http://localhost:4000/${imagePath}`;
    }

    // ✅ Case 3: Only filename stored in DB
    const filename = imagePath.split(/[\\/]/).pop();
    return `http://localhost:4000/uploads/${filename}`;
  };

  // Generate random review count for demo
  const getRandomReviews = () => Math.floor(Math.random() * 80) + 15;

  // Filter and sort laptops
  const filteredLaptops = Array.isArray(laptops)
    ? laptops
      .filter((laptop) => {
        if (category === "All") return true;
        if (category === "Gaming" && laptop.category?.includes("Gaming")) return true;
        if (category === "Business" && laptop.category?.includes("Business")) return true;
        if (category === "Student" && laptop.category?.includes("Student")) return true;
        if (category === "Normal" && laptop.category?.includes("Normal")) return true;
        return false;
      })
      .sort((a, b) => {
        if (sortOption === "price-low") return (a.finalPrice || 0) - (b.finalPrice || 0);
        if (sortOption === "price-high") return (b.finalPrice || 0) - (a.finalPrice || 0);
        if (sortOption === "popularity") return (b.popularity || 0) - (a.popularity || 0);
        if (sortOption === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        return 0;
      })
    : [];

  const handleCategoryChange = (cat) => setCategory(cat);
  const handleSortChange = (e) => setSortOption(e.target.value);

  const getCategoryDisplay = (category) => {
    // If category doesn't exist, return default
    if (!category) return 'REFURBISHED';
    
    // Convert to string safely
    let categoryStr = '';
    
    try {
      if (typeof category === 'string') {
        categoryStr = category;
      } else if (Array.isArray(category)) {
        categoryStr = category[0] || '';
      } else if (typeof category === 'object') {
        categoryStr = category.name || category.value || JSON.stringify(category);
      } else {
        categoryStr = String(category);
      }
    } catch (e) {
      console.error('Error processing category:', e);
      return 'REFURBISHED';
    }

    const lowerCategory = categoryStr.toLowerCase();

    if (lowerCategory.includes('gaming')) return 'GAMING';
    if (lowerCategory.includes('business')) return 'BUSINESS';
    if (lowerCategory.includes('student')) return 'STUDENT';
    if (lowerCategory.includes('normal')) return 'NORMAL';

    return 'REFURBISHED';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Laptops...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <div className="text-center border-2 border-black p-12 max-w-lg">
          <h2 className="text-3xl font-bold text-black mb-4">Error</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors border-2 border-black"
          >
            TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Refurbished Laptops - Gaming, Business & Student Laptops | 7HubComputers</title>
        <meta name="description" content="Explore our collection of quality tested refurbished gaming, business, and student laptops at the best prices." />
      </Helmet>

      <div className="bg-white pt-24 md:pt-28 pb-20 min-h-screen">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          
          {/* Page Header */}
          <div className="border-b-2 border-black pb-8 mb-10">
            <div className="flex items-center gap-3 mb-4">
              <FaLaptop className="text-3xl text-black" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">Quality Tested</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4">
              Laptops
            </h1>
            <p className="text-lg text-gray-600">
              Premium quality • 1 year warranty • Up to 40% off
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

          {/* Filter Bar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block mb-12`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-8 p-6 border-2 border-black bg-gray-50">
              
              {/* Category Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Category:</span>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Gaming', 'Business', 'Student', 'Normal'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`px-4 py-2 text-sm font-medium border-2 transition-colors ${
                        category === cat 
                          ? 'bg-black text-white border-black' 
                          : 'border-gray-300 text-black hover:border-black'
                      }`}
                    >
                      {cat} {cat === 'All' ? `(${laptops.length})` : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <FaSort /> Sort:
                </span>
                <select 
                  value={sortOption} 
                  onChange={handleSortChange}
                  className="border-2 border-black p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popularity">Most Popular</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-8 text-sm text-gray-500">
            Showing {filteredLaptops.length} {filteredLaptops.length === 1 ? 'Laptop' : 'Laptops'}
          </div>

          {/* Product Grid */}
          {filteredLaptops.length === 0 ? (
            <div className="text-center border-2 border-black p-16 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-black mb-4">No Laptops Found</h3>
              <p className="text-gray-600 mb-8">Try adjusting your filters to find what you're looking for.</p>
              <button 
                onClick={() => setCategory('All')}
                className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors border-2 border-black"
              >
                VIEW ALL
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredLaptops.map((laptop) => {
                const discount = laptop.originalPrice 
                  ? Math.round(((laptop.originalPrice - laptop.finalPrice) / laptop.originalPrice) * 100) 
                  : 0;
                const reviews = getRandomReviews();

                return (
                  <div key={laptop._id} className="group bg-white border-2 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
                    
                    {/* Product Image */}
                    <Link to={`/refurbished/${laptop._id}`} className="block relative border-b-2 border-black overflow-hidden bg-gray-50">
                      <div className="aspect-square flex items-center justify-center p-6">
                        <img
                          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                          src={getImageUrl(laptop?.image?.[0])}
                          alt={laptop.name}
                        />
                      </div>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 border-2 border-white">
                        CERTIFIED
                      </div>
                      
                      {discount > 0 && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 border-2 border-white">
                          -{discount}%
                        </div>
                      )}
                      
                      {/* <div className="absolute bottom-3 left-3 bg-green-600 text-white text-xs font-bold px-2 py-1 border-2 border-white">
                        1YR WARRANTY
                      </div> */}
                    </Link>

                    {/* Product Info */}
                    <div className="p-5 text-center">
                      
                      {/* Category/Brand */}
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                          {getCategoryDisplay(laptop.category)}
                      </p>

                      {/* Product Name */}
                      <Link to={`/refurbished/${laptop._id}`} className="block">
                        <h3 className="text-base font-bold text-black mb-2 hover:underline line-clamp-2">
                          {laptop.name}
                        </h3>
                      </Link>

                      {/* Quick Specs */}
                      <p className="text-xs text-gray-600 mb-3">
                        {laptop.specs?.processor?.split(' ').slice(0, 2).join(' ') || 'Intel'} • 
                        {laptop.specs?.ram || '8GB'} • 
                        {laptop.specs?.storage || '512GB SSD'}
                      </p>

                      {/* Reviews */}
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className="w-3 h-3 text-yellow-500" />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          {reviews} Reviews
                        </span>
                      </div>

                      {/* Brand Row - DedCool Style */}
                      <div className="flex justify-center items-center gap-2 mb-3">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em]">REFURB</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em]">REFURB</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em]">REFURB</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-xl font-bold text-black">
                          ₹{laptop.finalPrice?.toLocaleString()}
                        </span>
                        {laptop.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{laptop.originalPrice?.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* View Details Button */}
                      <Link to={`/refurbished/${laptop._id}`}>
                        <button className="w-full bg-black text-white py-3 px-4 text-sm font-medium hover:bg-gray-800 transition-colors border-2 border-black">
                          VIEW DETAILS
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More Button (if needed) */}
          {filteredLaptops.length > 0 && filteredLaptops.length < laptops.length && (
            <div className="text-center mt-12">
              <button className="bg-white text-black border-2 border-black px-8 py-3 text-sm font-medium hover:bg-gray-100 transition-colors">
                LOAD MORE
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Laptop;