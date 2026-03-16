import React, { useState, useEffect } from 'react';
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
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaSave,
  FaImage,
  FaCheck
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ManageAccessories = () => {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState([]);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    originalPrice: '',
    images: [],
    brand: '',
    specs: [''],
    connectivity: '',
    compatibility: '',
    size: '',
    color: '',
    features: [''],
    rating: 0,
    reviewCount: 0,
    inStock: true,
    quantity: 0,
    warranty: '1 Year'
  });

  // Category options
  const categoryOptions = [
    { value: 'pendrive', label: 'Pen Drives', icon: <FaUsb /> },
    { value: 'heatsink', label: 'Heat Sinks', icon: <FaThermometerHalf /> },
    { value: 'keyboard-wired', label: 'Wired Keyboards', icon: <FaKeyboard /> },
    { value: 'keyboard-wireless', label: 'Wireless Keyboards', icon: <FaWifi /> },
    { value: 'mouse-wired', label: 'Wired Mice', icon: <FaMouse /> },
    { value: 'mouse-wireless', label: 'Wireless Mice', icon: <FaBluetooth /> },
    { value: 'mousepad', label: 'Mouse Pads', icon: <FaMicrochip /> },
    { value: 'headphone-wired', label: 'Wired Headphones', icon: <FaHeadphones /> },
    { value: 'headphone-wireless', label: 'Wireless Headphones', icon: <FaBolt /> }
  ];

  const BASE_URL = `http://${window.location.hostname}:4000`;

  // Helper function to get token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Helper function to check if token is expired and handle it
  const handleAuthError = (error) => {
    if (error.message === 'Token expired' || error.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      alert('Your session has expired. Please login again.');
      navigate('/signin');
      return true;
    }
    return false;
  };

  // Fetch accessories with token
  const fetchAccessories = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        navigate('/signin');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/accessories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        handleAuthError({ status: 401, message: 'Token expired' });
        return;
      }

      const data = await response.json();
      console.log('Fetched accessories:', data);
      
      if (data.success) {
        setAccessories(data.data);
      } else {
        setError('Failed to load accessories');
      }
    } catch (error) {
      console.error('Error fetching accessories:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleArrayInputChange = (index, field, value) => {
    const updatedArray = [...formData[field]];
    updatedArray[index] = value;
    setFormData({ ...formData, [field]: updatedArray });
  };

  const addArrayField = (field) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  const removeArrayField = (field, index) => {
    const updatedArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: updatedArray });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // In a real implementation, you would upload these to server
    // For now, we'll use placeholder URLs and store file objects
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...previewUrls]);
    
    setFormData({
      ...formData,
      images: [...formData.images, ...files.map(f => URL.createObjectURL(f))]
    });
  };

  const removeImage = (index) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = getToken();
    if (!token) {
      navigate('/signin');
      return;
    }

    try {
      const url = isEditing 
        ? `${BASE_URL}/api/accessories/${formData._id}`
        : `${BASE_URL}/api/accessories`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.status === 401) {
        handleAuthError({ status: 401, message: 'Token expired' });
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        alert(isEditing ? 'Accessory updated successfully!' : 'Accessory created successfully!');
        setShowForm(false);
        setIsEditing(false);
        resetForm();
        fetchAccessories();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error saving accessory:', error);
      alert('Failed to save accessory');
    }
  };

  const handleEdit = (accessory) => {
    setFormData({
      ...accessory,
      specs: accessory.specs || [''],
      features: accessory.features || ['']
    });
    setImagePreview(accessory.images || []);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this accessory?')) return;

    const token = getToken();
    if (!token) {
      navigate('/signin');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/accessories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        handleAuthError({ status: 401, message: 'Token expired' });
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        alert('Accessory deleted successfully!');
        fetchAccessories();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting accessory:', error);
      alert('Failed to delete accessory');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      price: '',
      originalPrice: '',
      images: [],
      brand: '',
      specs: [''],
      connectivity: '',
      compatibility: '',
      size: '',
      color: '',
      features: [''],
      rating: 0,
      reviewCount: 0,
      inStock: true,
      quantity: 0,
      warranty: '1 Year'
    });
    setImagePreview([]);
  };

  // Filter accessories based on category and search
  const filteredAccessories = accessories.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchTerm) {
      return item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading accessories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Manage Accessories</h2>
        <button
          onClick={() => {
            resetForm();
            setIsEditing(false);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors border-2 border-black flex items-center gap-2"
        >
          <FaPlus /> Add New Accessory
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 border-2 border-black bg-gray-50">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border-2 border-black p-2 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
        >
          <option value="all">All Categories</option>
          {categoryOptions.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search accessories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border-2 border-black p-2 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
        />
      </div>

      {/* Accessories Grid */}
      {filteredAccessories.length === 0 ? (
        <div className="text-center border-2 border-black p-12">
          <p className="text-gray-600 text-lg">No accessories found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccessories.map((accessory) => (
            <div key={accessory._id} className="border-2 border-black p-4 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              
              {/* Image */}
              <div className="aspect-square bg-gray-50 border-2 border-black mb-4 flex items-center justify-center p-4">
                {accessory.images && accessory.images[0] ? (
                  <img src={accessory.images[0]} alt={accessory.name} className="w-full h-full object-contain" />
                ) : (
                  <FaImage className="text-4xl text-gray-300" />
                )}
              </div>

              {/* Info */}
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">{accessory.brand}</p>
                    <h3 className="font-bold text-black">{accessory.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-500 text-xs" />
                    <span className="text-xs font-bold">{accessory.rating}</span>
                    <span className="text-xs text-gray-500">({accessory.reviewCount})</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{accessory.description}</p>
                
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-xl font-bold text-black">₹{accessory.price?.toLocaleString()}</span>
                  {accessory.originalPrice && accessory.originalPrice > accessory.price && (
                    <span className="text-sm text-gray-400 line-through">₹{accessory.originalPrice.toLocaleString()}</span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className={`px-2 py-1 text-xs font-bold ${accessory.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {accessory.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                  <span className="text-xs text-gray-500">Qty: {accessory.quantity}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(accessory)}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors border-2 border-blue-500 flex items-center justify-center gap-1"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(accessory._id)}
                  className="flex-1 px-3 py-2 bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors border-2 border-red-500 flex items-center justify-center gap-1"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white border-4 border-black max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            
            {/* Form Header */}
            <div className="sticky top-0 bg-white border-b-4 border-black p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-black">
                {isEditing ? 'Edit Accessory' : 'Add New Accessory'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Brand *</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Images</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  multiple
                  className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                />
                {imagePreview.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {imagePreview.map((img, index) => (
                      <div key={index} className="relative">
                        <img src={img} alt={`Preview ${index}`} className="w-20 h-20 object-cover border-2 border-black" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Specifications */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Specifications</label>
                {formData.specs.map((spec, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={spec}
                      onChange={(e) => handleArrayInputChange(index, 'specs', e.target.value)}
                      placeholder={`Spec ${index + 1}`}
                      className="flex-1 px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField('specs', index)}
                      className="px-3 py-2 bg-red-500 text-white border-2 border-red-500"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('specs')}
                  className="px-3 py-1 bg-gray-200 text-black border-2 border-black text-sm hover:bg-gray-300"
                >
                  + Add Spec
                </button>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Features</label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleArrayInputChange(index, 'features', e.target.value)}
                      placeholder={`Feature ${index + 1}`}
                      className="flex-1 px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField('features', index)}
                      className="px-3 py-2 bg-red-500 text-white border-2 border-red-500"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('features')}
                  className="px-3 py-1 bg-gray-200 text-black border-2 border-black text-sm hover:bg-gray-300"
                >
                  + Add Feature
                </button>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Connectivity</label>
                  <input
                    type="text"
                    name="connectivity"
                    value={formData.connectivity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Compatibility</label>
                  <input
                    type="text"
                    name="compatibility"
                    value={formData.compatibility}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Size</label>
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* Stock and Ratings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Warranty</label>
                  <input
                    type="text"
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Rating (0-5)</label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    min="0"
                    max="5"
                    step="0.1"
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Review Count</label>
                  <input
                    type="number"
                    name="reviewCount"
                    value={formData.reviewCount}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* In Stock Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <label className="text-sm font-bold text-gray-600">In Stock</label>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t-2 border-black">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors border-2 border-black flex items-center justify-center gap-2"
                >
                  <FaSave /> {isEditing ? 'Update Accessory' : 'Create Accessory'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors border-2 border-black"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAccessories;