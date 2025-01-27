import React, { useState, useEffect, useRef } from "react";
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { io } from "socket.io-client";

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', phoneNumber: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(Number(localStorage.getItem("countdown")) || 10800); // 3 hours in seconds
  const timeoutRef = useRef(null); // Use ref instead of state for timeoutId
  const [loginHistory, setLoginHistory] = useState([]); // To store login history
  const [socket, setSocket] = useState(null);
  const [position, setPosition] = useState({ x: 6, y: 115 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [recipient, setRecipient] = useState(""); // For a single email
  const [formData, setFormData] = useState({
    id: "",
    type: "",
    name: '',
    price: '',
    category: '',
    description: '',
    image: null,
    popularity: 0,
    ramOptions: [{ value: "", price: "" }],
    storage1Options: [{ value: "", price: "" }],
    storage2Options: [{ value: "", price: "" }],
    otherTechnicalDetails: [{ name: "", value: "" }],
    notes: [""],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  const [editingUser, setEditingUser] = useState(null); // For the user being edited
  const [editedUser, setEditedUser] = useState({
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
  });
  const [subscribers, setSubscribers] = useState([]);
  const [messageHistory, setMessageHistory] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState([]);
  const [locationInfo, setLocationInfo] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenforLocation, setIsOpenforLocation] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filter products based on the search term
  const filteredPreBuiltPCs = (products || []).filter(
    (product) =>
      product.type === 'Pre-Built PC' &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredRefurbishedLaptops = (products || []).filter(
    (product) =>
      product.type === 'Refurbished Laptop' &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredMiniPCs = (products || []).filter(
    (product) =>
      product.type === 'Mini PC' &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    // Connect to Socket.io server 
    const socketConnection = io("http://localhost:5000", {
      transports: ["polling", "websocket"],
      withCredentials: true,
    });

    // Save socket connection in state
    setSocket(socketConnection);

    return () => {
      // Clean up socket connection when component unmounts
      socketConnection.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        const socketUserId = localStorage.getItem('user'); // Use the actual userId from JWT or session
        // console.log("Emitting user-online with userId:", socketUserId);

        if (!socketUserId) {
          console.log("No userId found in localStorage!");
        } else {
          socket.emit("user-online", socketUserId);
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    // Fetch device info from backend
    const fetchDeviceInfo = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/device-info");
        const data = await response.json();
        setDeviceInfo(data);
      } catch (error) {
        console.error("Error fetching device info:", error);
      }
    };

    // Fetch location info from backend
    const fetchLocationInfo = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/location");
        const data = await response.json();
        setLocationInfo(data);
      } catch (error) {
        console.error("Error fetching location info:", error);
      }
    };

    fetchDeviceInfo();
    fetchLocationInfo();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/products", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();
        const allProducts = [
          ...data.prebuildPC,
          ...data.refurbishedProducts,
          ...data.miniPCs,
          // Add any other product categories here if applicable
        ];
        setProducts(allProducts);
      } catch (error) {
        console.error(error);
        setError("Unable to load products. Please try again.");
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error(error);
        setError("Unable to load users. Please try again.");
      }
    };

    const fetchPendingOrders = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.userId;

        const response = await fetch(`http://localhost:5000/api/users/${userId}/orders`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch pending orders');

        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
        setError('Unable to fetch pending orders');
      }
    };

    const fetchData = async () => {
      try {
        const [subResponse, msgResponse] = await Promise.all([
          fetch("http://localhost:5000/api/subscribers"),
          fetch("http://localhost:5000/api/message-history"),
        ]);

        setSubscribers(await subResponse.json());
        setMessageHistory(await msgResponse.json());
      } catch (error) {
        console.error("Error fetching subscribers:", error);
      }
    };

    fetchProducts();
    fetchUsers();
    fetchPendingOrders();
    fetchData();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Include JWT in headers
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setIsAuthenticated(false);
            localStorage.removeItem("token");
          }
          throw new Error("Failed to fetch dashboard data");
        }

        const stats = await response.json();
        setDashboardStats(stats); // Update state with fetched stats
      } catch (error) {
        console.error(error);
        setError("Unable to load dashboard stats. Please try again.");
      }
    };

    const fetchLoginHistory = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/login-history", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch login history");
        }

        const data = await response.json();
        setLoginHistory(data.loginHistory); // Update state with login history
      } catch (error) {
        console.error(error);
        setError("Unable to load login history. Please try again.");
      }
    };

    if (isAuthenticated) {
      fetchStats();
      fetchLoginHistory();
    }
  }, [isAuthenticated]);

  const setLogoutTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsAuthenticated(false); // Log the user out after 3 hours
      setCountdown(0); // Reset countdown
      localStorage.setItem("countdown", 0); // Persist logout state
      alert("Session timed out due to inactivity.");
    }, countdown * 1000); // Remaining countdown in milliseconds
  };

  useEffect(() => {
    // Check for token in localStorage on initial render
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }

    const resetTimeoutOnActivity = () => {
      setLogoutTimeout(); // Reset logout timer
    };

    // Add event listeners for user activity
    window.addEventListener("mousemove", resetTimeoutOnActivity);
    window.addEventListener("keydown", resetTimeoutOnActivity);

    // Start countdown interval
    const intervalId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(intervalId); // Clear interval when countdown reaches 0
          setIsAuthenticated(false);
          // setError("Session timed out due to inactivity.");
          localStorage.removeItem("countdown");
          return 0;
        }
        const newCountdown = prev - 1;
        localStorage.setItem("countdown", newCountdown); // Persist countdown
        return newCountdown;
      });
    }, 1000);

    // Initialize logout timeout
    setLogoutTimeout();

    // Cleanup on component unmount
    return () => {
      window.removeEventListener("mousemove", resetTimeoutOnActivity);
      window.removeEventListener("keydown", resetTimeoutOnActivity);
      clearInterval(intervalId);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []); // Run only on initial render

  // Update countdown every second
  useEffect(() => {
    if (!isAuthenticated) return;

    // Countdown interval
    const intervalId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(intervalId);
          setIsAuthenticated(false);
          setError("Session timed out due to inactivity.");
          localStorage.removeItem("countdown"); // Clear countdown when expired
          return 0;
        }
        const newCountdown = prev - 1;
        localStorage.setItem("countdown", newCountdown); // Persist countdown
        return newCountdown;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Format the countdown time into HH:MM:SS format
  const formatTime = (seconds) => {
    const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${secs}`;
  };

  const handleImageChange = (e) => {
    const imageFiles = e.target.files;
    // const previews = [];

    if (imageFiles && imageFiles.length > 0) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const validFiles = Array.from(imageFiles).filter(file => allowedTypes.includes(file.type));

      if (validFiles.length !== imageFiles.length) {
        alert('Some files are invalid. Only JPEG, PNG, and GIF are allowed.');
        return;
      }

      const previewUrls = validFiles.map(file => URL.createObjectURL(file));

      setImagePreview((prev) => [...prev, ...previewUrls]);

      setFormData((prevData) => ({
        ...prevData,
        image: Array.isArray(prevData.image) ? [...prevData.image, ...validFiles] : [...validFiles],
      }));
    } else {
      console.log("No files selected or invalid input");
    }
  };

  const handleImageRemove = (index) => {
    setImagePreview(prevPreviews => prevPreviews.filter((_, i) => i !== index));
  };

  const handleInputChange1 = (e) => {
    const { name, value } = e.target;
    setCredentials((prevCredentials) => ({
      ...prevCredentials,
      [name]: value,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Toggle the password visibility state
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) throw new Error("Failed to add user");
      const data = await response.json();
      setUsers(data.users);
      setNewUser({ name: '', email: '', password: '', phoneNumber: '' });
    } catch (error) {
      console.error(error);
      setError("Unable to add user. Please try again.");
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to delete user");
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error(error);
      setError("Unable to delete user. Please try again.");
    }
  };

  const handleEditUser = (user) => {
    // Logic to handle editing user
    setEditingUser(user);
    setEditedUser({
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    if (!editedUser.username || !editedUser.email || !editedUser.phoneNumber || !editedUser.password) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${editingUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editedUser),
      });

      if (!response.ok) throw new Error("Failed to update user");
      const updatedUser = await response.json();

      // Update users list with the edited user data
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user._id === updatedUser._id ? updatedUser : user))
      );

      // Clear the edit state
      setEditingUser(null);
      setEditedUser({ username: '', email: '', password: '', phoneNumber: '' });
    } catch (error) {
      console.error(error);
      setError("Unable to update user. Please try again.");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Utility function to build FormData
  const buildFormData = (formData) => {
    const formDataToSend = new FormData();

    // console.log("this function buildformdata in working")

    // Generate ID if productType is 'pre-built PC' or 'refurbished laptop'
    if (["pre-built PC", "refurbished laptop", "mini PC"].includes(formData.type)) {
      formData.id = formData.id || `${Date.now()}${Math.floor(Math.random() * 10000)}`; // Generate unique ID
    }

    if (!formData.id) {
      formData.id = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
      console.log("Generated ID:", formData.id);
    }

    // Check if customId is missing and generate it if necessary
    if (!formData.customId) {
      formData.customId = `${Date.now()}${Math.floor(Math.random() * 10000)}`; // Generate a unique customId
      console.log("Generated customId:", formData.customId);  // Log generated customId for debugging
    }

    // Append fields
    Object.keys(formData).forEach((key) => {
      if (!['notes', 'otherTechnicalDetails', 'image'].includes(key)) {
        formDataToSend.append(key, formData[key]);
      }
    });

    const appendOptions = (options, key) => {
      if (Array.isArray(options) && options.length > 0) {
        // Serialize each option in the array
        options.forEach((option, index) => {
          const serializedOption = JSON.stringify(option);  // Stringify each object
          formDataToSend.append(`${key}[${index}]`, serializedOption); // Use an array-like key for each entry
        });
      } else {
        console.error(`${key} is not an array or is undefined.`, options);
      }
    };

    // Append RAM, Storage options if product type is 'pre-built PC'
    if (formData.type === "Pre-Built PC" || formData.type === "mini PC") {
      appendOptions(formData.ramOptions, "ramOptions");
      appendOptions(formData.storage1Options, "storage1Options");

      if (formData.type === "Pre-Built PC") {
        appendOptions(formData.storage2Options, "storage2Options");
      }
    }


    // Product-type-specific fields
    const productTypeFields = {
      "pre-built PC": ["platform", "motherboard", "storage1", "storage2", "liquidcooler", "graphiccard", "smps", "cabinet"],
      "refurbished laptop": ["ram", "storage", "graphiccard", "display", "os", "condition"],
      "mini PC": ["storage1", "graphiccard", "motherboard", "smps", "cabinet"],
    };

    (productTypeFields[formData.type] || []).forEach((field) => {
      formDataToSend.append(field, formData[field]);
    });

    // Images
    if (formData.image) {
      const images = Array.isArray(formData.image) ? formData.image : [formData.image];
      images.forEach((file) => {
        if (file instanceof File) {
          formDataToSend.append("image", file);
        } else {
          console.error("Non-file object found in image array", file);
        }
      });
    } else {
      console.error("No image found in formData.");
    }

    // Append JSON fields properly
    if (formData.notes) {
      // Ensure 'notes' is a string or array and append only once
      if (Array.isArray(formData.notes)) {
        formDataToSend.append("notes", JSON.stringify(formData.notes)); // Convert array to string
      } else if (typeof formData.notes === "string") {
        formDataToSend.append("notes", formData.notes); // Append string as is
      }
    }
    if (formData.otherTechnicalDetails) {
      formDataToSend.append("otherTechnicalDetails", JSON.stringify(formData.otherTechnicalDetails));
    }

    // console.log("ramOptions:", JSON.stringify(formData.ramOptions, null, 2));
    // console.log("storage1Options:", JSON.stringify(formData.storage1Options, null, 2));
    // console.log("storage2Options:", JSON.stringify(formData.storage2Options, null, 2));


    // Log FormData fields
    console.log("Final FormData to be sent:");
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`${key}: ${value}`);
    }

    return formDataToSend;
  };

  // Function to submit product data
  const submitProduct = async (url, method, formDataToSend) => {

    // console.log("this function submitproduct in working")

    try {
      // console.log("Authorization Token:", localStorage.getItem("token"));
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Error Details:", errorDetails);  // Log detailed error response
        throw new Error(`Failed to save product: ${errorDetails.message || response.statusText}`);
      }

      const data = await response.json();
      alert('Product created successfully');
      console.log(`${method === "POST" ? "Created" : "Updated"} product successfully:`, data);
      return data;
    } catch (error) {
      console.error("Error in product submission:", error);
      throw error;
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    // console.log("this function handleproductsubmit in working")

    // Generate ID for new products
    if (!isEditing) {
      formData.id = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
    }

    // Check if adding or editing
    const isEditOperation = isEditing && formData.id; // Ensure 'isEditing' is explicitly checked

    try {
      const formDataToSend = buildFormData(formData);
      const method = isEditOperation ? "PUT" : "POST"; // Use PUT if editing, POST if adding
      console.log(formData.type);

      const url = isEditOperation
        ? `http://localhost:5000/api/admin/products/${encodeURIComponent(formData.type)}/${formData.id}` // Use the existing product ID for editing
        : "http://localhost:5000/api/admin/products/add";  // POST for new products

      console.log("Final URL:", url); // Debug the URL
      console.log("Request Method:", method); // Debug the HTTP method
      console.log("FormDataToSend:", formDataToSend); // Debug the final FormData

      const result = await submitProduct(url, method, formDataToSend);

      // Update product list and reset form
      setProducts(result.products);
      setFormData({
        id: null,
        type: "",
        name: "",
        price: "",
        category: "",
        description: "",
        image: null,
        ramOptions: [{ value: "", price: "" }],
        storage1Options: [{ value: "", price: "" }],
        storage2Options: [{ value: "", price: "" }],
        otherTechnicalDetails: [{ name: "", value: "" }],
        notes: [""],
      });
      setIsEditing(false);
      setImagePreview(null);
    } catch (error) {
      setError(error.message || "Unable to save product. Please try again.");
    }
  };

  const handleDelete = async (id, productType) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/products/${productType}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) throw new Error("Failed to delete product");

      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error(error);
      setError("Unable to delete product. Please try again.");
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Set countdown to 3 hours on login (or any desired value)
    const newCountdown = 10800;
    localStorage.setItem("countdown", newCountdown); // Persist new countdown
    setCountdown(newCountdown);

    try {
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid credentials");
        }
        throw new Error("Login failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token); // Store token in local storage
      setIsAuthenticated(true);
      setCredentials({ username: "", password: "" });

      // Log the login event with timestamp
      const loginEvent = {
        username: credentials.username,
        date: new Date().toLocaleString(), // Current date and time
      };
      setLoginHistory((prevHistory) => [loginEvent, ...prevHistory]); // Add to history

    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("token"); // Remove token from localStorage
    setCountdown(0); // Reset countdown
    localStorage.setItem("countdown", 0);
    alert("You have logged out successfully.");
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        // Update the orders in state (assuming `setOrders` is used for state management)
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        console.error('Failed to update order status:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const updateDeliveryDate = async (orderId, newDate) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/delivery-date`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ deliveryDate: newDate }),
      });

      if (!response.ok) throw new Error('Failed to update delivery date');

      const updatedOrder = await response.json();

      // Update the orders state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, deliveryDate: newDate } : order
        )
      );
    } catch (error) {
      console.error(error);
      setError('Unable to update delivery date');
    }
  };

  const updateOrderState = async (orderId, action) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/state`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        console.log(`Order ${action} successfully:`, updatedOrder);
        // Update the orders in state (assuming `setOrders` is used for state management)
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? { ...order, status: action === 'confirmed' ? 'Confirmed' : 'Cancelled' }
              : order
          )
        );
      } else {
        console.error('Failed to update order state:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating order state:', error);
    }
  };

  // Handlers for "Other Technical Details"
  const handleOtherTechnicalDetailsChange = (index, field, value) => {
    const updatedDetails = [...formData.otherTechnicalDetails];
    updatedDetails[index][field] = value;
    setFormData({ ...formData, otherTechnicalDetails: updatedDetails });
  };

  const addOtherTechnicalDetail = () => {
    setFormData(prevData => ({
      ...prevData,
      otherTechnicalDetails: [
        ...prevData.otherTechnicalDetails,
        { name: "", value: "" }, // New empty detail
      ],
    }));
  };

  const removeOtherTechnicalDetail = (index) => {
    const updatedDetails = formData.otherTechnicalDetails.filter((_, i) => i !== index);
    setFormData({ ...formData, otherTechnicalDetails: updatedDetails });
  };

  // Handlers for "Notes"
  const handleNotesChange = (index, value) => {
    const updatedNotes = [...formData.notes];
    updatedNotes[index] = value;
    setFormData({ ...formData, notes: updatedNotes });
  };

  const addNote = () => {
    setFormData({ ...formData, notes: [...formData.notes, ""] });
  };

  const removeNote = (index) => {
    const updatedNotes = formData.notes.filter((_, i) => i !== index);
    setFormData({ ...formData, notes: updatedNotes });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: recipient.split(',').map((email) => email.trim()), // Split multiple emails
          subject,
          message,
        }),
      });

      if (response.ok) {
        alert("Message sent successfully!");
        setRecipient("");
        setSubject("");
        setMessage("");
        const historyResponse = await fetch("http://localhost:5000/api/message-history");
        setMessageHistory(await historyResponse.json());
      } else {
        console.error("Failed to send message.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleDynamicChange = (e, index, field) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const updatedField = [...prevData[field]]; // Copy the array
      updatedField[index][name.includes("Price") ? "price" : "value"] = value; // Update specific property
      return { ...prevData, [field]: updatedField }; // Update state
    });
  };

  const addField = (fieldName) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: [...prev[fieldName], { value: "", price: "" }],
    }));
  };

  const removeField = (field, index) => {
    setFormData((prevData) => {
      const updatedField = [...prevData[field]];
      updatedField.splice(index, 1); // Remove the item at the specified index
      return { ...prevData, [field]: updatedField }; // Update state
    });
  };

  const toggleBox = () => setIsOpen(!isOpen);

  const toggleBox1 = () => setIsOpenforLocation((prev) => !prev);

  const toggleHistory = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-indigo-400 flex items-center justify-center">
      {!isAuthenticated ? (
        <div className="bg-gray-800 p-6 rounded-md shadow-md w-80">
          <h2 className="text-xl font-bold mb-4 text-center">
            Admin Login
          </h2>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div>
              <label htmlFor="username" className="block text-sm mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleInputChange1}
                className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange1}
                className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-indigo-500 text-gray-900 font-semibold rounded-md hover:bg-indigo-600 transition"
            >
              Login
            </button>
          </form>
        </div>
      ) : (
        <div className="w-full">
          <header className="p-6 bg-gray-800 shadow-md">
            <h1 className="text-3xl font-semibold text-center">Welcome, Admin Panel</h1>
          </header>
          <div className="p-6">
            {/* Dashboard Section */}
            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
              {dashboardStats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-gray-800 rounded-md shadow-md">
                    <h3 className="text-xl font-medium">Total Users</h3>
                    <p className="text-2xl font-bold mt-2">{dashboardStats.totalUsers}</p>
                  </div>
                  <div className="p-6 bg-gray-800 rounded-md shadow-md">
                    <h3 className="text-xl font-medium">Total Products</h3>
                    <p className="text-2xl font-bold mt-2">{dashboardStats.totalProducts}</p>
                  </div>
                  <div className="p-6 bg-gray-800 rounded-md shadow-md">
                    <h3 className="text-xl font-medium">Pending Orders</h3>
                    <p className="text-2xl font-bold mt-2">{dashboardStats.pendingOrders}</p>
                  </div>
                  <div className="p-6 bg-gray-800 rounded-md shadow-md">
                    <h3 className="text-xl font-medium">Online Users</h3>
                    {console.log("Current online users:", dashboardStats.totalOnlineUsers)}
                    <p className="text-2xl font-bold mt-2">{dashboardStats.totalOnlineUsers}</p>
                  </div>
                </div>
              ) : (
                <p className="text-red-500">Loading dashboard stats...</p>
              )}
            </section>

            {/* Countdown Timer and log out */}
            <div
              className="fixed bg-gray-800 text-white p-4 rounded-lg shadow-lg border-2 border-white z-10 cursor-move"
              style={{
                top: `${position.y}px`,
                left: `${position.x}px`,
                boxShadow: "0 0 13px 5px rgba(255, 255, 255, 0.75)",
                position: "fixed", // Allow movement
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp} // Stop dragging when the mouse leaves the box
            >
              <p className="text-lg font-semibold">Session Timeout</p>
              <p className="text-xl">{formatTime(countdown)}</p>
              <button
                onClick={handleLogout}
                className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition duration-300 ease-in-out"
              >
                Logout
              </button>
            </div>

            {/* Pending Orders Section */}
            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">Pending Orders</h2>
              {error && <p className="error text-red-500">{error}</p>}
              <div className="bg-gray-800 p-6 rounded-md shadow-md">
                {orders && orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-300">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="py-2 px-4">Order ID</th>
                          <th className="py-2 px-4">Product Details</th>
                          <th className="py-2 px-4">User Details</th>
                          <th className="py-2 px-4">Payment Method</th>
                          <th className="py-2 px-4">Price (₹)</th>
                          <th className="py-2 px-4">Order Date</th>
                          <th className="py-2 px-4">Delivery Date</th>
                          <th className="py-2 px-4">Status</th>
                          <th className="py-2 px-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id} className="bg-gray-700 hover:bg-gray-600 transition">
                            {/* Order ID */}
                            <td className="py-2 px-4">{order._id}</td>

                            {/* Product Details */}
                            <td className="py-2 px-4">
                              <div>
                                <p className="font-semibold">{order.product.name}</p>
                                <p className="text-sm text-gray-400">{order.product.description}</p>
                                <p className="text-sm text-gray-400">Category: {order.product.category}</p>
                              </div>
                            </td>

                            {/* User Details */}
                            <td className="py-2 px-4">
                              <div>
                                <p>Name: {order.userDetails.name}</p>
                                <p>Email: {order.userDetails.email}</p>
                                <p>Phone: {order.userDetails.phoneNumber}</p>
                                <p className="text-sm text-gray-400">
                                  Address: {order.userDetails.address}
                                </p>
                              </div>
                            </td>

                            {/* Payment Method */}
                            <td className="py-2 px-4">{order.paymentMethod}</td>

                            {/* Product Price */}
                            <td className="py-2 px-4">₹{order.product.price}</td>

                            {/* Order Date */}
                            <td className="py-2 px-4">{new Date(order.date).toLocaleDateString()}</td>

                            {/* Editable Delivery Date */}
                            <td className="py-2 px-4">
                              <input
                                type="date"
                                value={order.deliveryDate && !isNaN(new Date(order.deliveryDate).getTime())
                                  ? new Date(order.deliveryDate).toISOString().split('T')[0] // Format date for the date input
                                  : ""
                                } // Format date for the date input
                                onChange={(e) => updateDeliveryDate(order._id, e.target.value)}
                                className="bg-gray-800 text-gray-300 py-1 px-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>

                            {/* Status */}
                            <td className="py-2 px-4">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                className="bg-gray-800 text-gray-300 py-1 px-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>

                            {/* Actions */}
                            <td className="py-2 px-4 text-center space-x-2">
                              <button
                                onClick={() => updateOrderState(order._id, 'confirmed')}
                                className="py-1 px-3 bg-green-500 text-gray-900 rounded-md hover:bg-green-600 transition"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => updateOrderState(order._id, 'cancelled')}
                                className="py-1 px-3 bg-red-500 text-gray-900 rounded-md hover:bg-red-600 transition"
                              >
                                Cancel
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400">No pending orders found.</p>
                )}
              </div>
            </section>

            {/* Manage Users Section */}
            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>
              <div className="bg-gray-800 p-6 rounded-md shadow-md">
                {/* User Table */}
                {users && users.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-700">
                          <th className="p-3 text-indigo-400">Username</th>
                          <th className="p-3 text-indigo-400">Email</th>
                          <th className="p-3 text-indigo-400">Phone</th>
                          <th className="p-3 text-indigo-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user._id} className="border-t border-gray-600">
                            <td className="p-3">{user.name}</td>
                            <td className="p-3">{user.email}</td>
                            <td className="p-3">{user.phoneNumber}</td>
                            <td className="p-3 flex space-x-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400">No users found. Please add users.</p>
                )}
              </div>

              {editingUser && (
                <form onSubmit={handleUpdateUser} className="mt-6">
                  <h3 className="text-xl font-semibold mb-2">Edit User</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      name="username"
                      value={editedUser.username}
                      onChange={handleInputChange}
                      className="p-3 bg-gray-700 rounded-md text-gray-200"
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      value={editedUser.email}
                      onChange={handleInputChange}
                      className="p-3 bg-gray-700 rounded-md text-gray-200"
                      required
                    />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={editedUser.phoneNumber}
                      onChange={handleInputChange}
                      className="p-3 bg-gray-700 rounded-md text-gray-200"
                      required
                    />
                    <input
                      type="password"
                      name="password"
                      value={editedUser.password}
                      onChange={handleInputChange}
                      className="p-3 bg-gray-700 rounded-md text-gray-200"
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Update User
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </form>
              )}

              {/* Add New User */}
              <form onSubmit={handleAddUser} className="mt-6">
                <h3 className="text-xl font-semibold mb-2">Add New User</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Username"
                    value={newUser.name}
                    onChange={handleInputChange}
                    className="p-3 bg-gray-700 rounded-md text-gray-200"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    className="p-3 bg-gray-700 rounded-md text-gray-200"
                    required
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={newUser.password}
                      onChange={handleInputChange}
                      className="p-3 bg-gray-700 rounded-md text-gray-200 w-full"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility} // Toggle visibility when clicked
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? "🙈" : "👁️"} {/* Icon to show/hide password */}
                    </button>
                  </div>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={newUser.phoneNumber}
                    onChange={handleInputChange}
                    className="p-3 bg-gray-700 rounded-md text-gray-200"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Add User
                </button>
              </form>
            </section>

            {/* Manage Products Section */}
            <section className="relative">
              <h2 className="text-2xl font-semibold mb-4">
                Manage Products{" "}
                <span className="text-2x1">({dashboardStats?.totalProducts})</span>
              </h2>

              {/* Search Input */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 rounded-md bg-gray-700 text-white w-full md:w-1/2"
                />
              </div>

              <div className="bg-gray-800 p-6 rounded-md shadow-md grid grid-cols-1 gap-6 md:grid-cols-2  justify-items-center">

                {/* Product List for Pre-Built PCs */}
                <div className="bg-gray-800 p-6 rounded-md shadow-lg w-full max-w-full md:max-w-lg">
                  <h3 className="text-xl font-medium mb-4">Pre-Built PCs</h3>
                  {Array.isArray(filteredPreBuiltPCs) && filteredPreBuiltPCs.length > 0 ? (
                    <>
                      {/* Show total number of products */}
                      <p className="text-gray-300 mb-4">Total Products: {products.filter((product) => product.type === "Pre-Built PC").length}</p>
                      <ul className="space-y-4" style={{ maxHeight: 'calc(3 * 10rem)', overflowY: 'auto' }}>
                        {filteredPreBuiltPCs.filter((product) => product.type === "Pre-Built PC")
                          .map((product) => (
                            <li
                              key={product._id}
                              className="p-4 bg-gray-700 rounded-md flex flex-col md:flex-row justify-between items-center space-x-0 md:space-x-4 space-y-4 md:space-y-0"
                              onClick={() => {
                                const formattedDate = product.dateAdded.split("T")[0];
                                const processedImage = Array.isArray(product.image)
                                  ? product.image.map((img) =>
                                    img.includes("uploads")
                                      ? `http://localhost:5000/uploads/${img.split("\\").pop()}`
                                      : img // Retain valid URLs
                                  )
                                  : [];

                                setSelectedProduct({
                                  id: product._id,
                                  name: product.name,
                                  price: product.price,
                                  image: product.image,
                                  originalPrice: product.originalPrice,
                                  brand: product.brand,
                                  category: product.category,
                                  description: product.description,
                                  stock: product.stock,
                                  code: product.code,
                                  discount: product.discount,
                                  bonuses: product.bonuses,
                                  dateAdded: formattedDate,
                                  popularity: product.popularity,
                                  otherTechnicalDetails: product.otherTechnicalDetails,
                                  notes: product.notes,
                                  condition: product.condition,
                                  cpu: product.specs.cpu,
                                  graphiccard: product.specs.graphiccard,
                                  platform: product.specs.platform,
                                  motherboard: product.specs.motherboard,
                                  ramOptions: Array.isArray(product.specs.ramOptions)
                                    ? product.specs.ramOptions
                                    : [],
                                  storage1Options: Array.isArray(product.specs.storage1Options)
                                    ? product.specs.storage1Options
                                    : [],
                                  storage2Options: Array.isArray(product.specs.storage2Options)
                                    ? product.specs.storage2Options
                                    : [],
                                  liquidcooler: product.specs.liquidcooler,
                                  smps: product.specs.smps,
                                  cabinet: product.specs.cabinet,
                                  type: 'Pre-Built PC',
                                });
                              }}
                            >
                              <div className="flex-shrink-0">
                                {product.image && Array.isArray(product.image) && product.image.length > 0 && (
                                  <img
                                    src={`http://localhost:5000/uploads/${product.image[0].split('\\').pop()}`}
                                    alt={product.name}
                                    className="w-16 h-16 object-cover rounded-md"
                                  />
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-md font-semibold text-white">{product.type}</h3>
                                <h4 className="text-lg font-semibold text-white">{product.name}</h4>
                                <p className="text-sm text-gray-300">{product.description}</p>
                                <p className="text-sm font-medium text-green-400">Price: ₹{product.price}</p>
                                <p className="text-sm text-gray-400">Category: {product.category}</p>
                              </div>
                              <div className="space-x-2">
                                <button
                                  onClick={() => {
                                    const formattedDate = product.dateAdded.split("T")[0];
                                    const processedImage = Array.isArray(product.image)
                                      ? product.image.map((img) =>
                                        img.includes("uploads")
                                          ? `http://localhost:5000/uploads/${img.split("\\").pop()}`
                                          : img // Retain valid URLs
                                      )
                                      : [];

                                    console.log("Product Object: ", product);

                                    setFormData({
                                      id: product._id,
                                      name: product.name,
                                      price: product.price,
                                      image: product.image,
                                      originalPrice: product.originalPrice,
                                      brand: product.brand,
                                      category: product.category,
                                      description: product.description,
                                      stock: product.stock,
                                      code: product.code,
                                      discount: product.discount,
                                      bonuses: product.bonuses,
                                      dateAdded: formattedDate,
                                      popularity: product.popularity,
                                      otherTechnicalDetails: product.otherTechnicalDetails,
                                      notes: product.notes,
                                      condition: product.condition,
                                      cpu: product.specs.cpu,
                                      graphiccard: product.specs.graphiccard,
                                      platform: product.specs.platform,
                                      motherboard: product.specs.motherboard,
                                      ramOptions: Array.isArray(product.specs.ramOptions) ? product.specs.ramOptions : [],
                                      storage1Options: Array.isArray(product.specs.storage1Options) ? product.specs.storage1Options : [],
                                      storage2Options: Array.isArray(product.specs.storage2Options) ? product.specs.storage2Options : [],
                                      liquidcooler: product.specs.liquidcooler,
                                      smps: product.specs.smps,
                                      cabinet: product.specs.cabinet,
                                      type: 'Pre-Built PC',
                                    })
                                    setImagePreview(processedImage);
                                    setIsEditing(true)
                                  }}
                                  className="py-1 px-3 bg-indigo-500 text-gray-900 rounded-md hover:bg-indigo-600 transition"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(product._id, 'prebuild')}
                                  className="py-1 px-3 bg-red-500 text-gray-900 rounded-md hover:bg-red-600 transition"
                                >
                                  Delete
                                </button>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </>
                  ) : (
                    <p className="text-gray-400">No products available.</p>
                  )}
                </div>

                {/* Display Product Details in Large Format */}
                {selectedProduct && selectedProduct.specs && (
                  <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-md max-w-4xl w-full">
                      <button
                        onClick={() => setSelectedProduct(null)}
                        className="text-red-500 font-bold absolute top-4 right-4"
                      >
                        Close
                      </button>
                      <div className="flex flex-col md:flex-row">
                        <div className="flex-shrink-0">
                          {selectedProduct.image && selectedProduct.image.length > 0 && (
                            <img
                              src={`http://localhost:5000/uploads/${selectedProduct.image[0].split('\\').pop()}`}
                              alt={selectedProduct.name}
                              className="w-48 h-48 object-cover rounded-md"
                            />
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-2xl font-semibold text-gray-900">{selectedProduct.name}</h3>
                          <p className="text-lg text-gray-700">{selectedProduct.description}</p>
                          <p className="text-xl font-medium text-green-500">Price: ₹{selectedProduct.price}</p>
                          <p className="text-md text-gray-600">Category: {selectedProduct.category}</p>
                          <p className="text-md text-gray-600">Brand: {selectedProduct.brand}</p>
                          <p className="text-md text-gray-600">Stock: {selectedProduct.stock}</p>
                          <p className="text-md text-gray-600">Code: {selectedProduct.code}</p>
                          <p className="text-md text-gray-600">Discount: {selectedProduct.discount}%</p>
                          <p className="text-md text-gray-600">Condition: {selectedProduct.condition}</p>

                          {/* Additional Technical Details */}
                          <div className="mt-4">
                            <h4 className="text-lg font-semibold text-gray-800">Technical Details:</h4>
                            <ul className="space-y-2">
                              {selectedProduct.specs.cpu && <li><strong>CPU:</strong> {selectedProduct.specs.cpu}</li>}
                              {selectedProduct.specs.graphiccard && <li><strong>Graphics Card:</strong> {selectedProduct.specs.graphiccard}</li>}
                              {selectedProduct.specs.platform && <li><strong>Platform:</strong> {selectedProduct.specs.platform}</li>}
                              {selectedProduct.specs.motherboard && <li><strong>Motherboard:</strong> {selectedProduct.specs.motherboard}</li>}
                              {selectedProduct.specs.ramOptions && selectedProduct.specs.ramOptions.length > 0 && (
                                <li><strong>RAM Options:</strong> {selectedProduct.specs.ramOptions.join(', ')}</li>
                              )}
                              {selectedProduct.specs.storage1Options && selectedProduct.specs.storage1Options.length > 0 && (
                                <li><strong>Storage Options:</strong> {selectedProduct.specs.storage1Options.join(', ')}</li>
                              )}
                              {selectedProduct.specs.storage2Options && selectedProduct.specs.storage2Options.length > 0 && (
                                <li><strong>Secondary Storage:</strong> {selectedProduct.specs.storage2Options.join(', ')}</li>
                              )}
                              {selectedProduct.specs.liquidcooler && <li><strong>Liquid Cooler:</strong> {selectedProduct.specs.liquidcooler}</li>}
                              {selectedProduct.specs.smps && <li><strong>SMPS:</strong> {selectedProduct.specs.smps}</li>}
                              {selectedProduct.specs.cabinet && <li><strong>Cabinet:</strong> {selectedProduct.specs.cabinet}</li>}
                            </ul>
                          </div>

                          {/* Other Information */}
                          {selectedProduct.otherTechnicalDetails && (
                            <div className="mt-4">
                              <h4 className="text-lg font-semibold text-gray-800">Other Technical Details:</h4>
                              <p className="text-gray-600">{selectedProduct.otherTechnicalDetails}</p>
                            </div>
                          )}

                          {/* Notes Section */}
                          {selectedProduct.notes && (
                            <div className="mt-4">
                              <h4 className="text-lg font-semibold text-gray-800">Notes:</h4>
                              <p className="text-gray-600">{selectedProduct.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Product List for Refurbished Laptops */}
                <div className="bg-gray-800 p-6 rounded-md shadow-lg w-full max-w-full md:max-w-lg">
                  <h3 className="text-xl font-medium mb-4">Refurbished Laptops</h3>
                  {Array.isArray(filteredRefurbishedLaptops) && filteredRefurbishedLaptops.length > 0 ? (
                    <>
                      {/* Show total number of products */}
                      <p className="text-gray-300 mb-4">Total Products: {products.filter((product) => product.type === "Refurbished Laptop").length}</p>
                      <ul className="space-y-4" style={{ maxHeight: 'calc(3 * 10rem)', overflowY: 'auto' }}>
                        {filteredRefurbishedLaptops.filter((product) => product.type === "Refurbished Laptop")
                          .map((product) => (
                            <li
                              key={product._id}
                              className="p-4 bg-gray-700 rounded-md flex flex-col md:flex-row justify-between items-center space-x-0 md:space-x-4 space-y-4 md:space-y-0"
                            >
                              <div className="flex-shrink-0">
                                {product.image && Array.isArray(product.image) && product.image.length > 0 && (
                                  <img
                                    src={`http://localhost:5000/uploads/${product.image[0].split('\\').pop()}`}
                                    alt={product.name}
                                    className="w-16 h-16 object-cover rounded-md"
                                  />
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-md font-semibold text-white">{product.type}</h3>
                                <h4 className="text-lg font-semibold text-white">{product.name}</h4>
                                <p className="text-sm text-gray-300">{product.description}</p>
                                <p className="text-sm font-medium text-green-400">Price: ₹{product.price}</p>
                                <p className="text-sm text-gray-400">Category: {product.category}</p>
                              </div>
                              <div className="space-x-2">
                                <button
                                  onClick={() => {
                                    const formattedDate = product.dateAdded.split("T")[0];
                                    const processedImage = Array.isArray(product.image)
                                      ? product.image.map((img) =>
                                        img.includes("uploads")
                                          ? `http://localhost:5000/uploads/${img.split("\\").pop()}`
                                          : img // Retain valid URLs
                                      )
                                      : [];

                                    setFormData({
                                      id: product._id,
                                      name: product.name,
                                      price: product.price,
                                      image: product.image,
                                      originalPrice: product.originalPrice,
                                      brand: product.brand,
                                      category: product.category,
                                      description: product.description,
                                      stock: product.stock,
                                      code: product.code,
                                      discount: product.discount,
                                      bonuses: product.bonuses,
                                      dateAdded: formattedDate,
                                      popularity: product.popularity,
                                      otherTechnicalDetails: product.otherTechnicalDetails,
                                      notes: product.notes,
                                      condition: product.condition,
                                      cpu: product.specs.cpu,
                                      graphiccard: product.specs.GraphicCard,
                                      ram: product.specs.ram,
                                      storage: product.specs.storage,
                                      display: product.specs.display,
                                      os: product.specs.os,
                                      type: 'Refurbished Laptop',
                                    })
                                    setImagePreview(processedImage)
                                    setIsEditing(true)
                                  }}
                                  className="py-1 px-3 bg-indigo-500 text-gray-900 rounded-md hover:bg-indigo-600 transition"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(product._id, 'refurbished')}
                                  className="py-1 px-3 bg-red-500 text-gray-900 rounded-md hover:bg-red-600 transition"
                                >
                                  Delete
                                </button>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </>
                  ) : (
                    <p className="text-gray-400">No products available.</p>
                  )}
                </div>

                {/* Product List for Mini PC */}
                <div className="bg-gray-800 p-6 rounded-md shadow-lg w-full max-w-full md:max-w-lg">
                  <h3 className="text-xl font-medium mb-4">Mini PCs</h3>
                  {Array.isArray(filteredMiniPCs) && filteredMiniPCs.length > 0 ? (
                    <>
                      {/* Show total number of products */}
                      <p className="text-gray-300 mb-4">Total Products: {products.filter((product) => product.type === "Mini PC").length}</p>
                      <ul className="space-y-4" style={{ maxHeight: 'calc(3 * 10rem)', overflowY: 'auto' }}>
                        {filteredMiniPCs.filter((product) => product.type === "Mini PC")
                          .map((product) => (
                            <li
                              key={product._id}
                              className="p-4 bg-gray-700 rounded-md flex flex-col md:flex-row justify-between items-center space-x-0 md:space-x-4 space-y-4 md:space-y-0"
                            >
                              <div className="flex-shrink-0">
                                {product.image && Array.isArray(product.image) && product.image.length > 0 && (
                                  <img
                                    src={`http://localhost:5000/uploads/${product.image[0].split('\\').pop()}`}
                                    alt={product.name}
                                    className="w-16 h-16 object-cover rounded-md"
                                  />
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-md font-semibold text-white">{product.type}</h3>
                                <h4 className="text-lg font-semibold text-white">{product.name}</h4>
                                <p className="text-sm text-gray-300">{product.description}</p>
                                <p className="text-sm font-medium text-green-400">Price: ₹{product.price}</p>
                                <p className="text-sm text-gray-400">Category: {product.category}</p>
                              </div>
                              <div className="space-x-2">
                                <button
                                  onClick={() => {
                                    const formattedDate = product.dateAdded.split("T")[0];
                                    const processedImage = Array.isArray(product.image)
                                      ? product.image.map((img) =>
                                        img.includes("uploads")
                                          ? `http://localhost:5000/uploads/${img.split("\\").pop()}`
                                          : img // Retain valid URLs
                                      )
                                      : [];

                                    console.log("Product Object: ", product);

                                    setFormData({
                                      id: product._id,
                                      name: product.name,
                                      price: product.price,
                                      image: product.image,
                                      originalPrice: product.originalPrice,
                                      brand: product.brand,
                                      category: product.category,
                                      description: product.description,
                                      stock: product.stock,
                                      code: product.code,
                                      discount: product.discount,
                                      bonuses: product.bonuses,
                                      dateAdded: formattedDate,
                                      popularity: product.popularity,
                                      otherTechnicalDetails: product.otherTechnicalDetails,
                                      notes: product.notes,
                                      condition: product.condition,
                                      cpu: product.specs.cpu,
                                      graphiccard: product.specs.graphiccard,
                                      platform: product.specs.platform,
                                      motherboard: product.specs.motherboard,
                                      ramOptions: Array.isArray(product.specs.ramOptions) ? product.specs.ramOptions : [],
                                      storage1Options: Array.isArray(product.specs.storage1Options) ? product.specs.storage1Options : [],
                                      smps: product.specs.smps,
                                      cabinet: product.specs.cabinet,
                                      type: 'Mini PC',
                                    })
                                    setImagePreview(processedImage);
                                    setIsEditing(true)
                                  }}
                                  className="py-1 px-3 bg-indigo-500 text-gray-900 rounded-md hover:bg-indigo-600 transition"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(product._id, 'prebuild')}
                                  className="py-1 px-3 bg-red-500 text-gray-900 rounded-md hover:bg-red-600 transition"
                                >
                                  Delete
                                </button>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </>
                  ) : (
                    <p className="text-gray-400">No products available.</p>
                  )}
                </div>

                {/* Add/Edit Product Form */}
                <div className="relative bg-gray-700 p-6 rounded-md shadow-md w-auto md:w-1/3">
                  {!isEditing && (
                    <button
                      onClick={() => {
                        setIsEditing(true) // Reset form for adding new product
                        setFormData({  // Clear the form data when adding a new product
                          id: null,
                          type: "",
                          name: "",
                          price: "",
                          category: "",
                          description: "",
                          image: null,
                          ramOptions: [{ value: "", price: "" }],
                          storage1Options: [{ value: "", price: "" }],
                          storage2Options: [{ value: "", price: "" }],
                          otherTechnicalDetails: [{ name: "", value: "" }],
                          notes: [""],
                        });
                      }}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white p-4 rounded-full flex justify-center items-center text-3xl font-bold hover:bg-indigo-600 transition"
                    >
                      +
                    </button>
                  )}

                  {isEditing && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
                      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full flex flex-col justify-between h-[90vh]">
                        <h3 className="text-xl font-medium mb-4">{formData.id ? "Edit Product" : "Add Product"}</h3>
                        {/* Cancel Button */}
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)} // Cancel the editing process
                          className="py-2 px-4 mb-4 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition"
                        >
                          Cancel
                        </button>
                        <form onSubmit={handleProductSubmit} encType="multipart/form-data" className="flex-grow flex flex-col space-y-4 overflow-y-auto">
                          {/* Product Type Dropdown */}
                          <div>
                            <label className="block text-sm mb-1">Product Type</label>
                            <select
                              name="type"
                              value={formData.type || ""}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                              required
                            >
                              <option value="" disabled>Select Product Type</option>
                              <option value="Pre-Built PC">Pre-Built PC</option>
                              <option value="Refurbished Laptop">Refurbished Laptop</option>
                              <option value="Mini PC">Mini PC</option>
                            </select>
                          </div>

                          {/* Product Name */}
                          <div>
                            <label className="block text-sm mb-1">Product Name</label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name || ""}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                              required
                            />
                          </div>

                          {/* Product Image */}
                          <div>
                            <label className="block text-sm mb-1">Product Image</label>
                            <input
                              type="file"
                              name="image"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                              multiple
                            />
                            {imagePreview && imagePreview.length > 0 && (
                              <div className="mt-4 flex flex-wrap">
                                {imagePreview.map((preview, index) => (
                                  <div key={index} className="relative mb-1 mr-2">
                                    {/* Cancel button */}
                                    <button
                                      type="button"
                                      onClick={() => handleImageRemove(index)} // Remove the image
                                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                                    >
                                      X
                                    </button>
                                    <img
                                      key={index}
                                      src={preview}
                                      alt={`Preview ${index + 1}`}
                                      className="max-w-xs max-h-32 mr-2 mb-1"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Price */}
                          <div>
                            <label className="block text-sm mb-1">Price</label>
                            <input
                              type="number"
                              name="price"
                              value={formData.price || ""}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                              required
                            />
                          </div>

                          {/* original price */}
                          <div>
                            <label className="block text-sm mb-1 text-white">Original Price</label>
                            <input
                              type="number"
                              name="originalPrice"
                              value={formData.originalPrice || ""}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                            />
                          </div>

                          {/* brand */}
                          <div>
                            <label className="block text-sm mb-1">Brand</label>
                            <input
                              type="text"
                              name="brand"
                              value={formData.brand || ""}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                            />
                          </div>

                          {/* Category */}
                          <div>
                            <label className="block text-sm mb-1">Category</label>
                            <input
                              type="text"
                              name="category"
                              value={formData.category || ""}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                            />
                          </div>

                          {/* Description */}
                          <div>
                            <label className="block text-sm mb-1">Description</label>
                            <textarea
                              name="description"
                              value={formData.description || ""}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                            />
                          </div>

                          {/* stock */}
                          <div>
                            <label className="block text-sm mb-1">Stock</label>
                            <div className="flex items-center space-x-4">
                              <div>
                                <label htmlFor="stockYes" className="mr-2 text-sm">Yes</label>
                                <input
                                  type="radio"
                                  id="stockYes"
                                  name="stock"
                                  value="yes"
                                  checked={formData.stock === "yes"}
                                  onChange={handleFormChange}
                                  className="text-indigo-400"
                                />
                              </div>
                              <div>
                                <label htmlFor="stockNo" className="mr-2 text-sm">No</label>
                                <input
                                  type="radio"
                                  id="stockNo"
                                  name="stock"
                                  value="no"
                                  checked={formData.stock === "no"}
                                  onChange={handleFormChange}
                                  className="text-indigo-400"
                                />
                              </div>
                            </div>
                          </div>

                          {/* code */}
                          <div>
                            <label className="block text-sm mb-1 text-white">Code</label>
                            <input
                              type="text"
                              name="code"
                              value={formData.code || ""}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                            />
                          </div>

                          {/* discount */}
                          <div>
                            <label className="block text-sm mb-1 text-white">Discount</label>
                            <input
                              type="number"
                              name="discount"
                              value={formData.discount || ""}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                            />
                          </div>

                          {/* bonuses */}
                          <div>
                            <label className="block text-sm mb-1 text-white">Bonuses</label>
                            <textarea
                              name="bonuses"
                              placeholder="e.g., free accessories, extended warranty"
                              value={formData.bonuses || ""}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                            />
                          </div>

                          {/* date added */}
                          <div>
                            <label className="block text-sm mb-1">Product Date</label>
                            <input
                              type="date"
                              name="dateAdded"
                              value={formData.dateAdded || ""}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                            />
                          </div>

                          {/* popularity */}
                          <div>
                            <label className="block text-sm mb-1">Popularity</label>
                            <input
                              type="number"
                              name="popularity"
                              value={formData.popularity || ""}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                            />
                          </div>

                          {/* Condition */}
                          <div>
                            <label className="block text-sm mb-1">Condition</label>
                            <input
                              type="text"
                              name="condition"
                              value={formData.condition || ""}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                            />
                          </div>

                          {/* cpu */}
                          <div>
                            <label className="block text-sm mb-1">CPU</label>
                            <input
                              type="text"
                              name="cpu"
                              placeholder="e.g., Intel i5, Ryzen 7"
                              value={formData.cpu || ""}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                            />
                          </div>

                          {/* graphic card */}
                          <div>
                            <label className="block text-sm mb-1">Graphic Card</label>
                            <input
                              type="text"
                              name="graphiccard"
                              placeholder="e.g., Arc A380 - Intel 6GB"
                              value={formData.graphiccard || ""}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                            />
                          </div>

                          {/* Additional Fields for Mini PC */}
                          {formData.type === "Mini PC" && (
                            <>
                              {/* RAM Configurations */}
                              <div>
                                <h3 className="text-lg font-semibold mb-4">RAM Configurations</h3>
                                {(formData.ramOptions || []).map((ram, index) => (
                                  <div key={index} className="grid grid-cols-2 gap-4 items-center mb-6">
                                    <div>
                                      <label className="block text-sm font-medium mb-1">RAM</label>
                                      <input
                                        type="text"
                                        name="value"
                                        placeholder="e.g., 8GB, 16GB"
                                        value={ram.value || ""}
                                        onChange={(e) => handleDynamicChange(e, index, "ramOptions")}
                                        className="w-full px-4 py-2 bg-gray-700 text-indigo-400 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Price</label>
                                      <input
                                        type="number"
                                        name={`ramPrice_${index}`}
                                        placeholder="e.g., 15000"
                                        value={ram.price || ""}
                                        onChange={(e) => handleDynamicChange(e, index, "ramOptions")}
                                        className="w-full px-4 py-2 bg-gray-700 text-indigo-400 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                      />
                                    </div>
                                    <div>
                                      <button
                                        type="button"
                                        onClick={() => removeField("ramOptions", index)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addField("ramOptions")}
                                  className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                                >
                                  Add RAM Option
                                </button>
                              </div>

                              {/* platform */}
                              <div>
                                <label className="block text-sm mb-1">PlatForm</label>
                                <input
                                  type="text"
                                  name="platform"
                                  placeholder="e.g., AMD, Intel"
                                  value={formData.platform || ""}
                                  onChange={handleFormChange}
                                  className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                                />
                              </div>

                              {/* mother board */}
                              <div>
                                <label className="block text-sm mb-1">Motherboard</label>
                                <input
                                  type="text"
                                  name="motherboard"
                                  placeholder="e.g., MSI B450 Tomahawk"
                                  value={formData.motherboard || ""}
                                  onChange={handleFormChange}
                                  className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                                />
                              </div>

                              {/* storage1 */}
                              <div>
                                <h3 className="text-lg font-semibold mb-2">Storage1 Configurations</h3>
                                {formData.storage1Options?.map((storage, index) => (
                                  <div key={index} className="grid grid-cols-2 gap-4 items-center mb-4">
                                    <div>
                                      <label className="block text-sm mb-1">Storage1</label>
                                      <input
                                        type="text"
                                        name={`storage1_${index}`}
                                        placeholder="e.g., 512GB SSD, 1TB HDD"
                                        value={storage.value || ""}
                                        onChange={(e) => handleDynamicChange(e, index, "storage1Options")}
                                        className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm mb-1">Price</label>
                                      <input
                                        type="number"
                                        name={`storage1Price_${index}`}
                                        placeholder="e.g., 15000"
                                        value={storage.price || ""}
                                        onChange={(e) => handleDynamicChange(e, index, "storage1Options")}
                                        className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                                      />
                                    </div>
                                    <div>
                                      <button
                                        type="button"
                                        onClick={() => removeField("storage1Options", index)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addField("storage1Options")}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                                >
                                  Add Storage 1 Option
                                </button>
                              </div>

                              {/* smps */}
                              <div>
                                <label className="block text-sm mb-1">SMPS</label>
                                <input
                                  type="text"
                                  name="smps"
                                  placeholder="e.g., Deepcool - PK450D Bronze"
                                  value={formData.smps || ""}
                                  onChange={handleFormChange}
                                  className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                                />
                              </div>

                              {/* cabinet */}
                              <div>
                                <label className="block text-sm mb-1">Cabinet</label>
                                <input
                                  type="text"
                                  name="cabinet"
                                  placeholder="e.g., NZXT H510"
                                  value={formData.cabinet || ""}
                                  onChange={handleFormChange}
                                  className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                                />
                              </div>
                            </>
                          )}

                          {/* Additional Fields for Refurbished Laptop */}
                          {formData.type === "Refurbished Laptop" && (
                            <>

                              {/* ram */}
                              <div>
                                <label className="block text-sm mb-1">RAM</label>
                                <input
                                  type="text"
                                  name="ram"
                                  placeholder="e.g., 8GB, 16GB"
                                  value={formData.ram || ""}
                                  onChange={handleFormChange}
                                  className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                                />
                              </div>

                              {/* storage */}
                              <div>
                                <label className="block text-sm mb-1">Storage</label>
                                <input
                                  type="text"
                                  name="storage"
                                  placeholder="e.g., 256GB SSD, 1TB HDD"
                                  value={formData.storage || ""}
                                  onChange={handleFormChange}
                                  className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                                />
                              </div>

                              {/* display */}
                              <div>
                                <label className="block text-sm mb-1">Display</label>
                                <input
                                  type="text"
                                  name="display"
                                  placeholder="e.g., 15.6-inch FHD"
                                  value={formData.display || ""}
                                  onChange={handleFormChange}
                                  className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                                />
                              </div>

                              {/* os */}
                              <div>
                                <label className="block text-sm mb-1">Operating System</label>
                                <input
                                  type="text"
                                  name="os"
                                  placeholder="e.g., Windows 10, Linux"
                                  value={formData.os || ""}
                                  onChange={handleFormChange}
                                  className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                                />
                              </div>
                            </>
                          )}

                          {/* Conditional Fields for Pre-Built PC */}
                          {formData.type === "Pre-Built PC" && (
                            <>

                              {/* RAM Configurations */}
                              <div>
                                <h3 className="text-lg font-semibold mb-4">RAM Configurations</h3>
                                {(formData.ramOptions || []).map((ram, index) => (
                                  <div key={index} className="grid grid-cols-2 gap-4 items-center mb-6">
                                    <div>
                                      <label className="block text-sm font-medium mb-1">RAM</label>
                                      <input
                                        type="text"
                                        name="value"
                                        placeholder="e.g., 8GB, 16GB"
                                        value={ram.value || ""}
                                        onChange={(e) => handleDynamicChange(e, index, "ramOptions")}
                                        className="w-full px-4 py-2 bg-gray-700 text-indigo-400 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Price</label>
                                      <input
                                        type="number"
                                        name={`ramPrice_${index}`}
                                        placeholder="e.g., 15000"
                                        value={ram.price || ""}
                                        onChange={(e) => handleDynamicChange(e, index, "ramOptions")}
                                        className="w-full px-4 py-2 bg-gray-700 text-indigo-400 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                      />
                                    </div>
                                    <div>
                                      <button
                                        type="button"
                                        onClick={() => removeField("ramOptions", index)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addField("ramOptions")}
                                  className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                                >
                                  Add RAM Option
                                </button>
                              </div>

                              {/* platform */}
                              <div>
                                <label className="block text-sm mb-1">PlatForm</label>
                                <input
                                  type="text"
                                  name="platform"
                                  placeholder="e.g., AMD, Intel"
                                  value={formData.platform || ""}
                                  onChange={handleFormChange}
                                  className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                                />
                              </div>

                              {/* mother board */}
                              <div>
                                <label className="block text-sm mb-1">Motherboard</label>
                                <input
                                  type="text"
                                  name="motherboard"
                                  placeholder="e.g., MSI B450 Tomahawk"
                                  value={formData.motherboard || ""}
                                  onChange={handleFormChange}
                                  className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                                />
                              </div>

                              {/* storage1 */}
                              <div>
                                <h3 className="text-lg font-semibold mb-2">Storage1 Configurations</h3>
                                {formData.storage1Options?.map((storage, index) => (
                                  <div key={index} className="grid grid-cols-2 gap-4 items-center mb-4">
                                    <div>
                                      <label className="block text-sm mb-1">Storage1</label>
                                      <input
                                        type="text"
                                        name={`storage1_${index}`}
                                        placeholder="e.g., 512GB SSD, 1TB HDD"
                                        value={storage.value || ""}
                                        onChange={(e) => handleDynamicChange(e, index, "storage1Options")}
                                        className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm mb-1">Price</label>
                                      <input
                                        type="number"
                                        name={`storage1Price_${index}`}
                                        placeholder="e.g., 15000"
                                        value={storage.price || ""}
                                        onChange={(e) => handleDynamicChange(e, index, "storage1Options")}
                                        className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                                      />
                                    </div>
                                    <div>
                                      <button
                                        type="button"
                                        onClick={() => removeField("storage1Options", index)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addField("storage1Options")}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                                >
                                  Add Storage 1 Option
                                </button>
                              </div>

                              {/* storage2 */}
                              <div>
                                <h3 className="text-lg font-semibold mb-2">Storage2 Configurations</h3>
                                {formData.storage2Options?.map((storage, index) => (
                                  <div key={index} className="grid grid-cols-2 gap-4 items-center mb-4">
                                    <div>
                                      <label className="block text-sm mb-1">Storage2</label>
                                      <input
                                        type="text"
                                        name={`storage2_${index}`}
                                        placeholder="e.g., 512GB SSD, 1TB HDD"
                                        value={storage.value || ""}
                                        onChange={(e) => handleDynamicChange(e, index, "storage2Options")}
                                        className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm mb-1">Price</label>
                                      <input
                                        type="number"
                                        name={`storage2Price_${index}`}
                                        placeholder="e.g., 15000"
                                        value={storage.price || ""}
                                        onChange={(e) => handleDynamicChange(e, index, "storage2Options")}
                                        className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                                      />
                                    </div>
                                    <div>
                                      <button
                                        type="button"
                                        onClick={() => removeField("storage2Options", index)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addField("storage2Options")}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                                >
                                  Add Storage 2 Option
                                </button>
                              </div>

                              {/* liquid cooler */}
                              <div>
                                <label className="block text-sm mb-1">Liquid Cooler</label>
                                <input
                                  type="text"
                                  name="liquidcooler"
                                  placeholder="e.g., Cooler Master Hyper 212"
                                  value={formData.liquidcooler || ""}
                                  onChange={handleFormChange}
                                  className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                                />
                              </div>

                              {/* smps */}
                              <div>
                                <label className="block text-sm mb-1">SMPS</label>
                                <input
                                  type="text"
                                  name="smps"
                                  placeholder="e.g., Deepcool - PK450D Bronze"
                                  value={formData.smps || ""}
                                  onChange={handleFormChange}
                                  className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                                />
                              </div>

                              {/* cabinet */}
                              <div>
                                <label className="block text-sm mb-1">Cabinet</label>
                                <input
                                  type="text"
                                  name="cabinet"
                                  placeholder="e.g., NZXT H510"
                                  value={formData.cabinet || ""}
                                  onChange={handleFormChange}
                                  className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                                />
                              </div>
                            </>
                          )}

                          {/* Other Technical Details Input Section */}
                          <div className="mt-4">
                            <h3 className="text-lg font-semibold text-indigo-400">Other Technical Details</h3>
                            {formData.otherTechnicalDetails && formData.otherTechnicalDetails.length > 0
                              ? formData.otherTechnicalDetails.map((detail, index) => (
                                <div key={index} className="flex items-center gap-4 mb-2">
                                  <input
                                    type="text"
                                    name="name"
                                    placeholder="Detail Name (e.g., WIFI)"
                                    value={detail.name}
                                    onChange={(e) => handleOtherTechnicalDetailsChange(index, "name", e.target.value)}
                                    className="w-1/2 px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                                  />
                                  <input
                                    type="text"
                                    name="value"
                                    placeholder="Detail Value (e.g., 802.11ax Wi-Fi 6)"
                                    value={detail.value}
                                    onChange={(e) => handleOtherTechnicalDetailsChange(index, "value", e.target.value)}
                                    className="w-1/2 px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeOtherTechnicalDetail(index)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))
                              : null}
                            <button
                              type="button"
                              onClick={addOtherTechnicalDetail}
                              className="px-4 py-2 mt-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600"
                            >
                              Add Detail
                            </button>
                          </div>

                          {/* Notes Input Section */}
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold text-indigo-400">Notes</h3>
                            {formData.notes && formData.notes.length > 0 ? (
                              formData.notes.map((note, index) => (
                                <div key={index} className="flex items-center gap-4 mb-2">
                                  <textarea
                                    name="note"
                                    placeholder="Note"
                                    value={note}
                                    onChange={(e) => handleNotesChange(index, e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 text-indigo-400 rounded-md"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeNote(index)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))
                            ) : (
                              <p>No notes available</p> // Optional fallback if there are no notes
                            )}

                            <button
                              type="button"
                              onClick={addNote}
                              className="px-4 py-2 mt-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600"
                            >
                              Add Note
                            </button>
                          </div>

                          {/* Submit Button */}
                          <button
                            type="submit"
                            className="py-2 px-4 bg-indigo-500 text-gray-900 font-semibold rounded-md hover:bg-indigo-600 transition"
                          >
                            {formData.id ? "Update Product" : "Create Product"}
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Subscribe sction */}
            <section className="mb-6">
              <div className="mx-auto bg-gray-800 shadow-md rounded-lg p-6">
                <h1 className="text-2xl font-bold mb-6 text-2x1">
                  Subscribers <span className="text-2x1">({subscribers.length})</span>
                </h1>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="border border-gray-300 p-3 text-left text-2x1">Email</th>
                        <th className="border border-gray-300 p-3 text-left text-2x1">Subscribed At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.length > 0 ? (
                        subscribers.map((subscriber) => (
                          <tr key={subscriber._id} className="hover:bg-gray-950">
                            <td className="border border-gray-300 text-white p-3">{subscriber.email}</td>
                            <td className="border border-gray-300 text-white p-3">
                              {new Date(subscriber.subscribedAt).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="2"
                            className="border border-gray-300 p-3 text-center text-gray-500"
                          >
                            No subscribers found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Message Sender */}
                <div>
                  <h2 className="text-xl font-bold mb-4">Send a Message</h2>
                  <form onSubmit={handleSendMessage} className="space-y-4">
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="Recipient Email (comma-separated for multiple)"
                      className="w-full p-3 border border-gray-300 rounded-md"
                      required
                    />
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Subject"
                      className="w-full p-3 border border-gray-300 rounded-md"
                      required
                    />
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Message"
                      className="w-full p-3 border border-gray-300 rounded-md"
                      rows="5"
                      required
                    ></textarea>
                    <button className="bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600">
                      Send Message
                    </button>
                  </form>
                </div>

                {/* Message History */}
                <div className="border border-gray-300 rounded-md shadow-md">
                  {/* Header with Collapse/Expand Toggle */}
                  <div
                    className="flex items-center justify-between p-4 bg-gray-100 cursor-pointer"
                    onClick={toggleHistory}
                  >
                    <h2 className="text-xl font-bold">Message History</h2>
                    <span>
                      {isCollapsed ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 15.75L12 8.25l-7.5 7.5"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 9.75L12 13.25l3.75-3.5"
                          />
                        </svg>
                      )}
                    </span>
                  </div>

                  {/* Collapsible Content */}
                  {!isCollapsed && (
                    <div className="p-4 space-y-4">
                      {messageHistory.map((msg) => (
                        <div
                          key={msg._id}
                          className="p-4 border border-gray-300 rounded-md shadow-sm"
                        >
                          <h3 className="font-bold">{msg.subject}</h3>
                          <p>{msg.message}</p>
                          <p className="text-sm text-gray-500">
                            Sent At: {new Date(msg.sentAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Device Information Section */}
            <section className="my-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold mb-4">
                  Device Information{" "}
                  <span className="text-sm text-gray-500">({deviceInfo.length} entries)</span>
                </h3>
                {/* Arrow for toggle */}
                <button onClick={toggleBox} className="text-gray-500">
                  {isOpen ? <FaArrowUp /> : <FaArrowDown />}
                </button>
              </div>

              {/* Device Info Box */}
              {isOpen && (
                <ul className="space-y-4">
                  {deviceInfo.length > 0 ? (
                    deviceInfo.map((info, index) => (
                      <li
                        key={index}
                        className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                      >
                        <p className="text-lg text-gray-700">
                          User Agent: <span className="font-medium">{info.userAgent}</span>
                        </p>
                        <p className="text-lg text-gray-700">
                          Platform: <span className="font-medium">{info.platform}</span>
                        </p>
                        <p className="text-lg text-gray-700">
                          Screen Resolution:{" "}
                          <span className="font-medium">
                            {info.screenResolution.width}x{info.screenResolution.height}
                          </span>
                        </p>
                        <p className="text-lg text-gray-700">
                          Created At:{" "}
                          <span className="font-medium">
                            {new Date(info.createdAt).toLocaleString()}
                          </span>
                        </p>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500">No device information available.</p>
                  )}
                </ul>
              )}
            </section>

            {/* Location Information Section */}
            <section className="my-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold mb-4">
                  Location Information{" "}
                  <span className="text-sm text-gray-500">({locationInfo.length} entries)</span>
                </h3>
                {/* Arrow for toggle */}
                <button onClick={toggleBox1} className="text-gray-500">
                  {isOpenforLocation ? <FaArrowUp /> : <FaArrowDown />}
                </button>
              </div>

              {/* Location Info Box */}
              {isOpenforLocation && (
                <ul className="space-y-4">
                  {locationInfo.length > 0 ? (
                    locationInfo.map((info, index) => (
                      <li
                        key={index}
                        className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                      >
                        <p className="text-lg text-gray-700">
                          Latitude: <span className="font-medium">{info.latitude}</span>
                        </p>
                        <p className="text-lg text-gray-700">
                          Longitude: <span className="font-medium">{info.longitude}</span>
                        </p>
                        <p className="text-lg text-gray-700">
                          Created At:{" "}
                          <span className="font-medium">
                            {new Date(info.createdAt).toLocaleString()}
                          </span>
                        </p>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500">No location information available.</p>
                  )}
                </ul>
              )}
            </section>

            {/* Login History Section */}
            <section className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">Login History</h2>
              {loginHistory.length > 0 ? (
                <div className="space-y-4">
                  {loginHistory.map((event, index) => (
                    <div key={index} className="p-4 bg-gray-800 rounded-md shadow-md">
                      <p className="text-lg font-medium">{event.username}</p>
                      <p className="text-sm text-gray-400">{event.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-red-500">No login history available.</p>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;