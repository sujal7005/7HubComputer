import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaTag } from 'react-icons/fa';

const DiscountCode = () => {
  const [discounts, setDiscounts] = useState([]);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "",
    value: "",
    expirationDate: "",
    minPurchase: "",
    maxDiscount: "",
  });
  const [editingId, setEditingId] = useState(null);
  const BASE_URL = `http://${window.location.hostname}:4000`;

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/discounts`);
      const data = await response.json();

      // console.log("Discount API Response:", data); // Debugging

      if (Array.isArray(data)) {
        setDiscounts(data);
      } else {
        console.error("API response is not an array:", data);
        setDiscounts([]);
      }
    } catch (error) {
      console.error("Error fetching discounts:", error);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit form to create discount code
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/api/discounts/${editingId}`, formData);
        setEditingId(null);
      } else {
        await axios.post(`${BASE_URL}/api/discounts`, formData);
      }
      setFormData({
        code: "",
        discountType: "",
        value: "",
        expirationDate: "",
        minPurchase: "",
        maxDiscount: "",
      });
      fetchDiscounts();
    } catch (error) {
      console.error("Error creating discount:", error);
    }
  };

  const handleEdit = (discount) => {
    setFormData(discount);
    setEditingId(discount._id);
  };

  // Delete a discount
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/discounts/${id}`);
      fetchDiscounts();
    } catch (error) {
      console.error("Error deleting discount:", error);
    }
  };

  return (
    <div className="bg-white border-4 border-black p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 border-b-2 border-black pb-4">
        <FaTag className="text-2xl text-black" />
        <h2 className="text-2xl font-bold text-black">Manage Discount Codes</h2>
      </div>

      {/* Discount Creation Form */}
      <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 border-2 border-black p-6">
        <h3 className="text-lg font-semibold text-black mb-4">
          {editingId ? 'Edit Discount Code' : 'Create New Discount Code'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Discount Code */}
          <div>
            <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
              Discount Code
            </label>
            <input
              type="text"
              name="code"
              placeholder="e.g., SUMMER20"
              value={formData.code}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
              required
            />
          </div>

          {/* Discount Type */}
          <div>
            <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
              Discount Type
            </label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black bg-white"
              required
            >
              <option value="">Select Type</option>
              <option value="fixed">Fixed Amount (₹)</option>
              <option value="percentage">Percentage (%)</option>
            </select>
          </div>

          {/* Discount Value */}
          <div>
            <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
              Discount Value
            </label>
            <input
              type="number"
              name="value"
              placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 500'}
              value={formData.value}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
              required
            />
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
              Expiration Date
            </label>
            <input
              type="date"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
            />
          </div>

          {/* Min Purchase */}
          <div>
            <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
              Min Purchase (₹)
            </label>
            <input
              type="number"
              name="minPurchase"
              placeholder="e.g., 1000"
              value={formData.minPurchase}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
            />
          </div>

          {/* Max Discount */}
          <div>
            <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
              Max Discount (₹)
            </label>
            <input
              type="number"
              name="maxDiscount"
              placeholder="e.g., 2000"
              value={formData.maxDiscount}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 mt-6">
          <button 
            type="submit" 
            className="px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 transition-colors border-2 border-black flex items-center gap-2"
          >
            <FaPlus /> {editingId ? "Update Discount" : "Create Discount"}
          </button>
          
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setFormData({
                  code: "",
                  discountType: "",
                  value: "",
                  expirationDate: "",
                  minPurchase: "",
                  maxDiscount: "",
                });
              }}
              className="px-6 py-3 bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-colors border-2 border-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Display Discounts */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-black mb-4 border-b-2 border-black pb-2">
          Existing Discount Codes ({discounts.length})
        </h3>
        
        {discounts.length === 0 ? (
          <div className="text-center border-2 border-black p-12 bg-gray-50">
            <FaTag className="text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No discount codes available.</p>
            <p className="text-gray-500 text-sm mt-2">Create your first discount code using the form above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border-2 border-black">
            <table className="w-full text-sm text-black">
              <thead className="bg-gray-100 border-b-2 border-black">
                <tr>
                  <th className="p-3 text-left border-r border-black">Code</th>
                  <th className="p-3 text-left border-r border-black">Type</th>
                  <th className="p-3 text-left border-r border-black">Value</th>
                  <th className="p-3 text-left border-r border-black">Expires</th>
                  <th className="p-3 text-left border-r border-black">Min Purchase</th>
                  <th className="p-3 text-left border-r border-black">Max Discount</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((discount, index) => (
                  <tr 
                    key={discount._id} 
                    className={`border-b border-black hover:bg-gray-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="p-3 border-r border-black font-mono font-bold text-black">
                      {discount.code}
                    </td>
                    <td className="p-3 border-r border-black capitalize">
                      <span className={`px-2 py-1 text-xs font-bold ${
                        discount.discountType === 'percentage' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                          : 'bg-green-100 text-green-700 border border-green-200'
                      }`}>
                        {discount.discountType}
                      </span>
                    </td>
                    <td className="p-3 border-r border-black font-bold">
                      {discount.discountType === 'percentage' ? `${discount.value}%` : `₹${discount.value}`}
                    </td>
                    <td className="p-3 border-r border-black">
                      {discount.expirationDate ? new Date(discount.expirationDate).toLocaleDateString('en-IN') : 'Never'}
                    </td>
                    <td className="p-3 border-r border-black">₹{discount.minPurchase || 0}</td>
                    <td className="p-3 border-r border-black">₹{discount.maxDiscount || '∞'}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(discount)}
                          className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors border border-blue-500 flex items-center gap-1"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(discount._id)}
                          className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors border border-red-500 flex items-center gap-1"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Section */}
      {discounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="border-2 border-black p-4 text-center bg-gray-50">
            <p className="text-sm text-gray-600 uppercase tracking-wider">Total Codes</p>
            <p className="text-2xl font-bold text-black">{discounts.length}</p>
          </div>
          <div className="border-2 border-black p-4 text-center bg-gray-50">
            <p className="text-sm text-gray-600 uppercase tracking-wider">Active Codes</p>
            <p className="text-2xl font-bold text-black">
              {discounts.filter(d => !d.expirationDate || new Date(d.expirationDate) > new Date()).length}
            </p>
          </div>
          <div className="border-2 border-black p-4 text-center bg-gray-50">
            <p className="text-sm text-gray-600 uppercase tracking-wider">Expiring Soon</p>
            <p className="text-2xl font-bold text-black">
              {discounts.filter(d => {
                if (!d.expirationDate) return false;
                const daysLeft = Math.ceil((new Date(d.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
                return daysLeft <= 7 && daysLeft > 0;
              }).length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountCode;