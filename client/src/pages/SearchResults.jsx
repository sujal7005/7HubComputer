import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

const SearchResults = ({ searchQuery, preBuiltPCs, refurbishedProducts }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q');
  const navigate = useNavigate();

  // States for filters
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [rating, setRating] = useState('');
  const [brand, setBrand] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Effect to fetch products based on query and filters
  useEffect(() => {
    const fetchProducts = async (page = 1, limit = 10) => {
      setLoading(true);
      try {
        console.log("Search Query:", query);
        const response = await fetch(`http://localhost:5000/api/admin/products?q=${query}&category=${category}&price=${priceRange[1]}&rating=${rating}&brand=${brand}&page=${page}&limit=${limit}`);
        const data = await response.json();
        console.log(data);

        // Handle the response according to the actual structure
        if (data.prebuildPC && Array.isArray(data.prebuildPC)) {
          setProducts(data.prebuildPC); // Set pre-built PC data
        } else if (data.refurbishedProducts && Array.isArray(data.refurbishedProducts)) {
          setProducts(data.refurbishedProducts); // Set refurbished laptop data
        } else {
          setProducts([]); // Handle no matches
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load products');
        setLoading(false);
      }
    };

    if (query) {
      fetchProducts(1, 10);
    }
  }, [query, category, priceRange, rating, brand]);

  // Filter products based on selected filters
  useEffect(() => {
    let filtered = [...products];
  
    // Filter by query
    if (query) {
      filtered = filtered.filter((product) =>
        (product.name && product.name.toLowerCase().includes(query.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(query.toLowerCase())) ||
        (product.category && typeof product.category === 'string' && product.category.toLowerCase().includes(query.toLowerCase())) ||
        (product.price && product.price.toString().includes(query)) ||
        (product.code && product.code.toLowerCase().includes(query.toLowerCase()))
      );
    }
  
    // Filter by category
    if (category) {
      filtered = filtered.filter((product) => 
        product.category && product.category === category
      );
    }
  
    // Filter by price
    filtered = filtered.filter((product) => product.price <= priceRange[1]);
  
    // Filter by rating
    if (rating) {
      filtered = filtered.filter((product) => product.rating >= Number(rating));
    }
  
    // Filter by brand
    if (brand) {
      filtered = filtered.filter((product) => product.brand === brand);
    }
  
    setFilteredProducts(filtered);
  }, [products, query, category, priceRange, rating, brand]);
  

  // Filter change handlers
  const handleCategoryChange = (e) => setCategory(e.target.value);
  const handlePriceChange = (e) => setPriceRange([0, Number(e.target.value)]);
  const handleRatingChange = (e) => setRating(e.target.value);
  const handleBrandChange = (e) => setBrand(e.target.value);

  return (
    <div className="p-6 bg-gray-900 text-white">
      <h1 className="text-2xl font-semibold mb-6 text-center text-blue-400">Search Results for "{query}"</h1>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className="w-1/4 bg-gray-900 shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-indigo-400">Filters</h2>

          {/* Category Filter */}
          <div className="mb-4">
            <label className="block text-lg font-medium text-indigo-400">Category</label>
            <select
              value={category}
              onChange={handleCategoryChange}
              className="w-full p-3 mt-1 bg-gray-800 border rounded-md"
            >
              <option value="">All Categories</option>
              <option value="gaming">Gaming</option>
              <option value="office">Office</option>
              <option value="workstation">Workstation</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="mb-4">
            <label className="block text-lg font-medium text-indigo-400">Price Range (Up to)</label>
            <input
              type="range"
              min="0"
              max="5000"
              value={priceRange[1]}
              onChange={handlePriceChange}
              className="w-full mt-2 bg-blue-800 rounded-md"
            />
            <span className="block mt-1 text-gray-600">Up to ${priceRange[1]}</span>
          </div>

          {/* Rating Filter */}
          <div className="mb-4">
            <label className="block text-lg font-medium text-indigo-400">Rating</label>
            <select
              value={rating}
              onChange={handleRatingChange}
              className="w-full p-3 mt-1 text-white border rounded-md bg-gray-800"
            >
              <option value="">Any Rating</option>
              <option value="4">4 stars & up</option>
              <option value="3">3 stars & up</option>
              <option value="2">2 stars & up</option>
              <option value="1">1 star & up</option>
            </select>
          </div>

          {/* Brand Filter */}
          <div className="mb-4">
            <label className="block text-lg font-medium text-indigo-400">Brand</label>
            <select
              value={brand}
              onChange={handleBrandChange}
              className="w-full p-3 mt-1 bg-gray-800 border rounded-md text-white"
            >
              <option value="">All Brands</option>
              <option value="Brand A">Brand A</option>
              <option value="Brand B">Brand B</option>
              <option value="Brand C">Brand C</option>
            </select>
          </div>
        </aside>

        {/* Results Section */}
        <section className="w-3/4 p-4 bg-gray-800 shadow-lg rounded-lg">
          <p className="text-lg text-gray-300">Displaying search results for: <strong>{query}</strong></p>

          {/* Loading and Error States */}
          {loading && <p className="text-gray-600 text-center py-4">Loading products...</p>}
          {error && <p className="text-red-600 text-center py-4">{error}</p>}

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Dynamic results */}
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} className="bg-gray-900 border rounded-md shadow-lg p-6 hover:shadow-xl transition duration-300">
                  <div className="overflow-hidden">
                    <img
                      src={`http://localhost:5000/uploads/${product.image[0].split("\\").pop()}`}
                      alt={product.name}
                      className="w-full h-64 object-cover mb-4 rounded-md transition-transform duration-500 transform hover:scale-110"
                      onClick={() => navigate(`/pc/${product.id}`)}
                    />
                  </div>
                  <Link to={`/pc/${product.id}`} className="block mt-4">
                    <h3 className="font-semibold text-lg text-gray-300 mb-2">{product.name}</h3>
                    <p className="text-gray-400">Category: {product.category}</p>
                    <p className="text-gray-400">Price: ${product.price}</p>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 py-4">No products found.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SearchResults;
