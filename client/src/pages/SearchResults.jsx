import React, { useState, useEffect } from 'react';
import slugify from 'slugify';
import { useLocation, Link, useNavigate } from 'react-router-dom';

const SearchResults = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        console.log("Search Query:", query);

        let url = `http://localhost:4000/api/admin/products?q=${encodeURIComponent(query)}`;
        if (category) url += `&category=${encodeURIComponent(category)}`;
        if (brand) url += `&brand=${encodeURIComponent(brand)}`;
        if (priceRange) url += `&priceRange=${encodeURIComponent(priceRange)}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data || Object.values(data).every(arr => arr.length === 0)) {
          setError("No products found.");
          setProducts([]);
        } else {
          setProducts([
            ...(data.prebuildPC || []),
            ...(data.officePC || []),
            ...(data.refurbishedProducts || []),
            ...(data.miniPCs || []),
          ]);
        }
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchProducts();
    }
  }, [query]);

  const generateUrl = (product) => {
    let type = product.type || ""; // Ensure type is at least an empty string
    if (typeof type !== "string") {
      console.warn("Invalid type:", type);
      type = "pc"; // Fallback to default if type is not a string
    }
  
    let basePath = "pc"; // Default path
    const lowerCaseType = type.toLowerCase();
  
    if (lowerCaseType.includes("mini pc")) {
      basePath = "mini-pcs";
    } else if (lowerCaseType.includes("refurbished")) {
      basePath = "refurbished";
    }
  
    return `/${basePath}/${product._id}`;
  };   

  return (
    <div className="p-6 bg-gray-900 text-white">
      <h1 className="text-2xl font-semibold mb-6 text-center text-blue-400">Search Results for "{query}"</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6 justify-center">
        <select className="p-2 bg-gray-800 border rounded" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="prebuilt">Prebuilt PCs</option>
          <option value="office">Office PCs</option>
          <option value="refurbished">Refurbished</option>
          <option value="mini">Mini PCs</option>
        </select>

        <select className="p-2 bg-gray-800 border rounded" value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="">All Brands</option>
          <option value="Dell">Dell</option>
          <option value="HP">HP</option>
          <option value="Lenovo">Lenovo</option>
          <option value="Asus">Asus</option>
        </select>

        <select className="p-2 bg-gray-800 border rounded" value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
          <option value="">All Prices</option>
          <option value="0-500">Under $500</option>
          <option value="500-1000">$500 - $1000</option>
          <option value="1000-2000">$1000 - $2000</option>
          <option value="2000+">Above $2000</option>
        </select>
      </div>

      {loading && <p className="text-gray-600 text-center py-4">Loading products...</p>}
      {error && <p className="text-red-600 text-center py-4">{error}</p>}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length > 0 ? (
          products.map((product) => {
            const productUrl = generateUrl(product);
            return (
              <div key={product._id} className="bg-gray-900 border rounded-md shadow-lg p-6 hover:shadow-xl transition duration-300">
                <div className="overflow-hidden">
                  <img
                    src={`http://localhost:4000/uploads/${product.image?.[0]?.split("\\").pop() || 'default.jpg'}`}
                    alt={product.name}
                    className="w-full h-64 object-cover mb-4 rounded-md transition-transform duration-500 transform hover:scale-110"
                    onClick={() => navigate(productUrl)}
                  />
                </div>
                <Link to={productUrl} className="block mt-4">
                  <h3 className="font-semibold text-lg text-gray-300 mb-2">{product.name}</h3>
                  <p className="text-gray-400">Category: {product.category}</p>
                  <p className="text-gray-400">Price: ₹{product.price}</p>
                </Link>
              </div>
            )
          })
        ) : (
          <p className="text-gray-600 text-center">No products found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchResults;