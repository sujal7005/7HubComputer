import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaStar, FaFilter, FaSort, FaChevronDown, FaMicrochip } from 'react-icons/fa';

const MiniPCs = () => {
  const { id } = useParams();
  const [pcs, setPcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("All");
  const [sortOption, setSortOption] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Fetch data from the backend
    const fetchPCs = async (page = 1, limit = 12) => {
      try {
        const response = await fetch(`http://localhost:4000/api/admin/products?page=${page}&limit=${limit}`);
        const data = await response.json();
        console.log(data)
        setPcs(data.miniPCs || []);
        setLoading(false);
      } catch (err) {
        console.log(err)
        setError("Failed to fetch Mini PCs");
        setLoading(false);
      }
    };

    fetchPCs(1, 12);
  }, [id]);

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";

    // If already full URL (Cloudinary, etc.)
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // If backend sends `/uploads/abc.jpg`
    if (imagePath.startsWith("/")) {
      return `${BASE_URL}${imagePath}`;
    }

    // If backend sends only filename
    return `${BASE_URL}/uploads/${imagePath}`;
  };

  // Generate random review count for demo
  const getRandomReviews = () => Math.floor(Math.random() * 50) + 10;

  // Filter and sort products
  const filteredPCs = Array.isArray(pcs)
    ? pcs
      .filter((pc) => {
        if (category === "All") return true;
        if (category === "Gaming" && pc.category?.includes("Gaming")) return true;
        if (category === "Office" && pc.category?.includes("Office")) return true;
        if (category === "All-Rounder" && pc.category?.includes("All-Rounder")) return true;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Mini PCs...</p>
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
        <title>Mini PCs - Compact, Powerful & Energy Efficient | 7HubComputers</title>
        <meta name="description" content="Explore high-performance mini PCs for gaming, office work, and everyday use. Space-saving design with powerful performance." />
      </Helmet>

      <div className="bg-white pt-24 md:pt-28 pb-20 min-h-screen">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          
          {/* Page Header */}
          <div className="border-b-2 border-black pb-8 mb-10">
            <div className="flex items-center gap-3 mb-4">
              <FaMicrochip className="text-3xl text-black" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">Compact Power</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4">
              Mini PCs
            </h1>
            <p className="text-lg text-gray-600">
              Small footprint • Big performance • Silent operation
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
                  {['All', 'Gaming', 'Office', 'All-Rounder'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`px-4 py-2 text-sm font-medium border-2 transition-colors ${
                        category === cat 
                          ? 'bg-black text-white border-black' 
                          : 'border-gray-300 text-black hover:border-black'
                      }`}
                    >
                      {cat} {cat === 'All' ? `(${pcs.length})` : ''}
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
            Showing {filteredPCs.length} {filteredPCs.length === 1 ? 'Mini PC' : 'Mini PCs'}
          </div>

          {/* Product Grid */}
          {filteredPCs.length === 0 ? (
            <div className="text-center border-2 border-black p-16 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-black mb-4">No Mini PCs Found</h3>
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
              {filteredPCs.map((pc) => {
                const discount = pc.originalPrice 
                  ? Math.round(((pc.originalPrice - pc.finalPrice) / pc.originalPrice) * 100) 
                  : 0;
                const reviews = getRandomReviews();

                return (
                  <div key={pc._id} className="group bg-white border-2 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
                    
                    {/* Product Image */}
                    <Link to={`/mini-pcs/${pc._id}`} className="block relative border-b-2 border-black overflow-hidden bg-gray-50">
                      <div className="aspect-square flex items-center justify-center p-6">
                        <img
                          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                          src={getImageUrl(pc.image?.[0])}
                          alt={pc.name}
                        />
                      </div>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-bold px-2 py-1 border-2 border-white">
                        COMPACT
                      </div>
                      
                      {discount > 0 && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 border-2 border-white">
                          -{discount}%
                        </div>
                      )}
                      
                      {pc.category?.includes('Gaming') && (
                        <div className="absolute bottom-3 left-3 bg-green-600 text-white text-xs font-bold px-2 py-1 border-2 border-white">
                          GAMING
                        </div>
                      )}
                    </Link>

                    {/* Product Info */}
                    <div className="p-5 text-center">
                      
                      {/* Category/Brand */}
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                        {pc.category?.includes('Gaming') ? 'GAMING' : 
                         pc.category?.includes('Office') ? 'OFFICE' : 'MINI PC'}
                      </p>

                      {/* Product Name */}
                      <Link to={`/mini-pcs/${pc._id}`} className="block">
                        <h3 className="text-base font-bold text-black mb-2 hover:underline line-clamp-2">
                          {pc.name}
                        </h3>
                      </Link>

                      {/* Quick Specs */}
                      <p className="text-xs text-gray-600 mb-3">
                        {pc.specs?.processor?.split(' ').slice(0, 2).join(' ') || 'Intel N100'} • 
                        {pc.specs?.ram || '8GB'} • 
                        {pc.specs?.storage || '256GB SSD'}
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
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em]">MINI</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em]">MINI</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em]">MINI</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-xl font-bold text-black">
                          ₹{pc.finalPrice?.toLocaleString()}
                        </span>
                        {pc.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{pc.originalPrice?.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* View Details Button */}
                      <Link to={`/mini-pcs/${pc._id}`}>
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
          {filteredPCs.length > 0 && filteredPCs.length < pcs.length && (
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

export default MiniPCs;