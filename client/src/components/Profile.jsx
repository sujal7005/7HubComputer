// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { FaUser, FaMapMarkerAlt, FaHistory, FaSignOutAlt, FaEdit, FaPlus, FaTimes, FaEye, FaFilePdf, FaShoppingBag } from 'react-icons/fa';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userOrders, setUserOrders] = useState([]);
  const [userAddresses, setUserAddresses] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [newAddress, setNewAddress] = useState({ line1: '', line2: '', city: '', state: '', zip: '' });
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [editingAddress, setEditingAddress] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const navigate = useNavigate();

  const BASE_URL = `http://${window.location.hostname}:4000`;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (storedUser && storedUser._id) {
      const fetchUserProfile = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/api/users/${storedUser._id}`);
          setUser(response.data);
          setName(response.data.name || '');
          setPhoneNumber(response.data.phoneNumber || '');
          localStorage.setItem('user', JSON.stringify(response.data));

          fetchUserOrders(storedUser._id);
          fetchUserAddresses(storedUser._id);
          fetchTransactionHistory(storedUser._id);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      };

      fetchUserProfile();
    } else {
      navigate('/signin');
    }
  }, [navigate]);

  const handleInvoiceGeneration = async (order) => {
    try {
      const response = await fetch(`${BASE_URL}/api/users/orders/generate-invoice-pdf/${order._id}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${order._id}_invoice.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.log('Error generating invoice');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchUserOrders = async (userId) => {
    if (!userId) return;
    try {
      const response = await axios.get(`${BASE_URL}/api/users/${userId}/orders`);
      setUserOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch user orders:', error);
    }
  };

  const fetchUserAddresses = async (userId) => {
    if (!userId) return;
    try {
      const response = await axios.get(`${BASE_URL}/api/users/${userId}/addresses`);
      setUserAddresses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch user addresses:', error);
    }
  };

  const fetchTransactionHistory = async (userId) => {
    if (!userId) return;
    try {
      const response = await axios.get(`${BASE_URL}/api/users/${userId}/transactions`);
      setTransactionHistory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
    }
  };

  const handleEdit = async () => {
    const updatedUser = { userId: user._id, name, phoneNumber };

    try {
      const response = await axios.put(
        `${BASE_URL}/api/users/update-user`,
        updatedUser,
      );

      if (response.data.success) {
        const updatedUserData = { ...user, ...updatedUser };
        setUser(updatedUserData);
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleAddAddress = async () => {
    if (!user || !user._id) return;
    const userId = user._id;
    try {
      const response = await axios.post(`${BASE_URL}/api/users/${userId}/add-address`, newAddress);
      if (response.data.success) {
        setUserAddresses([...userAddresses, response.data.address]);
        setNewAddress({ line1: '', line2: '', city: '', state: '', zip: '' });
        setIsAddingAddress(false);
      }
    } catch (error) {
      console.error('Failed to add address:', error);
    }
  };

  const handleSaveEdit = async (index) => {
    if (!user || !user._id) return;
    const userId = user._id;
    const addressToSave = editingAddress;

    try {
      const response = await axios.put(
        `${BASE_URL}/api/users/${userId}/update-address/${addressToSave._id}`,
        addressToSave
      );
      if (response.data.success) {
        const updatedAddresses = [...userAddresses];
        updatedAddresses[index] = response.data.address;
        setUserAddresses(updatedAddresses);
        setEditingAddressIndex(null);
        setEditingAddress({});
      }
    } catch (error) {
      console.error('Failed to save edited address:', error);
    }
  };

  const handleRemove = async (index) => {
    if (!user || !user._id) return;
    const userId = user._id;
    const addressToRemove = userAddresses[index];
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/users/${userId}/remove-address/${addressToRemove._id}`
      );
      if (response.data.success) {
        const updatedAddresses = userAddresses.filter((_, i) => i !== index);
        setUserAddresses(updatedAddresses);
      }
    } catch (error) {
      console.error('Failed to remove address:', error);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await axios.put(`${BASE_URL}/api/users/orders/${orderId}/cancel`);
      if (response.data.success) {
        setUserOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: 'Cancelled' } : order
          )
        );
        alert('Order cancelled successfully');
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order');
    }
  };

  const handleViewOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users/orders/${orderId}`);
      if (response.data.success) {
        setSelectedOrder(response.data.order);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      alert('Failed to fetch order details');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Processing':
        return 'bg-yellow-500 text-white';
      case 'Shipped':
        return 'bg-blue-500 text-white';
      case 'Delivered':
        return 'bg-green-600 text-white';
      case 'Cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleSignOut = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/signin');
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (!user) return null;

  return (
    <div className="bg-white pt-28 pb-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="border-b-2 border-black pb-8 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <FaUser className="text-3xl text-black" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">My Account</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Profile
          </h1>
          <p className="text-lg text-gray-600">
            Manage your account, orders, and addresses
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - My Account */}
          <div className="lg:col-span-1">
            <div className="border-2 border-black p-6 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
              <h2 className="text-2xl font-bold text-black mb-6 border-b-2 border-black pb-2">
                My Account
              </h2>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                      placeholder="Full Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                      placeholder="Phone Number"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleEdit}
                      className="flex-1 bg-black text-white py-3 px-4 font-medium hover:bg-gray-800 transition-colors border-2 border-black"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-white text-black py-3 px-4 font-medium hover:bg-gray-100 transition-colors border-2 border-black"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    <p className="text-lg font-bold text-black">{user.name}</p>
                  </div>
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-lg font-bold text-black">{user.email}</p>
                  </div>
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                    <p className="text-lg font-bold text-black">{user.phoneNumber || 'Not provided'}</p>
                  </div>

                  {/* Bonus Points */}
                  <div className="bg-black text-white p-5 border-2 border-black">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Bonus Points</p>
                    <p className="text-3xl font-bold">{user.bonusPoints}</p>
                  </div>

                  {/* Discount Code */}
                  <div className="border-2 border-black p-5">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Discount Code</p>
                    <p className="text-2xl font-bold text-green-600 mb-2">{user.discountCode}</p>
                    <p className="text-xs text-gray-500">
                      Expires: {moment(user.discountExpiresAt).format("MMMM D, YYYY")}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-black text-white py-3 px-4 font-medium hover:bg-gray-800 transition-colors border-2 border-black flex items-center justify-center gap-2"
                  >
                    <FaEdit /> Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Orders and Addresses */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Orders Section */}
            <div className="border-2 border-black p-6 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
              <div className="flex items-center gap-2 mb-6 border-b-2 border-black pb-2">
                <FaShoppingBag className="text-xl" />
                <h2 className="text-2xl font-bold text-black">Your Orders</h2>
              </div>
              
              {userOrders.length > 0 ? (
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <div key={order._id} className="border-2 border-black p-5 hover:bg-gray-50 transition-colors">
                      
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <p className="text-sm text-gray-500 mb-2 sm:mb-0">
                          Order ID: <span className="font-bold text-black">{order._id.slice(-8)}</span>
                        </p>
                        <span className={`px-3 py-1 text-xs font-bold ${getStatusClass(order.status)} border-2 border-black`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Order Basic Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Product</p>
                          <p className="text-sm font-bold text-black truncate">{order.product?.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="text-sm font-bold text-black">{moment(order.date).format('MMM Do YYYY')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Payment</p>
                          <p className="text-sm font-bold text-black">{order.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="text-sm font-bold text-black">₹{order.totalPrice?.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedOrder === order._id && (
                        <div className="mt-4 pt-4 border-t-2 border-black">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-bold text-black mb-2">Customer Details</h4>
                              <p className="text-sm text-gray-600"><span className="font-medium">Name:</span> {order.userDetails?.name}</p>
                              <p className="text-sm text-gray-600"><span className="font-medium">Email:</span> {order.userDetails?.email}</p>
                              <p className="text-sm text-gray-600"><span className="font-medium">Phone:</span> {order.userDetails?.phoneNumber}</p>
                            </div>
                            <div>
                              <h4 className="font-bold text-black mb-2">Delivery Address</h4>
                              <p className="text-sm text-gray-600">
                                {order.userDetails?.address?.street}, {order.userDetails?.address?.city},<br />
                                {order.userDetails?.address?.state} - {order.userDetails?.address?.zipCode}
                              </p>
                              <p className="text-sm text-gray-600 mt-2">
                                <span className="font-medium">Delivery Date:</span> {moment(order.deliveryDate).format("MMM Do YYYY")}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleViewOrderDetails(order._id)}
                          className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors border-2 border-black flex items-center gap-2"
                        >
                          <FaEye /> View Details
                        </button>
                        <button
                          onClick={() => handleInvoiceGeneration(order)}
                          className="px-4 py-2 bg-white text-black text-sm font-medium hover:bg-gray-100 transition-colors border-2 border-black flex items-center gap-2"
                        >
                          <FaFilePdf /> Invoice
                        </button>
                        {order.status !== 'Cancelled' && order.status !== "Delivered" && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="px-4 py-2 bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors border-2 border-red-500 flex items-center gap-2"
                          >
                            Cancel Order
                          </button>
                        )}
                        <button
                          onClick={() => toggleExpand(order._id)}
                          className="ml-auto text-sm text-gray-600 hover:text-black underline"
                        >
                          {expandedOrder === order._id ? "Show Less" : "Show More"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-black">
                  <p className="text-gray-500 mb-4">No orders found</p>
                  <Link to="/products" className="inline-block bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors border-2 border-black">
                    START SHOPPING
                  </Link>
                </div>
              )}
            </div>

            {/* Addresses Section */}
            <div className="border-2 border-black p-6 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
              <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-2">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-xl" />
                  <h2 className="text-2xl font-bold text-black">Addresses</h2>
                </div>
                {!isAddingAddress && (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors border-2 border-black flex items-center gap-2"
                  >
                    <FaPlus /> Add New
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {userAddresses.length > 0 ? (
                  userAddresses.map((address, index) => (
                    <div key={address._id || index} className="border-2 border-black p-5">
                      {editingAddressIndex === index ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editingAddress.line1}
                            onChange={(e) => setEditingAddress({ ...editingAddress, line1: e.target.value })}
                            placeholder="Street Address"
                            className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                          />
                          <input
                            type="text"
                            value={editingAddress.line2}
                            onChange={(e) => setEditingAddress({ ...editingAddress, line2: e.target.value })}
                            placeholder="Apt, Suite, etc."
                            className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={editingAddress.city}
                              onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
                              placeholder="City"
                              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            <input
                              type="text"
                              value={editingAddress.state}
                              onChange={(e) => setEditingAddress({ ...editingAddress, state: e.target.value })}
                              placeholder="State"
                              className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                            />
                          </div>
                          <input
                            type="text"
                            value={editingAddress.zip}
                            onChange={(e) => setEditingAddress({ ...editingAddress, zip: e.target.value })}
                            placeholder="ZIP Code"
                            className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                          />
                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={() => handleSaveEdit(index)}
                              className="flex-1 bg-black text-white py-3 font-medium hover:bg-gray-800 transition-colors border-2 border-black"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingAddressIndex(null)}
                              className="flex-1 bg-white text-black py-3 font-medium hover:bg-gray-100 transition-colors border-2 border-black"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-700 mb-3">
                            <span className="font-bold">Address {index + 1}:</span> {address.line1}, {address.line2}, {address.city}, {address.state} {address.zip}
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                setEditingAddressIndex(index);
                                setEditingAddress(address);
                              }}
                              className="px-4 py-2 bg-yellow-500 text-black text-sm font-medium hover:bg-yellow-600 transition-colors border-2 border-yellow-500"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleRemove(index)}
                              className="px-4 py-2 bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors border-2 border-red-500"
                            >
                              Remove
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8 border-2 border-black">No addresses saved</p>
                )}

                {/* Add Address Form */}
                {isAddingAddress && (
                  <div className="border-2 border-black p-5 mt-4">
                    <h3 className="font-bold text-black mb-4">Add New Address</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newAddress.line1}
                        onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                        placeholder="Street Address"
                        className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <input
                        type="text"
                        value={newAddress.line2}
                        onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                        placeholder="Apt, Suite, etc."
                        className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          placeholder="City"
                          className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <input
                          type="text"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          placeholder="State"
                          className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <input
                        type="text"
                        value={newAddress.zip}
                        onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                        placeholder="ZIP Code"
                        className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleAddAddress}
                          className="flex-1 bg-black text-white py-3 font-medium hover:bg-gray-800 transition-colors border-2 border-black"
                        >
                          Save Address
                        </button>
                        <button
                          onClick={() => setIsAddingAddress(false)}
                          className="flex-1 bg-white text-black py-3 font-medium hover:bg-gray-100 transition-colors border-2 border-black"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction History */}
            <div className="border-2 border-black p-6 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
              <div className="flex items-center gap-2 mb-6 border-b-2 border-black pb-2">
                <FaHistory className="text-xl" />
                <h2 className="text-2xl font-bold text-black">Transaction History</h2>
              </div>
              
              {transactionHistory.length > 0 ? (
                <div className="space-y-3">
                  {transactionHistory.map((transaction) => (
                    <div key={transaction._id} className="flex justify-between items-center border-b border-gray-200 py-3">
                      <div>
                        <p className="text-sm font-bold text-black">{transaction._id.slice(-8)}</p>
                        <p className="text-xs text-gray-500">{moment(transaction.date).format("MMM Do YYYY")}</p>
                      </div>
                      <p className="text-lg font-bold text-black">₹{transaction.amount}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No transactions found</p>
              )}
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="w-full bg-red-500 text-white py-4 px-6 font-medium hover:bg-red-600 transition-colors border-2 border-red-500 flex items-center justify-center gap-2 text-lg"
            >
              <FaSignOutAlt /> SIGN OUT
            </button>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b-4 border-black p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-black">Order Details</h2>
              <button
                onClick={closeModal}
                className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              
              {/* Product Image */}
              {selectedOrder.product?.image && (
                <div className="border-4 border-black p-4 bg-gray-50">
                  <img
                    src={`${BASE_URL}/uploads/${selectedOrder.product.image[0].split(/[\\/]/).pop()}`}
                    alt={selectedOrder.product?.name}
                    className="w-full h-64 object-contain"
                  />
                </div>
              )}

              {/* Product Details */}
              <div className="border-2 border-black p-5">
                <h3 className="font-bold text-black mb-3">Product Information</h3>
                <p className="text-gray-700"><span className="font-medium">Name:</span> {selectedOrder.product?.name}</p>
                <p className="text-gray-700"><span className="font-medium">Code:</span> {selectedOrder.product?.code}</p>
                <p className="text-gray-700"><span className="font-medium">Price:</span> <span className="font-bold text-green-600">₹{selectedOrder.totalPrice?.toLocaleString()}</span></p>
              </div>

              {/* User Info */}
              <div className="border-2 border-black p-5">
                <h3 className="font-bold text-black mb-3">Customer Information</h3>
                <p className="text-gray-700"><span className="font-medium">Name:</span> {selectedOrder.userDetails?.name}</p>
                <p className="text-gray-700"><span className="font-medium">Phone:</span> {selectedOrder.userDetails?.phoneNumber}</p>
                <p className="text-gray-700"><span className="font-medium">Address:</span> {`${selectedOrder.userDetails?.address.line1}, ${selectedOrder.userDetails?.address.city}, ${selectedOrder.userDetails?.address.state} - ${selectedOrder.userDetails?.address.zip}`}</p>
              </div>

              {/* Order Info */}
              <div className="border-2 border-black p-5">
                <h3 className="font-bold text-black mb-3">Order Information</h3>
                <p className="text-gray-700"><span className="font-medium">Order ID:</span> {selectedOrder._id}</p>
                <p className="text-gray-700"><span className="font-medium">Date:</span> {moment(selectedOrder.date).format('MMM Do YYYY')}</p>
                <p className="text-gray-700"><span className="font-medium">Payment:</span> {selectedOrder.paymentMethod}</p>
                <p className="text-gray-700"><span className="font-medium">Delivery:</span> {moment(selectedOrder.deliveryDate).format('MMM Do YYYY')}</p>
                <p className="text-gray-700 mt-2">
                  <span className="font-medium">Status:</span>
                  <span className={`ml-2 px-3 py-1 text-xs font-bold ${getStatusClass(selectedOrder.status)} border-2 border-black`}>
                    {selectedOrder.status}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;