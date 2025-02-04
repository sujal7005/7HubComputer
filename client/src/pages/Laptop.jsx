import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const Laptop = () => {
  const { id } = useParams();
  const [category, setCategory] = useState("All");
  const [sortOption, setSortOption] = useState("newest");
  const [laptops, setLaptops] = useState([]); // State to hold laptop data
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling

  useEffect(() => {
    // Fetch laptop data from the server
    const fetchLaptops = async (page = 1, limit = 10) => {
      setLoading(true);
      setLaptops([]);
      try {
        const response = await fetch(`http://localhost:5000/api/admin/products?page=${page}&limit=${limit}`);
        const data = await response.json();
        setLaptops(data.refurbishedProducts || []);
        // console.log(data);
        setLoading(false);
      } catch (error) {
        setError('An error occurred. Please try again.');
        setLoading(false);
      }
    };

    fetchLaptops(1,10);
  }, [id]);

  const categoryArray = category.split(",").map((cat) => cat.trim());

  const filteredLaptops = Array.isArray(laptops)
    ? laptops
      .filter((laptop) => category === "All" || categoryArray.includes(laptop.category)
      )
      .sort((a, b) => {
        if (sortOption === "price") return a.price - b.price;
        if (sortOption === "popularity") return b.popularity - a.popularity;
        if (sortOption === "newest") return b.dateAdded - a.dateAdded;
        return 0;
      })
    : [];

  const handleCategoryChange = (e) => setCategory(e.target.value);
  const handleSortChange = (e) => setSortOption(e.target.value);

  if (loading) return <div>Loading...</div>; // Loading state
  if (error) return <div>Error: {error}</div>; // Error state

  return (
    <div className="text-center bg-gradient-to-b from-gray-900 to-gray-700 text-white py-10 px-4">
      <h1 className="text-4xl font-extrabold mb-8 text-blue-400">Laptops</h1>

      {/* Filter and Sort Options */}
      <div className="mb-8">
        <label className="mr-4">
          Category:
          <select value={category} onChange={handleCategoryChange} className="ml-2 p-2 rounded bg-gray-800 text-white">
            <option value="All">All Laptops</option>
            <option value="Gaming Laptop">Gaming Laptops</option>
            <option value="Normal Laptop">Normal Laptops</option>
            <option value="Business Laptop">Business Laptops</option>
            <option value="Student Laptop">Student Laptops</option>
          </select>
        </label>
        <label className="ml-8">
          Sort by:
          <select value={sortOption} onChange={handleSortChange} className="ml-2 p-2 rounded bg-gray-800 text-white">
            <option value="newest">Newest</option>
            <option value="price">Price</option>
            <option value="popularity">Popularity</option>
          </select>
        </label>
      </div>

      <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredLaptops.length === 0 ? (
          <div>No refurbished laptops available.</div> // Display a message if no laptops are available
        ) : (
          filteredLaptops.map((laptop) => (
            <div
              key={laptop._id}
              className="bg-white text-gray-800 shadow-lg transform hover:-translate-y-2 transition duration-300 ease-in-out rounded-lg overflow-hidden"
            >
              <Link to={`/refurbished/${laptop._id}`}>
                <img
                  className="w-full h-56 object-cover transition duration-300 hover:scale-105"
                  src={
                    Array.isArray(laptop.image) && laptop.image.length > 0
                      ? `http://localhost:5000/uploads/${laptop.image[0].split('\\').pop()}` // Extract the file name from the path
                      : "path/to/default-image.jpg" // Fallback image
                  }
                  alt={laptop.name || "Refurbished Product"}
                />
              </Link>
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-3">{laptop.name}</h2>
                <ul className="text-gray-600 mb-3">
                  {/* Display only the top 3 specs for each laptop */}
                  {Object.entries(laptop.specs)
                    .slice(0, 3) // Get only the first 3 entries
                    .map(([key, specs]) => (
                      <li key={key}>
                        {key}:{" "}
                        {Array.isArray(specs)
                          ? specs
                            .slice(0, 1)
                            .map((spec) => `${spec.name}: ${spec.value}`)
                            .join(", ")
                          : specs}
                      </li>
                    ))}
                </ul>
                <p className="text-2xl font-bold text-blue-600 mb-5">₹{laptop.price}</p>
                <Link to={`/refurbished/${laptop._id}`}>
                  <button className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105">
                    Buy Now
                  </button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Laptop;