import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const MiniPCs = () => {
  const { id } = useParams();
  const [pcs, setPcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("All");
  const [sortOption, setSortOption] = useState("newest");


  useEffect(() => {
    // Fetch data from the backend
    const fetchPCs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/products');
        const data = await response.json();
        console.log(data)
        setPcs(data.miniPCs);
        setLoading(false);
      } catch (err) {
        console.log(err)
        setError("Failed to fetch Mini PCs");
        setLoading(false);
      }
    };

    fetchPCs();
  }, [id]);

  const filteredPCs = Array.isArray(pcs)
    ? pcs
      .filter((pc) => category === "All" || categoryArray.includes(pc.category)
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
      <h1 className="text-4xl font-extrabold mb-8 text-blue-400">Mini PCs</h1>

      {/* Filter and Sort Options */}
      <div className="mb-8">
        <label className="mr-4">
          Category:
          <select value={category} onChange={handleCategoryChange} className="ml-2 p-2 rounded bg-gray-800 text-white">
            <option value="All">All PCs</option>
            <option value="Gaming PCs">Gaming PCs</option>
            <option value="Office PCs">Office PCs</option>
            <option value="All-Rounder PCs">All-Rounder PCs</option>
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

      {/* Display Products */}
      <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredPCs.length === 0 ? (
          <div>No Pre-Built PCs available.</div> // Display a message if no PCs are available
        ) : (filteredPCs.map((pc) => (
          <div
            key={pc._id}
            className="bg-white text-gray-800 shadow-lg transform hover:-translate-y-2 transition duration-300 ease-in-out rounded-lg overflow-hidden"
          >
            <Link to={`/mini-pcs/${pc._id}`}>
              {/* {Array.isArray(pc.image) && pc.image.length > 0 &&
                console.log(`http://localhost:5000/uploads/${pc.image[0].split('\\').pop()}`)
              } */}
              <img
                className="w-full h-56 object-cover transition duration-300 hover:scale-105"
                src={
                  Array.isArray(pc.image) && pc.image.length > 0
                    ? `http://localhost:5000/uploads/${pc.image[0].split('\\').pop()}` // Use the first image if available
                    : "path/to/default-image.jpg" // Fallback image
                }
                alt={pc.name || "Pre-Built PC"}
              />
            </Link>
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-3">{pc.name}</h2>
              <ul className="text-gray-600 mb-3">
                {/* Display only the top 3 specs for each category */}
                {Object.entries(pc.specs)
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
              <p className="text-2xl font-bold text-blue-600 mb-5">₹{pc.price}</p>
              <Link to={`/mini-pcs/${pc._id}`}>
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

export default MiniPCs;