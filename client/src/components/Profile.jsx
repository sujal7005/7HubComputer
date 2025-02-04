// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { generateInvoice } from '../utils/utils';

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
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (storedUser && storedUser._id) {
      // Fetch user profile if user data exists in localStorage
      const fetchUserProfile = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/users/${storedUser._id}`);
          setUser(response.data); // Set the updated user data
          setName(response.data.name || '');
          setPhoneNumber(response.data.phoneNumber || '');
          localStorage.setItem('user', JSON.stringify(response.data)); // Update localStorage with latest data

          // Optionally, fetch orders, addresses, transaction history
          fetchUserOrders(storedUser._id);
          fetchUserAddresses(storedUser._id);
          fetchTransactionHistory(storedUser._id);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      };

      fetchUserProfile();
    } else {
      navigate('/signin'); // Redirect to sign-in if no user found in localStorage
    }
  }, [navigate]);

  const handleInvoiceGeneration = async (order) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/orders/generate-invoice-pdf/${order._id}`);
      
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
    if (!userId) {
      console.error("User ID is not defined");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/users/${userId}/orders`);
      setUserOrders(Array.isArray(response.data) ? response.data : []);
      console.log('User Orders:', response.data);
    } catch (error) {
      console.error('Failed to fetch user orders:', error);
    }
  };

  const fetchUserAddresses = async (userId) => {
    if (!userId) {
      console.error("User ID is not defined");
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${userId}/addresses`);
      setUserAddresses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch user addresses:', error);
    }
  };

  const fetchTransactionHistory = async (userId) => {
    if (!userId) {
      console.error("User ID is not defined");
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${userId}/transactions`);
      setTransactionHistory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
    }
  };

  const handleEdit = async () => {
    const updatedUser = { userId: user._id, name, phoneNumber };

    try {
      const response = await axios.put(
        'http://localhost:5000/api/users/update-user',
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
    if (!user || !user._id) {
      console.error("User ID is not available");
      return;
    }

    const userId = user._id;
    try {
      const response = await axios.post(`http://localhost:5000/api/users/${userId}/add-address`, newAddress);
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
    if (!user || !user._id) {
      console.error("User ID is not available");
      return;
    }
    const userId = user._id;
    const addressToSave = editingAddress;

    try {
      const response = await axios.put(
        `http://localhost:5000/api/users/${userId}/update-address/${addressToSave._id}`,
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
    if (!user || !user._id) {
      console.error("User ID is not available");
      return;
    }
    const userId = user._id;
    const addressToRemove = userAddresses[index];
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/users/${userId}/remove-address/${addressToRemove._id}`
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
      const response = await axios.put(`http://localhost:5000/api/users/orders/${orderId}/cancel`);
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
      const response = await axios.get(`http://localhost:5000/api/users/orders/${orderId}`);
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
        return 'bg-yellow-500 text-black';
      case 'Shipped':
        return 'bg-blue-500 text-white';
      case 'Delivered':
        return 'bg-green-500 text-white';
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

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto mt-20 p-8 bg-gray-800 text-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">My Profile</h2>

      <div className="flex flex-wrap justify-between space-x-0 sm:space-x-4">
        {/* Left Column: My Account */}
        <div className="flex-1 bg-gray-700 p-4 rounded">
          <h3 className="text-xl font-bold mb-2">My Account</h3>
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-600 text-gray-300 rounded focus:outline-none"
                placeholder="Full Name"
              />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 bg-gray-600 text-gray-300 rounded focus:outline-none"
                placeholder="Phone Number"
              />
              <button
                onClick={handleEdit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p><strong>Full Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone Number:</strong> {user.phoneNumber || 'N/A'}</p>
              <p className="text-xl font-semibold text-yellow-400 bg-yellow-700 p-2 rounded-lg shadow-md drop-shadow-[0_0_10px_rgba(255,223,0,0.7)]">
                <strong>Bonus Points:</strong> {user.bonusPoints}
              </p>

              {/* Discount Code Floating Box */}
              <div className="bg-gray-700 p-4 rounded mt-4 shadow-lg shadow-green-400/50">
                <h3 className="text-xl font-bold mb-2 text-white">Discount Code</h3>
                <p className="text-lg font-semibold text-green-400">{user.discountCode}</p>
                <p className="text-white">Expires on: {moment(user.discountExpiresAt).format("MMMM D, YYYY")}</p>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Your Orders */}
        <div className="mt-6 flex-1 bg-gray-700 p-4 rounded-lg sm:mt-0 shadow-lg">
          <h3 className="text-2xl font-bold mb-4 text-white">Your Orders</h3>
          {userOrders.length > 0 ? (
            <ul className="space-y-4">
              {userOrders.map((order) => (
                <div>
                  <p className={`font-semibold p-2 rounded-md text-white ${getStatusClass(order.status)} transition-all duration-500 ease-in-out`}>
                    <span className={`mr-2 ${order.status === 'Processing' ? 'animate-spin' : ''}`}>
                      {order.status === 'Processing' ? (
                        <i className="fas fa-spinner fa-spin"></i> // or use an appropriate icon
                      ) : (
                        ''
                      )}
                    </span>
                  </p>
                  <li key={order._id} className="bg-gray-600 p-5 rounded-lg shadow-md hover:shadow-xl transition duration-300 ease-in-out">
                    <p className="text-sm text-white mb-2"><strong>Order ID:</strong> {order._id}</p>
                    <p className="text-sm text-white mb-2"><strong>Product Name:</strong> {order.product?.name}</p>
                    <p className="text-sm text-white mb-2"><strong>Order Date:</strong> {moment(order.date).format('MMM Do YYYY')}</p>
                    <p className="text-sm text-white mb-2"><strong>Payment Method:</strong> {order.paymentMethod}</p>
                    <p className="text-sm text-white mb-2"><strong>Delivery Date:</strong> {moment(order.deliveryDate).format('MMM Do YYYY')}</p>
                    <p className="text-sm text-white mb-2"><strong>Status:</strong> {order.status}</p>
                    
                    <div className='flex space-x-3'>
                      <button
                        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 ease-in-out"
                        onClick={() => handleViewOrderDetails(order._id)}
                      >
                        View Details
                      </button>

                      {/* Button to generate invoice */}
                      <button onClick={() => handleInvoiceGeneration(order)} 
                        className="py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300 ease-in-out">
                        Generate Invoice
                      </button>
                      {order.status !== 'Cancelled' && (
                        <button
                          className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-300 ease-in-out"
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </li>
                </div>
              ))}
            </ul>
          ) : (
            <p>No orders found.</p>
          )}
        </div>
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-700 w-3/4 max-w-2xl p-6 rounded-lg shadow-lg relative">
              <h2 className="text-2xl font-bold mb-4">Order Details</h2>

              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-red-500 hover:text-gray-800 text-2xl h-10 w-10 flex items-center justify-center bg-red-100 hover:bg-red-200 rounded-full"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>

              {/* Product Details */}
              <div className="mb-4">
                <img
                  src={selectedOrder.product?.image
                    ? `http://localhost:5000/uploads/${selectedOrder.product.image[0].split('\\').pop()}`
                    : '/path/to/placeholder-image.jpg'} // Optional placeholder image for missing images
                  alt={selectedOrder.product?.name}
                  className="w-90 h-[300px] object-cover mb-4 rounded-lg"
                />
                <p><strong>Product Name:</strong> {selectedOrder.product?.name}</p>
                <p><strong>Product Code:</strong> {selectedOrder.product?.code}</p>
                <p>
                  <strong>Product Final Price:</strong>{" "}
                  {selectedOrder.product?.finalPrice
                    ? `₹${selectedOrder.product.finalPrice.toLocaleString()}`
                    : "Price not available"}
                </p>
              </div>

              {/* User Info */}
              <div className="mb-4">
                <p><strong>User Name:</strong> {selectedOrder.userDetails?.name}</p>
                <p><strong>Phone Number:</strong> {selectedOrder.userDetails?.phoneNumber}</p>
                <p><strong>Address:</strong> {`${selectedOrder.userDetails?.address.line1}, ${selectedOrder.userDetails?.address.line2}, ${selectedOrder.userDetails?.address.city}, ${selectedOrder.userDetails?.address.state}, ${selectedOrder.userDetails?.address.zip}`}</p>
              </div>

              {/* Order Info */}
              <div className="mb-4">
                <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                <p><strong>Order Date:</strong> {moment(selectedOrder.date).format('MMM Do YYYY')}</p>
                <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                <p><strong>Delivery Date:</strong> {moment(selectedOrder.deliveryDate).format('MMM Do YYYY')}</p>
                <p><strong>Status:</strong> {selectedOrder.status}</p>
              </div>

            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex-wrap justify-between space-x-0 sm:flex sm:space-x-4">
        {/* Left Column: User Addresses */}
        <div className="flex-1 bg-gray-700 p-4 rounded">
          <h3 className="text-xl font-bold mb-2">User Addresses</h3>
          {userAddresses.length > 0 ? (
            <ul className="space-y-2">
              {userAddresses.map((address, index) => (
                <li key={address.id || address._id || index} className="bg-gray-600 p-4 rounded">
                  {editingAddressIndex === index ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingAddress.line1}
                        onChange={(e) =>
                          setEditingAddress({ ...editingAddress, line1: e.target.value })
                        }
                        placeholder="Address Line 1 (Street Address or P.O. Box)"
                        className="w-full px-4 py-2 bg-gray-600 text-gray-300 rounded focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editingAddress.line2} // New field for Apt/Suite/Unit
                        onChange={(e) =>
                          setEditingAddress({ ...editingAddress, line2: e.target.value })
                        }
                        placeholder="Apt, Suite, Unit, Building, Floor, etc."
                        className="w-full px-4 py-2 bg-gray-600 text-gray-300 rounded focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editingAddress.city}
                        onChange={(e) =>
                          setEditingAddress({ ...editingAddress, city: e.target.value })
                        }
                        placeholder="City"
                        className="w-full px-4 py-2 bg-gray-600 text-gray-300 rounded focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editingAddress.state}
                        onChange={(e) =>
                          setEditingAddress({ ...editingAddress, state: e.target.value })
                        }
                        placeholder="State"
                        className="w-full px-4 py-2 bg-gray-600 text-gray-300 rounded focus:outline-none"
                      />
                      <input
                        type="text"
                        value={editingAddress.zip}
                        onChange={(e) =>
                          setEditingAddress({ ...editingAddress, zip: e.target.value })
                        }
                        placeholder="ZIP Code"
                        className="w-full px-4 py-2 bg-gray-600 text-gray-300 rounded focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveEdit(index)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingAddressIndex(null)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded mt-2"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <p>
                        <strong>Address:</strong> {address.line1}, {address.line2},
                        {address.city}, {address.state} {address.zip}
                      </p>
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingAddressIndex(index);
                            setEditingAddress(address);
                          }}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white py-1 px-2 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemove(index)}
                          className="bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded"
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No addresses found.</p>
          )}
          {!isAddingAddress ? (
            <button
              onClick={() => setIsAddingAddress(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded mt-4"
            >
              Add Address
            </button>
          ) : (
            <div className="space-y-2 mt-4">
              <input
                type="text"
                value={newAddress.line1}
                onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                placeholder="Address Line 1 (Street Address or P.O. Box)"
                className="w-full px-4 py-2 bg-gray-600 text-gray-300 rounded focus:outline-none"
              />
              <input
                type="text"
                value={newAddress.line2} // New field for Apt/Suite/Unit
                onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                placeholder="Apt, Suite, Unit, Building, Floor, etc."
                className="w-full px-4 py-2 bg-gray-600 text-gray-300 rounded focus:outline-none"
              />
              <input
                type="text"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                placeholder="City"
                className="w-full px-4 py-2 bg-gray-600 text-gray-300 rounded focus:outline-none"
              />
              <input
                type="text"
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                placeholder="State"
                className="w-full px-4 py-2 bg-gray-600 text-gray-300 rounded focus:outline-none"
              />
              <input
                type="text"
                value={newAddress.zip}
                onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                placeholder="ZIP Code"
                className="w-full px-4 py-2 bg-gray-600 text-gray-300 rounded focus:outline-none"
              />
              <button
                onClick={handleAddAddress}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
              >
                Save Address
              </button>
              <button
                onClick={() => setIsAddingAddress(false)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded mt-2"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Transaction History */}
        <div className="mt-6 flex-1 bg-gray-700 p-4 rounded sm:mt-0">
          <h3 className="text-xl font-bold mb-2">Transaction History</h3>
          {transactionHistory.length > 0 ? (
            <ul className="space-y-2">
              {transactionHistory.map((transaction, index) => (
                <li key={transaction.id || index} className="bg-gray-600 p-4 rounded">
                  <p><strong>Transaction ID:</strong> {transaction._id}</p>
                  <p><strong>Date:</strong> {moment(transaction.date).format('MMM Do YYYY')}</p>
                  <p><strong>Amount:</strong> ₹{transaction.amount}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No transactions found.</p>
          )}
        </div>
        <button
          onClick={handleSignOut}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded mt-4"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Profile;