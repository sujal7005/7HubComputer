import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaSearch, FaDirections, FaStar, FaStarHalfAlt, FaSpinner } from 'react-icons/fa';

const StoreLocation = () => {
  const [stores, setStores] = useState([]);
  const [cities, setCities] = useState(['all']);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedStore, setSelectedStore] = useState(null);
  const [error, setError] = useState('');

  const BASE_URL = `http://${window.location.hostname}:4000`;

  // Mock data in case backend is not ready
  const mockStores = [
    {
      _id: '1',
      name: "7HubComputer - Mumbai Flagship Store",
      city: "Mumbai",
      state: "Maharashtra",
      address: "Shop No. 45, Ground Floor, Phoenix Market City, Kurla West, Mumbai - 400070",
      phone: "+91 22 1234 5678",
      email: "mumbai@7hubcomputer.com",
      timing: "10:00 AM - 9:00 PM",
      coordinates: { lat: 19.0760, lng: 72.8777 },
      services: ["Custom PC Building", "Repair Service", "Demo Zone", "Pickup Point"],
      rating: 4.8,
      reviews: 234,
      image: "https://images.unsplash.com/photo-1565031491910-e57fac031c41?w=400&h=300&fit=crop",
      featured: true
    },
    {
      _id: '2',
      name: "7HubComputer - Delhi NCR",
      city: "Delhi",
      state: "Delhi",
      address: "Plot No. 78, Ground Floor, Nehru Place, New Delhi - 110019",
      phone: "+91 11 8765 4321",
      email: "delhi@7hubcomputer.com",
      timing: "10:30 AM - 8:30 PM",
      coordinates: { lat: 28.6139, lng: 77.2090 },
      services: ["Custom PC Building", "Repair Service", "Corporate Sales"],
      rating: 4.7,
      reviews: 189,
      image: "https://images.unsplash.com/photo-1555421689-3f034debb7a6?w=400&h=300&fit=crop",
      featured: false
    },
    {
      _id: '3',
      name: "7HubComputer - Bengaluru",
      city: "Bengaluru",
      state: "Karnataka",
      address: "No. 12, 1st Floor, SP Road, Near Corporation Bank, Bengaluru - 560002",
      phone: "+91 80 2468 1357",
      email: "bangalore@7hubcomputer.com",
      timing: "10:00 AM - 8:00 PM",
      coordinates: { lat: 12.9716, lng: 77.5946 },
      services: ["Custom PC Building", "Repair Service", "Gaming Zone"],
      rating: 4.9,
      reviews: 312,
      image: "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&h=300&fit=crop",
      featured: true
    }
  ];

  // Fetch stores from backend or use mock data
  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${BASE_URL}/api/stores`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.stores && data.stores.length > 0) {
          setStores(data.stores);
          setCities(['all', ...new Set(data.stores.map(s => s.city))]);
        } else {
          // Use mock data if backend returns empty
          console.log('Using mock store data');
          setStores(mockStores);
          setCities(['all', ...new Set(mockStores.map(s => s.city))]);
        }
      } else {
        // Use mock data if backend is not available
        console.log('Backend not available, using mock data');
        setStores(mockStores);
        setCities(['all', ...new Set(mockStores.map(s => s.city))]);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      // Use mock data on error
      setStores(mockStores);
      setCities(['all', ...new Set(mockStores.map(s => s.city))]);
      setError('Using demo store data. Backend connection failed.');
    } finally {
      setLoading(false);
    }
  };

  // Filter stores based on search and city
  const filteredStores = stores.filter(store => {
    const matchesSearch = searchTerm === '' || 
                          store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          store.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          store.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === 'all' || store.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-500" />);
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-500" />);
    }
    return stars;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1565031491910-e57fac031c41?w=400&h=300&fit=crop';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL}${imagePath}`;
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen pt-20 md:pt-24 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-black mx-auto mb-4" />
          <p className="text-gray-600">Loading store locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-20 md:pt-24">
      {/* Header Section */}
      <section className="border-b-2 border-black bg-gradient-to-r from-gray-50 to-white">
        <div className="container mx-auto px-6 py-16 md:py-20">
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-4 tracking-tight">
            Store Locations
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Find your nearest 7HubComputer store for expert advice, custom builds, and hands-on product demos.
          </p>
          {error && (
            <p className="text-amber-600 text-sm mt-4">{error}</p>
          )}
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="border-b border-black">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by city or store name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            
            {/* City Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {cities.map(city => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-6 py-2 border-2 transition-all duration-300 whitespace-nowrap ${
                    selectedCity === city
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-black hover:bg-gray-100'
                  }`}
                >
                  {city === 'all' ? 'All Cities' : city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Store Listings */}
          <div>
            <div className="mb-6">
              <p className="text-gray-600">
                Found <span className="font-bold text-black">{filteredStores.length}</span> stores
              </p>
            </div>
            
            <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-4 custom-scrollbar">
              {filteredStores.map(store => (
                <div
                  key={store._id}
                  className={`border-2 border-black bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 cursor-pointer ${
                    selectedStore?._id === store._id ? 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' : ''
                  }`}
                  onClick={() => setSelectedStore(store)}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Store Image */}
                    <div className="md:w-1/3">
                      <img
                        src={getImageUrl(store.image)}
                        alt={store.name}
                        className="w-full h-48 md:h-full object-cover border-r-2 border-black"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1565031491910-e57fac031c41?w=400&h=300&fit=crop';
                        }}
                      />
                    </div>
                    
                    {/* Store Info */}
                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-black">{store.name}</h3>
                        {store.featured && (
                          <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider">
                            Featured
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {renderStars(store.rating)}
                        </div>
                        <span className="text-sm text-gray-600">({store.reviews} reviews)</span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2">
                          <FaMapMarkerAlt className="text-gray-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{store.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-gray-500" />
                          <span className="text-gray-700 text-sm">{store.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaClock className="text-gray-500" />
                          <span className="text-gray-700 text-sm">{store.timing}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {store.services.map((service, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium border border-gray-300"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredStores.length === 0 && (
                <div className="text-center py-12 border-2 border-black">
                  <p className="text-gray-600 text-lg">No stores found matching your criteria.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCity('all');
                    }}
                    className="mt-4 px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Store Details */}
          <div>
            {selectedStore ? (
              <div className="border-2 border-black p-6 bg-white sticky top-24">
                <h3 className="text-2xl font-bold text-black mb-4">{selectedStore.name}</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Address</h4>
                    <p className="text-gray-600">{selectedStore.address}</p>
                    <p className="text-gray-600 mt-1">{selectedStore.city}, {selectedStore.state}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Contact</h4>
                    <p className="text-gray-600">📞 {selectedStore.phone}</p>
                    <p className="text-gray-600">✉️ {selectedStore.email}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Business Hours</h4>
                    <p className="text-gray-600">{selectedStore.timing}</p>
                    <p className="text-gray-500 text-sm mt-1">Open 7 days a week</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Services Available</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedStore.services.map((service, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-black text-white text-sm"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStore.coordinates.lat},${selectedStore.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
                  >
                    <FaDirections />
                    Get Directions
                  </a>
                  <a
                    href={`tel:${selectedStore.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-black hover:bg-gray-100 transition-colors"
                  >
                    <FaPhone />
                    Call Now
                  </a>
                </div>
              </div>
            ) : (
              <div className="border-2 border-black p-12 text-center bg-white sticky top-24">
                <FaMapMarkerAlt className="text-6xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-black mb-2">Select a Store</h3>
                <p className="text-gray-600">
                  Click on any store from the list to view details and get directions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Store Features Section */}
      <section className="border-t-2 border-black bg-gray-50 mt-12">
        <div className="container mx-auto px-6 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-12">
            Why Visit Our Stores?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                🖥️
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Live Demos</h3>
              <p className="text-gray-600">Experience our products firsthand with live demonstrations</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                🔧
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Expert Advice</h3>
              <p className="text-gray-600">Get personalized recommendations from our tech experts</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Custom Builds</h3>
              <p className="text-gray-600">Build your dream PC with our custom configuration service</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="border-2 border-black mx-4 md:mx-6 lg:mx-8 my-8 bg-black text-white">
        <div className="container mx-auto px-6 py-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Can't Find a Store Near You?
          </h2>
          <p className="text-gray-300 text-lg mb-6">
            We offer online consultations and doorstep delivery across India
          </p>
          <Link
            to="/contact"
            className="inline-block px-8 py-3 bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
          >
            Contact Us for Online Support
          </Link>
        </div>
      </section>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border: 1px solid black;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: black;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
      `}</style>
    </div>
  );
};

export default StoreLocation;