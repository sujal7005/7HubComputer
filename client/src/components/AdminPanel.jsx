import React, { useState, useEffect, useRef } from "react";
import { 
  FaArrowDown, 
  FaArrowUp, 
  FaBars, 
  FaTimes, 
  FaHome, 
  FaShoppingCart, 
  FaUsers, 
  FaTags, 
  FaBox, 
  FaEnvelope, 
  FaInfoCircle, 
  FaHistory, 
  FaSignOutAlt, 
  FaChartBar, 
  FaEye, 
  FaEyeSlash,
  FaMicrochip, // Add this
  FaTv,
  FaCog,
  FaStar,
  FaImages, 
  FaVideo
} from 'react-icons/fa';
import { io } from "socket.io-client";
import DashboardGraphs from "./DashboardGraphs";
import DiscountCode from './DiscountCode';
import ManageAccessories from "./ManageAccessories";

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', phoneNumber: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(Number(localStorage.getItem("countdown")) || 10800);
  const timeoutRef = useRef(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [socket, setSocket] = useState(null);
  const [position, setPosition] = useState({ x: 6, y: 115 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [recipient, setRecipient] = useState("");
  const [formData, setFormData] = useState({
    id: "",
    type: "",
    name: '',
    price: '',
    category: '',
    description: '',
    image: null,
    popularity: 0,
    ram: '',
    storage: '',
    ramOptions: [{ value: "", price: "" }],
    storage1Options: [{ value: "", price: "" }],
    storage2Options: [{ value: "", price: "" }],
    otherTechnicalDetails: [{ name: "", value: "" }],
    notes: [""],
    keyFeatures: [{ title: "", description: "" }],
    specifications: [{ title: "", specs: [{ name: "", value: "" }] }],
    additionalImages: [],
    videos: [{ title: "", url: "" }],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
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
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  // New state for displays
  const [displays, setDisplays] = useState([]);
  const [displayFormData, setDisplayFormData] = useState({
    id: "",
    name: "",
    category: "gaming",
    description: "",
    price: "",
    originalPrice: "",
    image: null,
    images: [],
    brand: "",
    specs: {
      size: "",
      resolution: "",
      panel: "",
      refreshRate: "",
      responseTime: "",
      aspectRatio: "",
      brightness: "",
      contrast: "",
      colorGamut: ""
    },
    features: [],
    ports: [],
    color: "",
    inStock: true,
    quantity: "",
    warranty: "1 Year"
  });
  const [isEditingDisplay, setIsEditingDisplay] = useState(false);
  const [displayImagePreview, setDisplayImagePreview] = useState([]);
  const [displaySearchTerm, setDisplaySearchTerm] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const [customPCComponents, setCustomPCComponents] = useState([]);
  const [isEditingCustomPCComponent, setIsEditingCustomPCComponent] = useState(false);
  const [customPCComponentFormData, setCustomPCComponentFormData] = useState({
    id: "",
    name: "",
    category: "CPU",
    price: "",
    finalPrice: "",
    originalPrice: "",
    description: "",
    image: null,
    images: [],
    brand: "",
    stock: 0,
    specs: {
      // CPU specific
      socket: "",
      cores: "",
      threads: "",
      baseClock: "",
      boostClock: "",
      tdp: "",

      // GPU specific
      memory: "",
      memoryType: "",
      coreClock: "",

      // RAM specific
      ramType: "",
      speed: "",
      capacity: "",

      // Storage specific
      interface: "",
      formFactor: "",

      // Motherboard specific
      cpuSocket: "",
      chipset: "",
      ramSlots: "",
      maxRam: "",

      // Power Supply specific
      wattage: "",
      efficiency: "",
      modular: false,

      // Case specific
      caseType: "",
      color: "",
      dimensions: "",
      supportedMotherboard: "",

      // WiFi Card specific
      wifiStandard: "",
      bluetooth: ""
    },
    compatibility: {
      socket: [],
      chipset: [],
      ramType: [],
      powerMin: "",
      formFactor: []
    },
    tags: []
  });

  const [customPCComponentImagePreview, setCustomPCComponentImagePreview] = useState([]);
  const [customPCSearchTerm, setCustomPCSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Categories for custom PC components
  const componentCategories = [
    'CPU', 'GPU', 'RAM', 'SSD', 'HDD', 
    'Motherboard', 'PowerSupply', 'CPUCooler', 
    'ComputerCase', 'WiFiCard', 'Ports'
  ];

  const BASE_URL = `http://${window.location.hostname}:4000`;

  // Fetch custom PC components
  const fetchCustomPCComponents = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/custom-pc/admin/components?limit=100`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json();
      console.log('Fetched components data:', data);

      if (data.success) {
        // The admin endpoint returns data.components (array of products)
        if (data.components && Array.isArray(data.components)) {
          setCustomPCComponents(data.components);
        } else {
          console.error('Unexpected data format:', data);
          setCustomPCComponents([]);
        }
      } else {
        console.error('API returned success: false', data);
        setCustomPCComponents([]);
      }
    } catch (error) {
      console.error("Error fetching custom PC components:", error);
      setError("Failed to load custom PC components");
    }
  };

  // Load components on mount
  useEffect(() => {
    fetchCustomPCComponents();
  }, []);

  // Handle image change for custom PC components
  const handleCustomPCComponentImageChange = (e) => {
    const imageFiles = e.target.files;

    if (imageFiles && imageFiles.length > 0) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const validFiles = Array.from(imageFiles).filter(file => allowedTypes.includes(file.type));

      if (validFiles.length !== imageFiles.length) {
        alert('Some files are invalid. Only JPEG, PNG, and GIF are allowed.');
        return;
      }

      const previewUrls = validFiles.map(file => URL.createObjectURL(file));

      setCustomPCComponentImagePreview((prev) => [...prev, ...previewUrls]);

      setCustomPCComponentFormData((prevData) => ({
        ...prevData,
        images: Array.isArray(prevData.images) ? [...prevData.images, ...validFiles] : [...validFiles],
        image: validFiles[0]
      }));
    }
  };

  // Remove image
  const handleCustomPCComponentImageRemove = (index) => {
    setCustomPCComponentImagePreview(prevPreviews => prevPreviews.filter((_, i) => i !== index));
    setCustomPCComponentFormData(prevData => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index)
    }));
  };

  // Handle input change
  const handleCustomPCComponentInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('specs.')) {
      const specName = name.split('.')[1];
      setCustomPCComponentFormData(prevData => ({
        ...prevData,
        specs: {
          ...prevData.specs,
          [specName]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.includes('compatibility.')) {
      const compatName = name.split('.')[1];
      setCustomPCComponentFormData(prevData => ({
        ...prevData,
        compatibility: {
          ...prevData.compatibility,
          [compatName]: value.split(',').map(item => item.trim())
        }
      }));
    } else {
      setCustomPCComponentFormData(prevData => ({
        ...prevData,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Reset form
  const resetCustomPCComponentForm = () => {
    setCustomPCComponentFormData({
      id: "",
      name: "",
      category: "CPU",
      price: "",
      finalPrice: "",
      originalPrice: "",
      description: "",
      image: null,
      images: [],
      brand: "",
      stock: 0,
      specs: {
        socket: "",
        cores: "",
        threads: "",
        baseClock: "",
        boostClock: "",
        tdp: "",
        memory: "",
        memoryType: "",
        coreClock: "",
        ramType: "",
        speed: "",
        capacity: "",
        interface: "",
        formFactor: "",
        cpuSocket: "",
        chipset: "",
        ramSlots: "",
        maxRam: "",
        wattage: "",
        efficiency: "",
        modular: false,
        caseType: "",
        color: "",
        dimensions: "",
        supportedMotherboard: "",
        wifiStandard: "",
        bluetooth: ""
      },
      compatibility: {
        socket: [],
        chipset: [],
        ramType: [],
        powerMin: "",
        formFactor: []
      },
      tags: []
    });
    setCustomPCComponentImagePreview([]);
    setIsEditingCustomPCComponent(false);
  };

  // Handle edit
  const handleEditCustomPCComponent = (component) => {
    setCustomPCComponentFormData({
      id: component._id,
      name: component.name || "",
      category: component.category || "CPU",
      price: component.price || "",
      finalPrice: component.finalPrice || "",
      originalPrice: component.originalPrice || "",
      description: component.description || "",
      image: component.image || null,
      images: component.images || [],
      brand: component.brand || "",
      stock: component.stock || 0,
      specs: component.specs || {},
      compatibility: component.compatibility || {},
      tags: component.tags || []
    });

    if (component.image && component.image.length > 0) {
      const imageUrls = component.image.map(img => 
        img.startsWith('http') 
          ? img 
          : `${BASE_URL}/uploads/${img}`
      );
      setCustomPCComponentImagePreview(imageUrls);
    }

    setIsEditingCustomPCComponent(true);
  };

  // Handle delete
  const handleDeleteCustomPCComponent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this component?")) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/custom-pc/admin/components/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete component");

      alert("Component deleted successfully!");
      fetchCustomPCComponents(); // Refresh the list
    } catch (error) {
      console.error("Error deleting component:", error);
      setError("Failed to delete component");
    }
  };

  // Handle submit
  const handleCustomPCComponentSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();

      // Append all basic fields
      Object.keys(customPCComponentFormData).forEach(key => {
        if (key === 'specs' || key === 'compatibility' || key === 'tags') {
          formDataToSend.append(key, JSON.stringify(customPCComponentFormData[key]));
        } else if (key !== 'images' && key !== 'image') {
          formDataToSend.append(key, customPCComponentFormData[key]);
        }
      });

      // Append images
      if (customPCComponentFormData.images && customPCComponentFormData.images.length > 0) {
        customPCComponentFormData.images.forEach(file => {
          if (file instanceof File) {
            formDataToSend.append('images', file);
          }
        });
      }

      const url = customPCComponentFormData.id
        ? `${BASE_URL}/api/custom-pc/admin/components/${customPCComponentFormData.id}`
        : `${BASE_URL}/api/custom-pc/admin/components`;

      const method = customPCComponentFormData.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) throw new Error("Failed to save component");

      alert(customPCComponentFormData.id ? "Component updated successfully!" : "Component created successfully!");

      fetchCustomPCComponents(); // Refresh the list
      resetCustomPCComponentForm();
    } catch (error) {
      console.error("Error saving component:", error);
      setError("Failed to save component");
    }
  };

  // Filter components based on search and category
  const filteredCustomPCComponents = customPCComponents.filter(component => {
    const matchesSearch = component.name?.toLowerCase().includes(customPCSearchTerm.toLowerCase()) ||
                         component.brand?.toLowerCase().includes(customPCSearchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter orders based on the search query
  const filteredOrders = orders.filter(order =>
    order._id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Menu items configuration
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaHome /> },
    { id: 'pending-orders', label: 'Pending Orders', icon: <FaShoppingCart /> },
    { id: 'manage-users', label: 'Manage Users', icon: <FaUsers /> },
    { id: 'discount-codes', label: 'Discount Codes', icon: <FaTags /> },
    { id: 'manage-products', label: 'Manage Products', icon: <FaBox /> },
    { id: 'manage-accessories', label: 'Manage Accessories', icon: <FaMicrochip /> },
    { id: 'manage-custom-pc', label: 'Custom PC Components', icon: <FaCog /> },
    { id: 'manage-displays', label: 'Manage Displays', icon: <FaTv /> },
    { id: 'newsletter', label: 'Newsletter', icon: <FaEnvelope /> },
    { id: 'device-info', label: 'Device Info', icon: <FaInfoCircle /> },
    { id: 'location-info', label: 'Location Info', icon: <FaInfoCircle /> },
    { id: 'login-history', label: 'Login History', icon: <FaHistory /> },
  ];

  useEffect(() => {
    // Connect to Socket.io server 
    const socketConnection = io(`${BASE_URL}`, {
      transports: ["polling", "websocket"],
      withCredentials: true,
      // extraHeaders: {
      //   "Access-Control-Allow-Origin": ["http://localhost:5173", "http://172.17.0.1:5173/"]
      // }
    });

    setSocket(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        const socketUserId = localStorage.getItem('user');
        if (!socketUserId) {
          console.log("No userId found in localStorage!");
        } else {
          socket.emit("user-online", socketUserId);
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/admin/device-info`);
        const data = await response.json();
        setDeviceInfo(data);
      } catch (error) {
        console.error("Error fetching device info:", error);
      }
    };

    const fetchLocationInfo = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/admin/location`);
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
    const fetchProducts = async (page = 1, limit = 10) => {
      try {
        const response = await fetch(`${BASE_URL}/api/admin/products?page=${page}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();
        const allProducts = [
          ...data.prebuildPC,
          ...data.refurbishedProducts,
          ...data.miniPCs,
          ...data.officePC,
        ].filter(product => product && product.type);

        console.log("All Products:", allProducts);
        setProducts(allProducts);

        const uniqueCategories = [...new Set(allProducts.map((product) => product.type))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error(error);
        setError("Unable to load products. Please try again.");
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/admin/users`, {
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

        const response = await fetch(`${BASE_URL}/api/users/${userId}/orders`, {
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
          fetch(`${BASE_URL}/api/subscribers`),
          fetch(`${BASE_URL}/api/message-history`),
        ]);

        setSubscribers(await subResponse.json());
        setMessageHistory(await msgResponse.json());
      } catch (error) {
        console.error("Error fetching subscribers:", error);
      }
    };

    fetchProducts(1, 10);
    fetchUsers();
    fetchPendingOrders();
    fetchData();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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
        setDashboardStats(stats);
      } catch (error) {
        console.error(error);
        setError("Unable to load dashboard stats. Please try again.");
      }
    };

    const fetchLoginHistory = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/admin/login-history`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch login history");
        }

        const data = await response.json();
        setLoginHistory(data.loginHistory);
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
      setIsAuthenticated(false);
      setCountdown(0);
      localStorage.setItem("countdown", 0);
      alert("Session timed out due to inactivity.");
    }, countdown * 1000);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }

    const resetTimeoutOnActivity = () => {
      setLogoutTimeout();
    };

    window.addEventListener("mousemove", resetTimeoutOnActivity);
    window.addEventListener("keydown", resetTimeoutOnActivity);

    const intervalId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(intervalId);
          setIsAuthenticated(false);
          localStorage.removeItem("countdown");
          return 0;
        }
        const newCountdown = prev - 1;
        localStorage.setItem("countdown", newCountdown);
        return newCountdown;
      });
    }, 1000);

    setLogoutTimeout();

    return () => {
      window.removeEventListener("mousemove", resetTimeoutOnActivity);
      window.removeEventListener("keydown", resetTimeoutOnActivity);
      clearInterval(intervalId);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(intervalId);
          setIsAuthenticated(false);
          setError("Session timed out due to inactivity.");
          localStorage.removeItem("countdown");
          return 0;
        }
        const newCountdown = prev - 1;
        localStorage.setItem("countdown", newCountdown);
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

  const formatTime = (seconds) => {
    const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${secs}`;
  };

  useEffect(() => {
    const fetchDisplays = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/displays`);
        const data = await response.json();
        console.log('Raw API response:', data);
        console.log('Fetched displays:', data.data); // Check what fields each display has

        if (data.success && Array.isArray(data.data)) {
          setDisplays(data.data);
          console.log('Displays set successfully:', data.data.length);
        } else {
          console.error('Unexpected response format:', data);
          setDisplays([]);
        }
      } catch (error) {
        console.error("Error fetching displays:", error);
      }
    };

    fetchDisplays();
  }, []);

  // Display image handling
  const handleDisplayImageChange = (e) => {
    const imageFiles = e.target.files;

    if (imageFiles && imageFiles.length > 0) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const validFiles = Array.from(imageFiles).filter(file => allowedTypes.includes(file.type));

      if (validFiles.length !== imageFiles.length) {
        alert('Some files are invalid. Only JPEG, PNG, and GIF are allowed.');
        return;
      }

      const previewUrls = validFiles.map(file => URL.createObjectURL(file));

      setDisplayImagePreview((prev) => [...prev, ...previewUrls]);

      setDisplayFormData((prevData) => ({
        ...prevData,
        images: Array.isArray(prevData.images) ? [...prevData.images, ...validFiles] : [...validFiles],
        image: validFiles[0] // Set first image as main image
      }));
    }
  };

  const handleDisplayImageRemove = (index) => {
    setDisplayImagePreview(prevPreviews => prevPreviews.filter((_, i) => i !== index));
    setDisplayFormData(prevData => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index)
    }));
  };

  const handleDisplayInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDisplayFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDisplaySpecsChange = (e) => {
    const { name, value } = e.target;
    setDisplayFormData(prevData => ({
      ...prevData,
      specs: {
        ...prevData.specs,
        [name]: value
      }
    }));
  };

  const handleDisplayFeaturesChange = (e) => {
    const features = e.target.value.split(',').map(f => f.trim());
    setDisplayFormData(prevData => ({
      ...prevData,
      features
    }));
  };

  const handleDisplayPortsChange = (e) => {
    const ports = e.target.value.split(',').map(p => p.trim());
    setDisplayFormData(prevData => ({
      ...prevData,
      ports
    }));
  };

  const resetDisplayForm = () => {
    setDisplayFormData({
      id: "",
      name: "",
      category: "gaming",
      description: "",
      price: "",
      originalPrice: "",
      image: null,
      images: [],
      brand: "",
      specs: {
        size: "",
        resolution: "",
        panel: "",
        refreshRate: "",
        responseTime: "",
        aspectRatio: "",
        brightness: "",
        contrast: "",
        colorGamut: ""
      },
      features: [],
      ports: [],
      color: "",
      inStock: true,
      quantity: "",
      warranty: "1 Year"
    });
    setDisplayImagePreview([]);
    setIsEditingDisplay(false);
    setIsEditMode(false);
  };

    const handleDisplaySubmit = async (e) => {
    e.preventDefault();

    console.log('=== SUBMITTING DISPLAY ===');
    console.log('Form data:', displayFormData);
    console.log('Images:', displayFormData.images);

    try {
      // Log the current state for debugging
      console.log('isEditMode:', isEditMode); 
      console.log('displayFormData.id:', displayFormData.id);

      // Validate that we have an ID when editing
      if (isEditMode) {
        if (!displayFormData.id) {
          setError("Display ID is missing for edit operation. Please try selecting the display again.");
          return;
        }
        console.log('Editing display with ID:', displayFormData.id);
      }

      const formDataToSend = new FormData();
      
      // Append all fields
      Object.keys(displayFormData).forEach(key => {
        if (key === 'specs') {
          formDataToSend.append('specs', JSON.stringify(displayFormData.specs));
        } else if (key === 'features' || key === 'ports') {
          formDataToSend.append(key, JSON.stringify(displayFormData[key]));
        } else if (key !== 'images' && key !== 'image') {
          formDataToSend.append(key, displayFormData[key]);
        }
      });

      // Append images
      if (displayFormData.images && displayFormData.images.length > 0) {
        displayFormData.images.forEach(file => {
          if (file instanceof File) {
            formDataToSend.append('images', file);
          }
        });
      }

      const url = isEditMode 
        ? `${BASE_URL}/api/displays/${displayFormData.id}`
        : `${BASE_URL}/api/displays`;
      
      const method = isEditMode ? "PUT" : "POST";

      console.log('Sending request to:', url);
      console.log('Method:', method);
      console.log('Token present:', !!localStorage.getItem("token"));

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // First check if response is ok
      if (!response.ok) {
        // Try to get the error message
        const errorText = await response.text();
        console.error('Error response:', errorText);

        try {
          // Try to parse as JSON
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || "Failed to save display");
        } catch (e) {
          // If not JSON, show the HTML error
          throw new Error(`Server error: ${response.status}. The route ${url} might be incorrect.`);
        }
      }

      const data = await response.json();
      alert(isEditMode ? "Display updated successfully!" : "Display created successfully!");
      
      // Refresh displays list
      const refreshResponse = await fetch(`${BASE_URL}/api/displays`);
      const refreshData = await refreshResponse.json();
      setDisplays(refreshData.data || []);
      
      resetDisplayForm();
    } catch (error) {
      console.error("Error saving display:", error);
      setError(error.message || "Unable to save display. Please try again.");
    }
  };

  const handleDisplayDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this display?")) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/displays/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete display");
      }

      alert("Display deleted successfully!");
      
      // Refresh displays list
      const refreshResponse = await fetch(`${BASE_URL}/api/displays`);
      const refreshData = await refreshResponse.json();
      setDisplays(refreshData.data || []);
    } catch (error) {
      console.error("Error deleting display:", error);
      setError(error.message || "Unable to delete display. Please try again.");
    }
  };

  const handleDisplayEdit = (display) => {
    console.log('=== EDITING DISPLAY ===');
    console.log('Full display object:', JSON.stringify(display, null, 2));
    console.log('display._id:', display?._id);
    console.log('display.id:', display?.id); // Check if it might be 'id' instead of '_id'
    console.log('display type:', typeof display);
    console.log('Is display an object?', display !== null && typeof display === 'object');

      // Check if display has any properties
    if (display) {
      console.log('Display keys:', Object.keys(display));
    }
    
    // Make sure we're getting the ID correctly
    const displayId = display._id || display.id;
    console.log('Using ID:', displayId);
    
      if (!displayId) {
      console.error('No ID found in display object!');
      console.error('Display object:', display);
      setError('Cannot edit: Display ID not found');
      return;
    }

    setDisplayFormData({
      id: displayId,
      name: display.name || "",
      category: display.category || "gaming",
      description: display.description || "",
      price: display.price || "",
      originalPrice: display.originalPrice || "",
      image: display.image || null,
      images: display.images || [],
      brand: display.brand || "",
      specs: display.specs || {
        size: "",
        resolution: "",
        panel: "",
        refreshRate: "",
        responseTime: "",
        aspectRatio: "",
        brightness: "",
        contrast: "",
        colorGamut: ""
      },
      features: display.features || [],
      ports: display.ports || [],
      color: display.color || "",
      inStock: display.inStock !== undefined ? display.inStock : true,
      quantity: display.quantity || "",
      warranty: display.warranty || "1 Year"
    });
    
    // Set image previews if there are existing images
    if (display.images && display.images.length > 0) {
      const imageUrls = display.images.map(img => 
        img.startsWith('http') ? img : `${BASE_URL}/uploads/${img}`
      );
      setDisplayImagePreview(imageUrls);
    }
    
    setIsEditMode(true);
    setIsEditingDisplay(true);
  };

  const filteredDisplays = displays.filter(display =>
    display.name?.toLowerCase().includes(displaySearchTerm.toLowerCase()) ||
    display.brand?.toLowerCase().includes(displaySearchTerm.toLowerCase())
  );

  const handleImageChange = (e) => {
    const imageFiles = e.target.files;

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

  // Handle additional images change
  const handleAdditionalImagesChange = (e) => {
    const imageFiles = e.target.files;

    if (imageFiles && imageFiles.length > 0) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const validFiles = Array.from(imageFiles).filter(file => allowedTypes.includes(file.type));

      if (validFiles.length !== imageFiles.length) {
        alert('Some files are invalid. Only JPEG, PNG, GIF, and WEBP are allowed.');
        return;
      }

    // Convert FileList to array and store the actual File objects
    const newFiles = Array.from(validFiles);
    
      setFormData((prevData) => ({
        ...prevData,
        additionalImages: [...(prevData.additionalImages || []), ...newFiles],
      }));
    }
  };

  // Remove additional image
  const handleAdditionalImageRemove = (index) => {
    setFormData(prevData => {
      const updatedImages = [...prevData.additionalImages];
      updatedImages.splice(index, 1);
      return {
        ...prevData,
        additionalImages: updatedImages
      };
    });
  };

  // Handle video change
  const handleVideoChange = (index, field, value) => {
    const updatedVideos = [...formData.videos];
    updatedVideos[index] = {
      ...updatedVideos[index],
      [field]: value
    };
    setFormData({ ...formData, videos: updatedVideos });
  };

  // Add new video
  const addVideo = () => {
    setFormData({
      ...formData,
      videos: [...formData.videos, { title: "", url: "" }]
    });
  };

  // Remove video
  const removeVideo = (index) => {
    setFormData({
      ...formData,
      videos: formData.videos.filter((_, i) => i !== index)
    });
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
    setShowPassword(!showPassword);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/api/admin/users`, {
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
      const response = await fetch(`${BASE_URL}/api/admin/users/${id}`, {
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
      const response = await fetch(`${BASE_URL}/api/admin/users/${editingUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editedUser),
      });

      if (!response.ok) throw new Error("Failed to update user");
      const updatedUser = await response.json();

      setUsers((prevUsers) =>
        prevUsers.map((user) => (user._id === updatedUser._id ? updatedUser : user))
      );

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

  const buildFormData = (formData) => {
  const formDataToSend = new FormData();

  if (["pre-built PC", "refurbished laptop", "mini PC", "office PC"].includes(formData.type)) {
    formData.id = formData.id || `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  }

  if (!formData.id) {
    formData.id = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
    console.log("Generated ID:", formData.id);
  }

  if (!formData.customId) {
    formData.customId = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
    console.log("Generated customId:", formData.customId);
  }

  formData.stock = formData.stock === "no" ? false : true;

  // Append simple fields - but DON'T append arrays here
  Object.keys(formData).forEach((key) => {
    // Skip complex fields that need special handling
    const skipFields = ['notes', 'otherTechnicalDetails', 'image', 'additionalImages', 
                        'keyFeatures', 'specifications', 'videos', 'ramOptions', 
                        'storage1Options', 'storage2Options'];
    
    if (!skipFields.includes(key)) {
      // Only append if value is not undefined and not an object/array
      if (formData[key] !== undefined && typeof formData[key] !== 'object') {
        formDataToSend.append(key, formData[key]);
      }
    }
  });

  const appendOptions = (options, key) => {
    if (Array.isArray(options) && options.length > 0) {
      // Stringify the entire array and append as a single field
      const optionsString = JSON.stringify(options);
      formDataToSend.append(key, optionsString);
      console.log(`Appended ${key}:`, optionsString);
    }
  };

  if (["Pre-Built PC"].includes(formData.type)) {
    appendOptions(formData.ramOptions, "ramOptions");
    appendOptions(formData.storage1Options, "storage1Options");
    appendOptions(formData.storage2Options, "storage2Options");
  }

  const productTypeFields = {
    "pre-built PC": ["platform", "motherboard", "liquidcooler", "graphiccard", "smps", "cabinet"],
    "refurbished laptop": ["ram", "storage", "graphiccard", "display", "os", "condition"],
    "mini PC": ["platform", "ram", "storage", "graphiccard", "motherboard", "smps", "cabinet"],
    "office PC": ["platform", "motherboard", "ram", "storage", "graphiccard", "smps", "cabinet"],
  };

  (productTypeFields[formData.type] || []).forEach((field) => {
    if (formData[field] !== undefined) {
      formDataToSend.append(field, formData[field]);
    }
  });

  // Handle main images
  if (formData.image) {
    const images = Array.isArray(formData.image) ? formData.image : [formData.image];
    images.forEach((file) => {
      if (file instanceof File) {
        formDataToSend.append("image", file);
        console.log("Appended image file:", file.name);
      }
    });
  }

  // Handle notes
  if (formData.notes) {
    if (Array.isArray(formData.notes)) {
      // Stringify the entire array
      formDataToSend.append("notes", JSON.stringify(formData.notes));
      console.log("Appended notes:", JSON.stringify(formData.notes));
    } else if (typeof formData.notes === "string") {
      formDataToSend.append("notes", formData.notes);
    }
  }

  // Handle otherTechnicalDetails
  if (formData.otherTechnicalDetails) {
    if (Array.isArray(formData.otherTechnicalDetails)) {
      formDataToSend.append("otherTechnicalDetails", JSON.stringify(formData.otherTechnicalDetails));
      console.log("Appended otherTechnicalDetails:", JSON.stringify(formData.otherTechnicalDetails));
    } else if (typeof formData.otherTechnicalDetails === "string") {
      formDataToSend.append("otherTechnicalDetails", formData.otherTechnicalDetails);
    }
  }

  // Add additional images
  if (formData.additionalImages && formData.additionalImages.length > 0) {
    formData.additionalImages.forEach((file) => {
      if (file instanceof File) {
        formDataToSend.append('additionalImages', file);
        console.log("Appended additional image:", file.name);
      }
    });
  }

  // KEY FEATURES - FIX: Stringify the entire array
  if (formData.keyFeatures && formData.keyFeatures.length > 0) {
    // Filter out empty entries
    const validFeatures = formData.keyFeatures.filter(f => f.title || f.description);
    if (validFeatures.length > 0) {
      // Stringify the entire array
      const featuresString = JSON.stringify(validFeatures);
      formDataToSend.append('keyFeatures', featuresString);
      console.log("Sending keyFeatures:", featuresString);
    } else {
      // Send empty array if no valid features
      formDataToSend.append('keyFeatures', JSON.stringify([]));
    }
  } else {
    // Ensure the field is sent even if empty
    formDataToSend.append('keyFeatures', JSON.stringify([]));
  }

  // SPECIFICATIONS - FIX: Stringify the entire array
  if (formData.specifications && formData.specifications.length > 0) {
    const validSpecs = formData.specifications.filter(s => s.title);
    if (validSpecs.length > 0) {
      // Stringify the entire array
      const specsString = JSON.stringify(validSpecs);
      formDataToSend.append('specifications', specsString);
      console.log("Sending specifications:", specsString);
    } else {
      // Send empty array if no valid specs
      formDataToSend.append('specifications', JSON.stringify([]));
    }
  } else {
    // Ensure the field is sent even if empty
    formDataToSend.append('specifications', JSON.stringify([]));
  }

  // VIDEOS - FIX: Stringify the entire array
  if (formData.videos && formData.videos.length > 0) {
    const validVideos = formData.videos.filter(v => v.title || v.url);
    if (validVideos.length > 0) {
      const videosString = JSON.stringify(validVideos);
      formDataToSend.append('videos', videosString);
      console.log("Sending videos:", videosString);
    } else {
      formDataToSend.append('videos', JSON.stringify([]));
    }
  } else {
    formDataToSend.append('videos', JSON.stringify([]));
  }

  console.log("Final FormData to be sent:");
  for (let [key, value] of formDataToSend.entries()) {
    console.log(`${key}: ${value}`);
  }

  return formDataToSend;
};

  const submitProduct = async (url, method, formDataToSend) => {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Error Details:", errorDetails);
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

    if (!isEditing) {
      formData.id = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
    }

    const isEditOperation = isEditing && formData.id;

    try {
      const formDataToSend = buildFormData(formData);
      const method = isEditOperation ? "PUT" : "POST";
      console.log(formData.type);

      const url = isEditOperation
        ? `${BASE_URL}/api/admin/products/${encodeURIComponent(formData.type)}/${formData.id}`
        : `${BASE_URL}/api/admin/products/add`;

      console.log("Final URL:", url);
      console.log("Request Method:", method);
      console.log("FormDataToSend:", formDataToSend);

      const result = await submitProduct(url, method, formDataToSend);

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
        keyFeatures: [{ title: "", description: "" }],
        specifications: [{ title: "", specs: [{ name: "", value: "" }] }],
        additionalImages: [],
        videos: [{ title: "", url: "" }],
      });
      setIsEditing(false);
      setImagePreview(null);
    } catch (error) {
      setError(error.message || "Unable to save product. Please try again.");
    }
  };

  const handleDelete = async (id, productType) => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/products/${productType}/${id}`, {
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const newCountdown = 10800;
    localStorage.setItem("countdown", newCountdown);
    setCountdown(newCountdown);

    try {
      const response = await fetch(`${BASE_URL}/api/admin/login`, {
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
      localStorage.setItem("token", data.token);
      setIsAuthenticated(true);
      setCredentials({ username: "", password: "" });

      const loginEvent = {
        username: credentials.username,
        date: new Date().toLocaleString(),
      };
      setLoginHistory((prevHistory) => [loginEvent, ...prevHistory]);

    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    setCountdown(0);
    localStorage.setItem("countdown", 0);
    alert("You have logged out successfully.");
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
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
      const response = await fetch(`${BASE_URL}/api/orders/${orderId}/delivery-date`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ deliveryDate: new Date(newDate).toISOString() }),
      });

      if (!response.ok) throw new Error('Failed to update delivery date');

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
      const response = await fetch(`${BASE_URL}/api/orders/${orderId}/state`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        console.log(`Order ${action} successfully:`, updatedOrder);
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
        { name: "", value: "" },
      ],
    }));
  };

  const removeOtherTechnicalDetail = (index) => {
    const updatedDetails = formData.otherTechnicalDetails.filter((_, i) => i !== index);
    setFormData({ ...formData, otherTechnicalDetails: updatedDetails });
  };

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
      const response = await fetch(`${BASE_URL}/api/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: recipient.split(',').map((email) => email.trim()),
          subject,
          message,
        }),
      });

      if (response.ok) {
        alert("Message sent successfully!");
        setRecipient("");
        setSubject("");
        setMessage("");
        const historyResponse = await fetch(`${BASE_URL}/api/message-history`);
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
      const updatedField = [...prevData[field]];
      updatedField[index][name.includes("Price") ? "price" : "value"] = value;
      return { ...prevData, [field]: updatedField };
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
      updatedField.splice(index, 1);
      return { ...prevData, [field]: updatedField };
    });
  };

  const toggleBox = () => setIsOpen(!isOpen);
  const toggleBox1 = () => setIsOpenforLocation((prev) => !prev);

  const handleDeletedeviceinformation = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/device-info`, { method: 'DELETE' });

      if (response.ok) {
        setDeviceInfo([]);
        alert('All device information has been deleted.');
      } else {
        const errorData = await response.json();
        alert('Error: ' + errorData.message);
      }
    } catch (error) {
      console.error('Error deleting device information:', error);
      alert('Failed to delete device information.');
    }
  };

  const handleDeletelocationinformation = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/location-info`, { method: 'DELETE' });

      if (response.ok) {
        setLocationInfo([]);
        alert('All location information has been deleted.');
      } else {
        const errorData = await response.json();
        alert('Error: ' + errorData.message);
      }
    } catch (error) {
      console.error('Error deleting location information:', error);
      alert('Failed to delete location information.');
    }
  }

  const toggleHistory = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedOrders.length === 0) {
      alert("Please select orders to delete.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/admin/orders/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderIds: selectedOrders }),
      });

      if (response.ok) {
        alert("Orders deleted successfully!");
        setOrders((prevOrders) => prevOrders.filter((order) => !selectedOrders.includes(order._id)));
        setSelectedOrders([]);
      } else {
        alert("Failed to delete orders.");
      }
    } catch (error) {
      console.error("Error deleting orders:", error);
    }
  };

  const deleteAllLoginHistory = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/clear-login-history`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("All login history has been deleted.");
        setLoginHistory([]);
      } else {
        console.error("Failed to delete login history");
      }
    } catch (error) {
      console.error("Error deleting login history:", error);
    }
  };

  // Add this function to render the Custom PC Components section
  const renderCustomPCComponents = () => (
    <section className="relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-black">
          Custom PC Components <span className="text-sm text-gray-500">({customPCComponents.length} total)</span>
        </h2>
        <button
          onClick={() => {
            resetCustomPCComponentForm();
            setIsEditingCustomPCComponent(true);
          }}
          className="bg-black text-white px-6 py-3 border-2 border-black hover:bg-gray-800 transition flex items-center gap-2"
        >
          <span className="text-xl">+</span> Add New Component
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search components by name or brand..."
          value={customPCSearchTerm}
          onChange={(e) => setCustomPCSearchTerm(e.target.value)}
          className="px-4 py-3 border-2 border-black flex-1 text-black"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 border-2 border-black text-black w-full md:w-64"
        >
          <option value="all">All Categories</option>
          {componentCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Components Grid */}
      <div className="bg-white border-4 border-black p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {filteredCustomPCComponents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomPCComponents.map((component) => (
              <div key={component._id} className="border-2 border-black p-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition">
                {/* Component Image */}
                <div className="h-48 mb-4 overflow-hidden border-2 border-black flex items-center justify-center bg-gray-50">
                  {component.image ? (
                    <img
                      src={`${BASE_URL}/uploads/${component.image[0].split('/').pop()}`}
                      alt={component.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                </div>

                {/* Component Info */}
                <div className="mb-2">
                  <span className="inline-block px-2 py-1 text-xs font-bold bg-black text-white mb-2">
                    {component.category}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-black mb-1">{component.name}</h3>
                <p className="text-sm text-gray-600 mb-2">Brand: {component.brand || 'N/A'}</p>
                
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xl font-bold text-green-600">₹{component.price?.toLocaleString()}</p>
                  <p className={`text-sm ${component.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {component.stock > 0 ? `In Stock: ${component.stock}` : 'Out of Stock'}
                  </p>
                </div>

                {/* Quick Specs Preview */}
                <div className="text-xs text-gray-600 mb-4 space-y-1 border-t border-gray-200 pt-2">
                  {component.category === 'CPU' && component.specs && (
                    <>
                      <p>Socket: {component.specs.socket || 'N/A'}</p>
                      <p>Cores/Threads: {component.specs.cores}/{component.specs.threads}</p>
                      <p>Clock: {component.specs.baseClock} / {component.specs.boostClock}</p>
                    </>
                  )}
                  {component.category === 'GPU' && component.specs && (
                    <>
                      <p>Memory: {component.specs.memory} {component.specs.memoryType}</p>
                      <p>TDP: {component.specs.tdp}W</p>
                    </>
                  )}
                  {component.category === 'RAM' && component.specs && (
                    <>
                      <p>Type: {component.specs.ramType}</p>
                      <p>Speed: {component.specs.speed}</p>
                      <p>Capacity: {component.specs.capacity}</p>
                    </>
                  )}
                  {component.category === 'Motherboard' && component.specs && (
                    <>
                      <p>Socket: {component.specs.cpuSocket}</p>
                      <p>Chipset: {component.specs.chipset}</p>
                      <p>RAM: {component.specs.ramType}</p>
                    </>
                  )}
                  {component.category === 'PowerSupply' && component.specs && (
                    <>
                      <p>Wattage: {component.specs.wattage}W</p>
                      <p>Efficiency: {component.specs.efficiency}</p>
                      <p>Modular: {component.specs.modular ? 'Yes' : 'No'}</p>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEditCustomPCComponent(component)}
                    className="flex-1 py-2 bg-blue-500 text-white border-2 border-blue-500 hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCustomPCComponent(component._id)}
                    className="flex-1 py-2 bg-red-500 text-white border-2 border-red-500 hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No components found.</p>
            <button
              onClick={() => {
                resetCustomPCComponentForm();
                setIsEditingCustomPCComponent(true);
              }}
              className="bg-black text-white px-6 py-3 border-2 border-black hover:bg-gray-800 transition"
            >
              Add Your First Component
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Component Modal */}
      {isEditingCustomPCComponent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white border-4 border-black p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium text-black">
                {customPCComponentFormData.id ? "Edit Component" : "Add New Component"}
              </h3>
              <button
                onClick={resetCustomPCComponentForm}
                className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCustomPCComponentSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Component Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={customPCComponentFormData.name}
                    onChange={handleCustomPCComponentInputChange}
                    className="w-full px-3 py-2 border-2 border-black text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Category *</label>
                  <select
                    name="category"
                    value={customPCComponentFormData.category}
                    onChange={handleCustomPCComponentInputChange}
                    className="w-full px-3 py-2 border-2 border-black text-black"
                    required
                  >
                    {componentCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={customPCComponentFormData.brand}
                    onChange={handleCustomPCComponentInputChange}
                    className="w-full px-3 py-2 border-2 border-black text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={customPCComponentFormData.price}
                    onChange={handleCustomPCComponentInputChange}
                    className="w-full px-3 py-2 border-2 border-black text-black"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Final Price (₹)</label>
                  <input
                    type="number"
                    name="finalPrice"
                    value={customPCComponentFormData.finalPrice}
                    onChange={handleCustomPCComponentInputChange}
                    className="w-full px-3 py-2 border-2 border-black text-black"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    value={customPCComponentFormData.stock}
                    onChange={handleCustomPCComponentInputChange}
                    className="w-full px-3 py-2 border-2 border-black text-black"
                    min="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-600 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={customPCComponentFormData.description}
                    onChange={handleCustomPCComponentInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border-2 border-black text-black"
                  />
                </div>
              </div>

              {/* Category-specific specifications */}
              {customPCComponentFormData.category === 'CPU' && (
                <div className="border-t-2 border-black pt-4">
                  <h4 className="text-lg font-semibold text-black mb-4">CPU Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Socket</label>
                      <input
                        type="text"
                        name="specs.socket"
                        value={customPCComponentFormData.specs.socket || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                        placeholder="e.g., LGA1700, AM5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Cores</label>
                      <input
                        type="number"
                        name="specs.cores"
                        value={customPCComponentFormData.specs.cores || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Threads</label>
                      <input
                        type="number"
                        name="specs.threads"
                        value={customPCComponentFormData.specs.threads || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Base Clock</label>
                      <input
                        type="text"
                        name="specs.baseClock"
                        value={customPCComponentFormData.specs.baseClock || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                        placeholder="e.g., 3.5 GHz"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Boost Clock</label>
                      <input
                        type="text"
                        name="specs.boostClock"
                        value={customPCComponentFormData.specs.boostClock || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                        placeholder="e.g., 5.1 GHz"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">TDP (Watts)</label>
                      <input
                        type="number"
                        name="specs.tdp"
                        value={customPCComponentFormData.specs.tdp || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                      />
                    </div>
                  </div>
                </div>
              )}

              {customPCComponentFormData.category === 'GPU' && (
                <div className="border-t-2 border-black pt-4">
                  <h4 className="text-lg font-semibold text-black mb-4">GPU Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Memory</label>
                      <input
                        type="text"
                        name="specs.memory"
                        value={customPCComponentFormData.specs.memory || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                        placeholder="e.g., 8GB, 12GB"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Memory Type</label>
                      <input
                        type="text"
                        name="specs.memoryType"
                        value={customPCComponentFormData.specs.memoryType || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                        placeholder="e.g., GDDR6, GDDR6X"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Core Clock</label>
                      <input
                        type="text"
                        name="specs.coreClock"
                        value={customPCComponentFormData.specs.coreClock || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                        placeholder="e.g., 2.5 GHz"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">TDP (Watts)</label>
                      <input
                        type="number"
                        name="specs.tdp"
                        value={customPCComponentFormData.specs.tdp || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                      />
                    </div>
                  </div>
                </div>
              )}

              {customPCComponentFormData.category === 'RAM' && (
                <div className="border-t-2 border-black pt-4">
                  <h4 className="text-lg font-semibold text-black mb-4">RAM Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">RAM Type</label>
                      <input
                        type="text"
                        name="specs.ramType"
                        value={customPCComponentFormData.specs.ramType || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                        placeholder="e.g., DDR4, DDR5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Speed</label>
                      <input
                        type="text"
                        name="specs.speed"
                        value={customPCComponentFormData.specs.speed || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                        placeholder="e.g., 3200MHz, 6000MHz"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Capacity</label>
                      <input
                        type="text"
                        name="specs.capacity"
                        value={customPCComponentFormData.specs.capacity || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                        placeholder="e.g., 16GB, 32GB"
                      />
                    </div>
                  </div>
                </div>
              )}

              {customPCComponentFormData.category === 'Motherboard' && (
                <div className="border-t-2 border-black pt-4">
                  <h4 className="text-lg font-semibold text-black mb-4">Motherboard Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">CPU Socket</label>
                      <input
                        type="text"
                        name="specs.cpuSocket"
                        value={customPCComponentFormData.specs.cpuSocket || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                        placeholder="e.g., LGA1700, AM5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Chipset</label>
                      <input
                        type="text"
                        name="specs.chipset"
                        value={customPCComponentFormData.specs.chipset || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                        placeholder="e.g., Z790, B650"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">RAM Type</label>
                      <input
                        type="text"
                        name="specs.ramType"
                        value={customPCComponentFormData.specs.ramType || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                        placeholder="e.g., DDR4, DDR5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">RAM Slots</label>
                      <input
                        type="number"
                        name="specs.ramSlots"
                        value={customPCComponentFormData.specs.ramSlots || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Max RAM</label>
                      <input
                        type="text"
                        name="specs.maxRam"
                        value={customPCComponentFormData.specs.maxRam || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                        placeholder="e.g., 128GB"
                      />
                    </div>
                  </div>
                </div>
              )}

              {customPCComponentFormData.category === 'PowerSupply' && (
                <div className="border-t-2 border-black pt-4">
                  <h4 className="text-lg font-semibold text-black mb-4">Power Supply Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Wattage</label>
                      <input
                        type="number"
                        name="specs.wattage"
                        value={customPCComponentFormData.specs.wattage || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                        placeholder="e.g., 750, 850, 1000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Efficiency</label>
                      <input
                        type="text"
                        name="specs.efficiency"
                        value={customPCComponentFormData.specs.efficiency || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                        placeholder="e.g., Gold, Platinum"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Modular</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="specs.modular"
                          checked={customPCComponentFormData.specs.modular || false}
                          onChange={handleCustomPCComponentInputChange}
                          className="w-4 h-4"
                        />
                        <span>Yes</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {customPCComponentFormData.category === 'ComputerCase' && (
                <div className="border-t-2 border-black pt-4">
                  <h4 className="text-lg font-semibold text-black mb-4">Case Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Case Type</label>
                      <input
                        type="text"
                        name="specs.caseType"
                        value={customPCComponentFormData.specs.caseType || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                        placeholder="e.g., Mid Tower, Full Tower"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Color</label>
                      <input
                        type="text"
                        name="specs.color"
                        value={customPCComponentFormData.specs.color || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">Supported Motherboard</label>
                      <input
                        type="text"
                        name="specs.supportedMotherboard"
                        value={customPCComponentFormData.specs.supportedMotherboard || ''}
                        onChange={handleCustomPCComponentInputChange}
                        className="w-full px-3 py-2 border-2 border-black text-black"
                        placeholder="e.g., ATX, Micro-ATX, Mini-ITX"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Images */}
              <div className="border-t-2 border-black pt-4">
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Component Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomPCComponentImageChange}
                  className="w-full px-3 py-2 border-2 border-black text-black"
                  multiple
                />
                {customPCComponentImagePreview.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {customPCComponentImagePreview.map((preview, index) => (
                      <div key={index} className="relative">
                        <button
                          type="button"
                          onClick={() => handleCustomPCComponentImageRemove(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-24 h-24 object-cover border-2 border-black"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-black text-white font-semibold border-2 border-black hover:bg-gray-800 transition"
                >
                  {customPCComponentFormData.id ? "Update Component" : "Create Component"}
                </button>
                <button
                  type="button"
                  onClick={resetCustomPCComponentForm}
                  className="flex-1 py-3 bg-gray-500 text-white font-semibold border-2 border-gray-500 hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );

  const renderManageDisplays = () => (
    <section className="relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-black">
          Manage Displays <span className="text-sm text-gray-500">({displays.length} total)</span>
        </h2>
        <button
          onClick={() => {
            resetDisplayForm();
            setIsEditMode(false);
            setIsEditingDisplay(true);
          }}
          className="bg-black text-white px-6 py-3 border-2 border-black hover:bg-gray-800 transition flex items-center gap-2"
        >
          <span className="text-xl">+</span> Add New Display
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search displays by name or brand..."
          value={displaySearchTerm}
          onChange={(e) => setDisplaySearchTerm(e.target.value)}
          className="px-4 py-3 border-2 border-black w-full md:w-1/2 text-black"
        />
      </div>

      {/* Displays Grid */}
      <div className="bg-white border-4 border-black p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {filteredDisplays.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDisplays.map((display) => (
              <div key={display._id || display.id || Math.random()} className="border-2 border-black p-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition">
                {/* Display Image */}
                <div className="h-48 mb-4 overflow-hidden border-2 border-black">
                  {display.image ? (
                    <img
                      src={display.image.startsWith('http') ? display.image : `${BASE_URL}/uploads/${display.image}`}
                      alt={display.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                </div>

                {/* Display Info */}
                <h3 className="text-lg font-semibold text-black mb-2">{display?.name}</h3>
                <p className="text-sm text-gray-600 mb-2">Brand: {display?.brand}</p>
                <p className="text-sm text-gray-600 mb-2">Category: {display?.category}</p>
                <p className="text-lg font-bold text-green-600 mb-4">₹{display?.price}</p>

                {/* Specs Preview */}
                {display.specs && (
                  <div className="text-xs text-gray-600 mb-4 space-y-1">
                    {display.specs.size && <p>Size: {display.specs.size}</p>}
                    {display.specs.resolution && <p>Resolution: {display.specs.resolution}</p>}
                    {display.specs.panel && <p>Panel: {display.specs.panel}</p>}
                    {display.specs.refreshRate && <p>Refresh: {display.specs.refreshRate}</p>}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      console.log('Edit button clicked for display:', display);
                      handleDisplayEdit(display);
                    }}
                    className="flex-1 py-2 bg-blue-500 text-white border-2 border-blue-500 hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => display?._id && handleDisplayDelete(display._id)}
                    className="flex-1 py-2 bg-red-500 text-white border-2 border-red-500 hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No displays found.</p>
            <button
              onClick={() => {
                resetDisplayForm();
                setIsEditingDisplay(true);
              }}
              className="bg-black text-white px-6 py-3 border-2 border-black hover:bg-gray-800 transition"
            >
              Add Your First Display
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Display Modal */}
      {isEditingDisplay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white border-4 border-black p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium text-black">
                {isEditMode ? "Edit Display" : "Add New Display"}
              </h3>
              <button
                onClick={resetDisplayForm}
                className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleDisplaySubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={displayFormData.name}
                    onChange={handleDisplayInputChange}
                    className="w-full px-3 py-2 border-2 border-black text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Brand *</label>
                  <input
                    type="text"
                    name="brand"
                    value={displayFormData.brand}
                    onChange={handleDisplayInputChange}
                    className="w-full px-3 py-2 border-2 border-black text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Category *</label>
                  <select
                    name="category"
                    value={displayFormData.category}
                    onChange={handleDisplayInputChange}
                    className="w-full px-3 py-2 border-2 border-black text-black"
                    required
                  >
                    <option value="gaming">Gaming</option>
                    <option value="professional">Professional</option>
                    <option value="ultrawide">Ultrawide</option>
                    <option value="office">Office</option>
                    <option value="portable">Portable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Color</label>
                  <input
                    type="text"
                    name="color"
                    value={displayFormData.color}
                    onChange={handleDisplayInputChange}
                    className="w-full px-3 py-2 border-2 border-black text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={displayFormData.price}
                    onChange={handleDisplayInputChange}
                    className="w-full px-3 py-2 border-2 border-black text-black"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Original Price (₹)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={displayFormData.originalPrice}
                    onChange={handleDisplayInputChange}
                    className="w-full px-3 py-2 border-2 border-black text-black"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={displayFormData.quantity}
                    onChange={handleDisplayInputChange}
                    className="w-full px-3 py-2 border-2 border-black text-black"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">Warranty</label>
                  <input
                    type="text"
                    name="warranty"
                    value={displayFormData.warranty}
                    onChange={handleDisplayInputChange}
                    className="w-full px-3 py-2 border-2 border-black text-black"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-600 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={displayFormData.description}
                    onChange={handleDisplayInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border-2 border-black text-black"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-600">
                    <input
                      type="checkbox"
                      name="inStock"
                      checked={displayFormData.inStock}
                      onChange={handleDisplayInputChange}
                      className="w-4 h-4"
                    />
                    In Stock
                  </label>
                </div>
              </div>

              {/* Specifications */}
              <div>
                <h4 className="text-lg font-semibold text-black mb-4">Specifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">Size (e.g., 27")</label>
                    <input
                      type="text"
                      name="size"
                      value={displayFormData.specs.size}
                      onChange={handleDisplaySpecsChange}
                      className="w-full px-3 py-2 border-2 border-black text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">Resolution</label>
                    <input
                      type="text"
                      name="resolution"
                      value={displayFormData.specs.resolution}
                      onChange={handleDisplaySpecsChange}
                      className="w-full px-3 py-2 border-2 border-black text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">Panel Type</label>
                    <input
                      type="text"
                      name="panel"
                      value={displayFormData.specs.panel}
                      onChange={handleDisplaySpecsChange}
                      className="w-full px-3 py-2 border-2 border-black text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">Refresh Rate</label>
                    <input
                      type="text"
                      name="refreshRate"
                      value={displayFormData.specs.refreshRate}
                      onChange={handleDisplaySpecsChange}
                      className="w-full px-3 py-2 border-2 border-black text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">Response Time</label>
                    <input
                      type="text"
                      name="responseTime"
                      value={displayFormData.specs.responseTime}
                      onChange={handleDisplaySpecsChange}
                      className="w-full px-3 py-2 border-2 border-black text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">Aspect Ratio</label>
                    <input
                      type="text"
                      name="aspectRatio"
                      value={displayFormData.specs.aspectRatio}
                      onChange={handleDisplaySpecsChange}
                      className="w-full px-3 py-2 border-2 border-black text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">Brightness</label>
                    <input
                      type="text"
                      name="brightness"
                      value={displayFormData.specs.brightness}
                      onChange={handleDisplaySpecsChange}
                      className="w-full px-3 py-2 border-2 border-black text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">Contrast Ratio</label>
                    <input
                      type="text"
                      name="contrast"
                      value={displayFormData.specs.contrast}
                      onChange={handleDisplaySpecsChange}
                      className="w-full px-3 py-2 border-2 border-black text-black"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-600 mb-2">Color Gamut</label>
                    <input
                      type="text"
                      name="colorGamut"
                      value={displayFormData.specs.colorGamut}
                      onChange={handleDisplaySpecsChange}
                      className="w-full px-3 py-2 border-2 border-black text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Features (comma-separated)
                </label>
                <input
                  type="text"
                  value={displayFormData.features.join(', ')}
                  onChange={handleDisplayFeaturesChange}
                  className="w-full px-3 py-2 border-2 border-black text-black"
                  placeholder="e.g., HDR, G-Sync, FreeSync"
                />
              </div>

              {/* Ports */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Ports (comma-separated)
                </label>
                <input
                  type="text"
                  value={displayFormData.ports.join(', ')}
                  onChange={handleDisplayPortsChange}
                  className="w-full px-3 py-2 border-2 border-black text-black"
                  placeholder="e.g., HDMI, DisplayPort, USB-C"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Images (you can select multiple)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDisplayImageChange}
                  className="w-full px-3 py-2 border-2 border-black text-black"
                  multiple
                />
                {displayImagePreview.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {displayImagePreview.map((preview, index) => (
                      <div key={index} className="relative">
                        <button
                          type="button"
                          onClick={() => handleDisplayImageRemove(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-24 h-24 object-cover border-2 border-black"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-black text-white font-semibold border-2 border-black hover:bg-gray-800 transition"
                >
                  {isEditMode ? "Update Display" : "Create Display"}
                </button>
                <button
                  type="button"
                  onClick={resetDisplayForm}
                  className="flex-1 py-3 bg-gray-500 text-white font-semibold border-2 border-gray-500 hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-black">Dashboard</h2>
              {dashboardStats ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="p-6 bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="text-xl font-medium text-black">Total Users</h3>
                    <p className="text-2xl font-bold mt-2 text-black">{dashboardStats.totalUsers}</p>
                  </div>
                  <div className="p-6 bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="text-xl font-medium text-black">Total Products</h3>
                    <p className="text-2xl font-bold mt-2 text-black">{dashboardStats.totalProducts}</p>
                  </div>
                  <div className="p-6 bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="text-xl font-medium text-black">Pending Orders</h3>
                    <p className="text-2xl font-bold mt-2 text-black">{dashboardStats.pendingOrders}</p>
                  </div>
                  <div className="p-6 bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="text-xl font-medium text-black">Online Users</h3>
                    <p className="text-2xl font-bold mt-2 text-black">{dashboardStats.totalOnlineUsers}</p>
                  </div>
                </div>
              ) : (
                <p className="text-red-500">Loading dashboard stats...</p>
              )}
              <DashboardGraphs />
            </section>
          </div>
        );

      case 'pending-orders':
        return (
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-black">Pending Orders</h2>
            {error && <p className="error text-red-500">{error}</p>}
            <div className="bg-white border-4 border-black p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <input
                  type="text"
                  placeholder="Search by Order ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-2 border-black p-3 focus:outline-none focus:ring-2 focus:ring-black w-full md:w-1/3 text-black"
                />
                {filteredOrders.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="py-3 px-6 bg-red-500 text-white font-medium hover:bg-red-600 transition border-2 border-red-500"
                  >
                    Delete Selected Orders
                  </button>
                )}
              </div>
              
              {filteredOrders.length > 0 ? (
                <div className="overflow-x-auto rounded-none border-2 border-black">
                  <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full text-sm text-black min-w-[1200px]">
                      <thead className="bg-gray-100 border-b-2 border-black sticky top-0 z-10">
                        <tr>
                          <th className="py-3 px-2 text-center w-12 border-r border-black">
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedOrders(filteredOrders.map(order => order._id));
                                } else {
                                  setSelectedOrders([]);
                                }
                              }}
                              checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                              className="w-4 h-4"
                            />
                          </th>
                          <th className="py-3 px-2 w-40 border-r border-black">Order ID</th>
                          <th className="py-3 px-2 w-48 border-r border-black">Product Details</th>
                          <th className="py-3 px-2 w-64 border-r border-black">User Details</th>
                          <th className="py-3 px-2 w-32 border-r border-black">Payment</th>
                          <th className="py-3 px-2 w-24 border-r border-black">Price (₹)</th>
                          <th className="py-3 px-2 w-28 border-r border-black">Order Date</th>
                          <th className="py-3 px-2 w-32 border-r border-black">Delivery Date</th>
                          <th className="py-3 px-2 w-32 border-r border-black">Status</th>
                          <th className="py-3 px-2 w-32 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr
                            key={order._id}
                            className="border-b border-black hover:bg-gray-50"
                          >
                            {/* Select Checkbox */}
                            <td className="py-3 px-2 text-center border-r border-black">
                              <input
                                type="checkbox"
                                checked={selectedOrders.includes(order._id)}
                                onChange={() => handleSelectOrder(order._id)}
                                className="w-4 h-4"
                              />
                            </td>
                          
                            {/* Order ID */}
                            <td className="py-3 px-2 border-r border-black">
                              <div className="font-mono text-xs" title={order._id}>
                                {order._id.substring(0, 12)}...
                              </div>
                            </td>
                          
                            {/* Product Details */}
                            <td className="py-3 px-2 border-r border-black">
                              <div className="space-y-1">
                                <p className="font-semibold text-sm" title={order.product.name}>
                                  {order.product.name}
                                </p>
                                <p className="text-xs text-gray-600" title={`Code: ${order.product.code}`}>
                                  Code: {order.product.code}
                                </p>
                              </div>
                            </td>
                          
                            {/* User Details */}
                            <td className="py-3 px-2 border-r border-black">
                              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                                <p className="text-xs">
                                  <span className="font-medium">Name:</span> {order.userDetails.name}
                                </p>
                                <p className="text-xs" title={order.userDetails.email}>
                                  <span className="font-medium">Email:</span> {order.userDetails.email}
                                </p>
                                <p className="text-xs">
                                  <span className="font-medium">Phone:</span> {order.userDetails.phoneNumber}
                                </p>
                                <div className="text-xs text-gray-600 mt-1 line-clamp-2" 
                                     title={`${order.userDetails.address.line1}, ${order.userDetails.address.line2}, ${order.userDetails.address.city}, ${order.userDetails.address.state}, ${order.userDetails.address.zip}`}>
                                  <span className="font-medium">Address:</span> {`${order.userDetails.address.line1}, ${order.userDetails.address.city}`}
                                </div>
                              </div>
                            </td>
                          
                            {/* Payment Method */}
                            <td className="py-3 px-2 border-r border-black">
                              <span className="text-xs px-2 py-1 bg-gray-100 border border-black">
                                {order.paymentMethod}
                              </span>
                            </td>
                          
                            {/* Final Price */}
                            <td className="py-3 px-2 font-semibold border-r border-black">
                              ₹{order.totalPrice}
                            </td>
                          
                            {/* Order Date */}
                            <td className="py-3 px-2 text-xs border-r border-black">
                              {new Date(order.date).toLocaleDateString('en-IN')}
                            </td>
                          
                            {/* Delivery Date */}
                            <td className="py-3 px-2 border-r border-black">
                              <input
                                type="date"
                                value={order.deliveryDate && !isNaN(new Date(order.deliveryDate).getTime())
                                  ? new Date(order.deliveryDate).toISOString().split('T')[0]
                                  : ""
                                }
                                onChange={(e) => updateDeliveryDate(order._id, e.target.value)}
                                className="w-full text-xs border-2 border-black p-1 focus:outline-none focus:ring-2 focus:ring-black"
                              />
                            </td>
                              
                            {/* Status */}
                            <td className="py-3 px-2 border-r border-black">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                className="w-full text-xs border-2 border-black p-1 focus:outline-none focus:ring-2 focus:ring-black"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                              
                            {/* Actions */}
                            <td className="py-3 px-2">
                              <div className="flex flex-col sm:flex-row gap-1 justify-center">
                                <button
                                  onClick={() => updateOrderState(order._id, 'confirmed')}
                                  className="px-2 py-1 text-xs bg-green-600 text-white border-2 border-green-600 hover:bg-green-700 transition flex-1 text-center"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => updateOrderState(order._id, 'cancelled')}
                                  className="px-2 py-1 text-xs bg-red-600 text-white border-2 border-red-600 hover:bg-red-700 transition flex-1 text-center"
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-black">
                  <p className="text-gray-600">No pending orders found.</p>
                </div>
              )}
            </div>
          </section>
        );

      case 'manage-users':
        return (
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-black">Manage Users</h2>
            <div className="bg-white border-4 border-black p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              {users && users.length > 0 ? (
                <div className="overflow-x-auto max-h-[150px] overflow-y-auto">
                  <table className="w-full text-left border-collapse border-2 border-black">
                    <thead className="bg-gray-100 border-b-2 border-black">
                      <tr>
                        <th className="p-3 text-black border-r border-black">Username</th>
                        <th className="p-3 text-black border-r border-black">Email</th>
                        <th className="p-3 text-black border-r border-black">Phone</th>
                        <th className="p-3 text-black">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b border-black">
                          <td className="p-3 border-r border-black">{user.name}</td>
                          <td className="p-3 border-r border-black">{user.email}</td>
                          <td className="p-3 border-r border-black">{user.phoneNumber}</td>
                          <td className="p-3 flex space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="bg-blue-500 text-white px-3 py-1 border-2 border-blue-500 hover:bg-blue-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="bg-red-500 text-white px-3 py-1 border-2 border-red-500 hover:bg-red-600"
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
                <p className="text-gray-600">No users found. Please add users.</p>
              )}
            </div>

            {editingUser && (
              <form onSubmit={handleUpdateUser} className="mt-6 bg-white border-4 border-black p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xl font-semibold mb-2 text-black">Edit User</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    name="username"
                    value={editedUser.username}
                    onChange={handleInputChange}
                    className="p-3 border-2 border-black text-black"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    value={editedUser.email}
                    onChange={handleInputChange}
                    className="p-3 border-2 border-black text-black"
                    required
                  />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={editedUser.phoneNumber}
                    onChange={handleInputChange}
                    className="p-3 border-2 border-black text-black"
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    value={editedUser.password}
                    onChange={handleInputChange}
                    className="p-3 border-2 border-black text-black"
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 border-2 border-green-500 hover:bg-green-600"
                  >
                    Update User
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="bg-gray-500 text-white px-4 py-2 border-2 border-gray-500 hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <form onSubmit={handleAddUser} className="mt-6 bg-white border-4 border-black p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-xl font-semibold mb-2 text-black">Add New User</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Username"
                  value={newUser.name}
                  onChange={handleInputChange}
                  className="p-3 border-2 border-black text-black"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  className="p-3 border-2 border-black text-black"
                  required
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-black text-black pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={newUser.phoneNumber}
                  onChange={handleInputChange}
                  className="p-3 border-2 border-black text-black"
                  required
                />
              </div>
              <button
                type="submit"
                className="mt-4 bg-green-500 text-white px-4 py-2 border-2 border-green-500 hover:bg-green-600"
              >
                Add User
              </button>
            </form>
          </section>
        );

      case 'discount-codes':
        return <DiscountCode />;

      case 'manage-accessories':
        return <ManageAccessories />;

      case 'manage-custom-pc': // Add this new case
        return renderCustomPCComponents();

      case 'manage-displays':
        return renderManageDisplays();

      case 'manage-products':
        return (
          <section className="relative">
            <h2 className="text-2xl font-semibold mb-4 text-black">
              Manage Products{" "}
              <span className="text-2x1">({dashboardStats?.totalProducts})</span>
            </h2>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-3 border-2 border-black w-full md:w-1/2 text-black"
              />
            </div>

            <div className="bg-white border-4 border-black p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 gap-6 md:grid-cols-2 justify-items-center">
              {categories && categories.length > 0 ? (
                categories.map((category) => {
                  const filteredProducts = Array.isArray(products)
                    ? products.filter(product =>
                      product.type === category &&
                      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.code.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    : [];

                  return (
                    <div key={category} className="bg-white border-4 border-black p-6 rounded-none w-full max-w-full md:max-w-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-medium mb-4 text-black">{category}</h3>
                        <div className="relative bg-white border-2 border-black p-6 w-36 h-16 md:w-40 md:h-18 flex justify-center items-center hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition duration-300">
                          {!isEditing && (
                            <button
                              onClick={() => {
                                setIsEditing(true)
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
                                  keyFeatures: [{ title: "", description: "" }],
                                  specifications: [{ title: "", specs: [{ name: "", value: "" }] }],
                                  additionalImages: [],
                                  videos: [{ title: "", url: "" }],
                                });
                              }}
                              className="bg-black text-white p-4 w-10 h-10 rounded-full flex justify-center items-center text-3xl font-bold hover:bg-gray-800 transition transform hover:scale-110"
                            >
                              +
                            </button>
                          )}
                        </div>
                      </div>
                      {filteredProducts.length > 0 ? (
                        <>
                          <p className="text-gray-600 mb-4">Total Products: {filteredProducts.length}</p>
                          <ul className="space-y-4" style={{ maxHeight: 'calc(3 * 10rem)', overflowY: 'auto' }}>
                            {filteredProducts.map((product) => (
                              <li
                                key={product._id}
                                className="p-4 bg-white border-2 border-black flex flex-col md:flex-row justify-between items-center space-x-0 md:space-x-4 space-y-4 md:space-y-0"
                              >
                                <div className="flex-shrink-0">
                                  {product.image && Array.isArray(product.image) && product.image.length > 0 && (
                                    <img
                                      src={`${BASE_URL}/uploads/${product.image[0].split(/[\\/]/).pop()}`}
                                      alt={product.name}
                                      loading="lazy"
                                      className="w-16 h-16 object-cover border-2 border-black"
                                    />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-md font-semibold text-black">{product.type}</h3>
                                  <h4 className="text-lg font-semibold text-black">{product.name}</h4>
                                  <p className="text-sm text-gray-600">{product.description}</p>
                                  <p className="text-sm font-medium text-green-600">Price: ₹{product.price}</p>
                                  <p className="text-sm text-gray-500">Category: {product.category}</p>
                                </div>
                                <div className="space-x-2">
                                  <button
                                    onClick={() => {
                                      const formattedDate = product.dateAdded.split("T")[0];
                                      const processedImage = Array.isArray(product.image)
                                        ? product.image.map((img) =>
                                          img.includes("uploads")
                                            ? `${BASE_URL}/uploads/${img.split(/[\\/]/).pop()}`
                                            : img
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
                                        stock: product.inStock ? "yes" : "no",
                                        code: product.code,
                                        discount: product.discount,
                                        bonuses: product.bonuses,
                                        dateAdded: formattedDate,
                                        popularity: product.popularity,
                                        otherTechnicalDetails: Array.isArray(product.otherTechnicalDetails) 
                                          ? product.otherTechnicalDetails 
                                          : [{ name: "", value: "" }],
                                        notes: Array.isArray(product.notes) ? product.notes : [""],
                                        keyFeatures: (() => {
  try {
    // If it's already an array
    if (Array.isArray(product.keyFeatures)) {
      return product.keyFeatures.map(feature => {
        if (feature && typeof feature === 'object') {
          return {
            title: feature.title || "",
            description: feature.description || ""
          };
        }
        return { title: "", description: "" };
      });
    }
    // If it's a string, try to parse it
    if (typeof product.keyFeatures === 'string') {
      try {
        const parsed = JSON.parse(product.keyFeatures);
        if (Array.isArray(parsed)) {
          return parsed.map(f => ({
            title: f.title || "",
            description: f.description || ""
          }));
        }
      } catch (e) {
        console.log("Error parsing keyFeatures string:", e);
      }
    }
    // If product has keyFeatures in specs (checking alternative location)
    if (product.specs && product.specs.keyFeatures) {
      const specsKeyFeatures = product.specs.keyFeatures;
      if (Array.isArray(specsKeyFeatures)) {
        return specsKeyFeatures.map(f => ({
          title: f.title || "",
          description: f.description || ""
        }));
      }
      if (typeof specsKeyFeatures === 'string') {
        try {
          const parsed = JSON.parse(specsKeyFeatures);
          if (Array.isArray(parsed)) {
            return parsed.map(f => ({
              title: f.title || "",
              description: f.description || ""
            }));
          }
        } catch (e) {
          console.log("Error parsing specs.keyFeatures:", e);
        }
      }
    }
  } catch (e) {
    console.log("Error in keyFeatures processing:", e);
  }
  return [{ title: "", description: "" }];
})(),

specifications: (() => {
  try {
    // If it's already an array
    if (Array.isArray(product.specifications)) {
      return product.specifications.map(spec => {
        if (spec && typeof spec === 'object') {
          return {
            title: spec.title || "",
            specs: Array.isArray(spec.specs) 
              ? spec.specs.map(s => ({ name: s.name || "", value: s.value || "" }))
              : [{ name: "", value: "" }]
          };
        }
        return { title: "", specs: [{ name: "", value: "" }] };
      });
    }
    // If it's a string, try to parse it
    if (typeof product.specifications === 'string') {
      try {
        const parsed = JSON.parse(product.specifications);
        if (Array.isArray(parsed)) {
          return parsed.map(s => ({
            title: s.title || "",
            specs: Array.isArray(s.specs) 
              ? s.specs.map(sp => ({ name: sp.name || "", value: sp.value || "" }))
              : [{ name: "", value: "" }]
          }));
        }
      } catch (e) {
        console.log("Error parsing specifications string:", e);
      }
    }
    // If product has specifications in specs (checking alternative location)
    if (product.specs && product.specs.specifications) {
      const specsSpecifications = product.specs.specifications;
      if (Array.isArray(specsSpecifications)) {
        return specsSpecifications.map(s => ({
          title: s.title || "",
          specs: Array.isArray(s.specs) 
            ? s.specs.map(sp => ({ name: sp.name || "", value: sp.value || "" }))
            : [{ name: "", value: "" }]
        }));
      }
      if (typeof specsSpecifications === 'string') {
        try {
          const parsed = JSON.parse(specsSpecifications);
          if (Array.isArray(parsed)) {
            return parsed.map(s => ({
              title: s.title || "",
              specs: Array.isArray(s.specs) 
                ? s.specs.map(sp => ({ name: sp.name || "", value: sp.value || "" }))
                : [{ name: "", value: "" }]
            }));
          }
        } catch (e) {
          console.log("Error parsing specs.specifications:", e);
        }
      }
    }
  } catch (e) {
    console.log("Error in specifications processing:", e);
  }
  return [{ title: "", specs: [{ name: "", value: "" }] }];
})(),

                                        videos: (() => {
                                          try {
                                            if (Array.isArray(product.videos)) {
                                              return product.videos.map(video => {
                                                if (video && typeof video === 'object') {
                                                  return {
                                                    title: video.title || "",
                                                    url: video.url || ""
                                                  };
                                                }
                                                return { title: "", url: "" };
                                              });
                                            }
                                            if (typeof product.videos === 'string') {
                                              const parsed = JSON.parse(product.videos);
                                              if (Array.isArray(parsed)) {
                                                return parsed.map(v => ({
                                                  title: v.title || "",
                                                  url: v.url || ""
                                                }));
                                              }
                                            }
                                          } catch (e) {
                                            console.log("Error parsing videos:", e);
                                          }
                                          return [{ title: "", url: "" }];
                                        })(),             
                                        additionalImages: product.additionalImages || [],
                                        condition: product.condition,
                                        cpu: product.specs.cpu,
                                        graphiccard: product.specs.graphiccard || product.specs.GraphicCard,
                                        display: product.specs.display,
                                        os: product.specs.os,
                                        platform: product.specs.platform,
                                        motherboard: product.specs.motherboard,
                                        ram: product.specs.ram,
                                        ramOptions: Array.isArray(product.specs.ramOptions) ? product.specs.ramOptions : [],
                                        storage: product.specs.storage,
                                        storage1Options: Array.isArray(product.specs.storage1Options) ? product.specs.storage1Options : [],
                                        storage2Options: Array.isArray(product.specs.storage2Options) ? product.specs.storage2Options : [],
                                        liquidcooler: product.specs.liquidcooler,
                                        smps: product.specs.smps,
                                        cabinet: product.specs.cabinet,
                                        type: product.type,
                                      })
                                      setImagePreview(processedImage);
                                      setIsEditing(true)
                                    }}
                                    className="py-1 px-3 bg-blue-500 text-white border-2 border-blue-500 hover:bg-blue-600 transition"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(product._id, 'prebuild')}
                                    className="py-1 px-3 bg-red-500 text-white border-2 border-red-500 hover:bg-red-600 transition"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                          <p className="text-gray-600 text-lg">No products available in this category.</p>
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setFormData({
                                id: null,
                                type: category,
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
                                keyFeatures: [{ title: "", description: "" }],
                                specifications: [{ title: "", specs: [{ name: "", value: "" }] }],
                                additionalImages: [],
                                videos: [{ title: "", url: "" }],
                              });
                            }}
                            className="bg-black text-white px-6 py-3 rounded-none text-lg font-semibold hover:bg-gray-800 transition border-2 border-black"
                          >
                            ➕ Add First Product
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <p className="text-gray-600 text-lg">No products available.</p>
                  <button
                    onClick={() => {
                      setIsEditing(true);
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
                        keyFeatures: [{ title: "", description: "" }],
                        specifications: [{ title: "", specs: [{ name: "", value: "" }] }],
                        additionalImages: [],
                        videos: [{ title: "", url: "" }],
                      });
                    }}
                    className="bg-black text-white px-6 py-3 rounded-none text-lg font-semibold hover:bg-gray-800 transition border-2 border-black"
                  >
                    ➕ Add First Product
                  </button>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
                <div className="bg-white border-4 border-black p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full flex flex-col justify-between h-[90vh]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-medium text-black">{formData.id ? "Edit Product" : "Add Product"}</h3>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <form onSubmit={handleProductSubmit} encType="multipart/form-data" className="flex-grow flex flex-col space-y-4 overflow-y-auto pr-2">
                    <div>
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Product Type</label>
                      <select
                        name="type"
                        value={formData.type || ""}
                        onChange={handleFormChange}
                        className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                        required
                      >
                        <option value="" disabled>Select Product Type</option>
                        <option value="Pre-Built PC">Pre-Built PC</option>
                        <option value="Office PC">Office PC</option>
                        <option value="Refurbished Laptop">Refurbished Laptop</option>
                        <option value="Mini PC">Mini PC</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Product Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleFormChange}
                        className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Product Image</label>
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                        multiple
                      />
                      {imagePreview && imagePreview.length > 0 && (
                        <div className="mt-4 flex flex-wrap">
                          {imagePreview.map((preview, index) => (
                            <div key={index} className="relative mb-1 mr-2">
                              <button
                                type="button"
                                onClick={() => handleImageRemove(index)}
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                              >
                                X
                              </button>
                              <img
                                key={index}
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                loading="lazy"
                                className="max-w-xs max-h-32 border-2 border-black"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Price</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price || ""}
                        onChange={handleFormChange}
                        className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Original Price</label>
                      <input
                        type="number"
                        name="originalPrice"
                        value={formData.originalPrice || ""}
                        onChange={handleFormChange}
                        className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Brand</label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand || ""}
                        onChange={handleFormChange}
                        className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Category</label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category || ""}
                        onChange={handleFormChange}
                        className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Description</label>
                      <textarea
                        name="description"
                        value={formData.description || ""}
                        onChange={handleFormChange}
                        className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Stock</label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="stock"
                            value="yes"
                            checked={formData.stock === "yes"}
                            onChange={handleFormChange}
                            className="w-4 h-4"
                          />
                          <span>Yes</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="stock"
                            value="no"
                            checked={formData.stock === "no"}
                            onChange={handleFormChange}
                            className="w-4 h-4"
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Code</label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code || ""}
                        onChange={handleFormChange}
                        className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Discount</label>
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount || ""}
                        onChange={handleFormChange}
                        className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Bonuses</label>
                      <textarea
                        name="bonuses"
                        placeholder="e.g., free accessories, extended warranty"
                        value={formData.bonuses || ""}
                        onChange={handleFormChange}
                        className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Product Date</label>
                      <input
                        type="date"
                        name="dateAdded"
                        value={formData.dateAdded || ""}
                        onChange={handleFormChange}
                        className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Popularity</label>
                      <input
                        type="number"
                        name="popularity"
                        value={formData.popularity || ""}
                        onChange={handleFormChange}
                        className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Condition</label>
                      <input
                        type="text"
                        name="condition"
                        value={formData.condition || ""}
                        onChange={handleFormChange}
                        className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">CPU</label>
                      <input
                        type="text"
                        name="cpu"
                        placeholder="e.g., Intel i5, Ryzen 7"
                        value={formData.cpu || ""}
                        onChange={handleFormChange}
                        className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Graphic Card</label>
                      <input
                        type="text"
                        name="graphiccard"
                        placeholder="e.g., Arc A380 - Intel 6GB"
                        value={formData.graphiccard || ""}
                        onChange={handleFormChange}
                        className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                      />
                    </div>

                    {["Mini PC", "Pre-Built PC", "Office PC"].includes(formData.type) && (
                      <>
                        <div>
                          <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Platform</label>
                          <input
                            type="text"
                            name="platform"
                            placeholder="e.g., AMD, Intel"
                            value={formData.platform || ""}
                            onChange={handleFormChange}
                            className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Motherboard</label>
                          <input
                            type="text"
                            name="motherboard"
                            placeholder="e.g., MSI B450 Tomahawk"
                            value={formData.motherboard || ""}
                            onChange={handleFormChange}
                            className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                          />
                        </div>

                        {["Mini PC", "Office PC"].includes(formData.type) && (
                          <>
                            <div>
                              <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">RAM</label>
                              <input
                                type="text"
                                name="ram"
                                placeholder="e.g., 8GB, 16GB"
                                value={formData.ram || ""}
                                onChange={handleFormChange}
                                className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Storage</label>
                              <input
                                type="text"
                                name="storage"
                                placeholder="e.g., 512GB SSD, 1TB HDD"
                                value={formData.storage || ""}
                                onChange={handleFormChange}
                                className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                              />
                            </div>
                          </>
                        )}

                        <div>
                          <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">SMPS</label>
                          <input
                            type="text"
                            name="smps"
                            placeholder="e.g., Deepcool - PK450D Bronze"
                            value={formData.smps || ""}
                            onChange={handleFormChange}
                            className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Cabinet</label>
                          <input
                            type="text"
                            name="cabinet"
                            placeholder="e.g., NZXT H510"
                            value={formData.cabinet || ""}
                            onChange={handleFormChange}
                            className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                          />
                        </div>

                        {formData.type === "Pre-Built PC" && (
                          <>
                            <div>
                              <h3 className="text-lg font-semibold mb-4 text-black">RAM Configurations</h3>
                              {(formData.ramOptions || []).map((ram, index) => (
                                <div key={index} className="grid grid-cols-2 gap-4 items-center mb-6">
                                  <div>
                                    <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-1">RAM</label>
                                    <input
                                      type="text"
                                      name="value"
                                      placeholder="e.g., 8GB, 16GB"
                                      value={ram.value || ""}
                                      onChange={(e) => handleDynamicChange(e, index, "ramOptions")}
                                      className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-1">Price</label>
                                    <input
                                      type="number"
                                      name={`ramPrice_${index}`}
                                      placeholder="e.g., 14000"
                                      value={ram.price || ""}
                                      onChange={(e) => handleDynamicChange(e, index, "ramOptions")}
                                      className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <button
                                      type="button"
                                      onClick={() => removeField("ramOptions", index)}
                                      className="px-4 py-2 bg-red-500 text-white border-2 border-red-500 hover:bg-red-600 transition"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addField("ramOptions")}
                                className="mt-4 px-6 py-3 bg-black text-white border-2 border-black hover:bg-gray-800 transition"
                              >
                                Add RAM Option
                              </button>
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold mb-4 text-black">Storage1 Configurations</h3>
                              {formData.storage1Options?.map((storage, index) => (
                                <div key={index} className="grid grid-cols-2 gap-4 items-center mb-6">
                                  <div>
                                    <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-1">Storage1</label>
                                    <input
                                      type="text"
                                      name={`storage1_${index}`}
                                      placeholder="e.g., 512GB SSD, 1TB HDD"
                                      value={storage.value || ""}
                                      onChange={(e) => handleDynamicChange(e, index, "storage1Options")}
                                      className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-1">Price</label>
                                    <input
                                      type="number"
                                      name={`storage1Price_${index}`}
                                      placeholder="e.g., 14000"
                                      value={storage.price || ""}
                                      onChange={(e) => handleDynamicChange(e, index, "storage1Options")}
                                      className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <button
                                      type="button"
                                      onClick={() => removeField("storage1Options", index)}
                                      className="px-4 py-2 bg-red-500 text-white border-2 border-red-500 hover:bg-red-600 transition"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addField("storage1Options")}
                                className="mt-4 px-6 py-3 bg-black text-white border-2 border-black hover:bg-gray-800 transition"
                              >
                                Add Storage 1 Option
                              </button>
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold mb-4 text-black">Storage2 Configurations</h3>
                              {formData.storage2Options?.map((storage, index) => (
                                <div key={index} className="grid grid-cols-2 gap-4 items-center mb-6">
                                  <div>
                                    <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-1">Storage2</label>
                                    <input
                                      type="text"
                                      name={`storage2_${index}`}
                                      placeholder="e.g., 512GB SSD, 1TB HDD"
                                      value={storage.value || ""}
                                      onChange={(e) => handleDynamicChange(e, index, "storage2Options")}
                                      className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-1">Price</label>
                                    <input
                                      type="number"
                                      name={`storage2Price_${index}`}
                                      placeholder="e.g., 14000"
                                      value={storage.price || ""}
                                      onChange={(e) => handleDynamicChange(e, index, "storage2Options")}
                                      className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <button
                                      type="button"
                                      onClick={() => removeField("storage2Options", index)}
                                      className="px-4 py-2 bg-red-500 text-white border-2 border-red-500 hover:bg-red-600 transition"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => addField("storage2Options")}
                                className="mt-4 px-6 py-3 bg-black text-white border-2 border-black hover:bg-gray-800 transition"
                              >
                                Add Storage 2 Option
                              </button>
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Liquid Cooler</label>
                              <input
                                type="text"
                                name="liquidcooler"
                                placeholder="e.g., Cooler Master Hyper 212"
                                value={formData.liquidcooler || ""}
                                onChange={handleFormChange}
                                className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                              />
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {formData.type === "Refurbished Laptop" && (
                      <>
                        <div>
                          <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">RAM</label>
                          <input
                            type="text"
                            name="ram"
                            placeholder="e.g., 8GB, 16GB"
                            value={formData.ram || ""}
                            onChange={handleFormChange}
                            className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Storage</label>
                          <input
                            type="text"
                            name="storage"
                            placeholder="e.g., 256GB SSD, 1TB HDD"
                            value={formData.storage || ""}
                            onChange={handleFormChange}
                            className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Display</label>
                          <input
                            type="text"
                            name="display"
                            placeholder="e.g., 15.6-inch FHD"
                            value={formData.display || ""}
                            onChange={handleFormChange}
                            className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Operating System</label>
                          <input
                            type="text"
                            name="os"
                            placeholder="e.g., Windows 10, Linux"
                            value={formData.os || ""}
                            onChange={handleFormChange}
                            className="w-full px-3 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                          />
                        </div>
                      </>
                    )}

                    {/* ADDITIONAL IMAGES SECTION */}
                    <div className="border-t-2 border-black pt-4 mt-4">
                      <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                        <FaImages className="text-green-500" /> Additional Images
                      </h3>

                      <div>
                        <label className="block text-sm font-bold text-gray-600 mb-2">
                          Upload Additional Images
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAdditionalImagesChange}
                          className="w-full px-3 py-2 border-2 border-black text-black"
                          multiple
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          You can select multiple images. These will be shown in the product gallery.
                        </p>
                      </div>

                      {/* Preview of additional images */}
                      {formData.additionalImages && formData.additionalImages.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-bold text-gray-700 mb-2">Selected Images: {formData.additionalImages.length}</p>
                          <div className="flex flex-wrap gap-2">
                            {Array.from(formData.additionalImages).map((file, index) => {
                              // Check if the item is a File object or a string path
                              const isFileObject = file instanceof File;
                              const imageUrl = isFileObject 
                                ? URL.createObjectURL(file) 
                                : (typeof file === 'string' ? file : ''); // If it's a string, use it directly as URL
                              
                              // Only render if we have a valid URL
                              if (!imageUrl) return null;
                              
                              return (
                                <div key={index} className="relative">
                                  <img
                                    src={imageUrl}
                                    alt={`Additional ${index + 1}`}
                                    className="w-20 h-20 object-cover border-2 border-black"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '/placeholder-image.jpg';
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleAdditionalImageRemove(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                  >
                                    ×
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* VIDEOS SECTION */}
                    <div className="border-t-2 border-black pt-4 mt-4">
                      <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                        <FaVideo className="text-purple-500" /> Product Videos
                      </h3>
                    
                        {formData.videos && Array.isArray(formData.videos) && formData.videos.length > 0 ? (
                          formData.videos.map((video, index) => (
                            <div key={index} className="mb-4 p-4 bg-gray-50 border-2 border-black">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-bold text-gray-700">Video {index + 1}</h4>
                                {formData.videos.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeVideo(index)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <FaTimes />
                                  </button>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 gap-3">
                                <div>
                                  <label className="block text-xs font-bold text-gray-600 mb-1">Video Title</label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Product Overview, Unboxing"
                                    value={video?.title || ''}
                                    onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-black text-black"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-gray-600 mb-1">Video URL</label>
                                  <input
                                    type="url"
                                    placeholder="YouTube or Vimeo URL"
                                    value={video?.url || ''}
                                    onChange={(e) => handleVideoChange(index, 'url', e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-black text-black"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Supported platforms: YouTube, Vimeo
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm mb-4">No videos added yet. Click the button below to add one.</p>
                        )}

                      <button
                        type="button"
                        onClick={addVideo}
                        className="px-4 py-2 bg-green-600 text-white border-2 border-green-600 hover:bg-green-700 transition"
                      >
                        + Add Another Video
                      </button>
                    </div>

                    {/* KEY FEATURES SECTION */}
                    <div className="border-t-2 border-black pt-4 mt-4">
                      <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                        <FaStar className="text-yellow-500" /> Key Features
                      </h3>

                      {formData.keyFeatures?.map((feature, index) => (
                        <div key={index} className="mb-4 p-4 bg-gray-50 border-2 border-black">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-bold text-gray-700">Feature {index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => {
                                const updatedFeatures = [...formData.keyFeatures];
                                updatedFeatures.splice(index, 1);
                                setFormData({ ...formData, keyFeatures: updatedFeatures });
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTimes />
                            </button>
                          </div>
                            
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Feature Title</label>
                              <input
                                type="text"
                                placeholder="e.g., Powerful Performance"
                                value={feature.title}
                                onChange={(e) => {
                                  const updatedFeatures = [...formData.keyFeatures];
                                  updatedFeatures[index].title = e.target.value;
                                  setFormData({ ...formData, keyFeatures: updatedFeatures });
                                }}
                                className="w-full px-3 py-2 border-2 border-black text-black"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Feature Description</label>
                              <textarea
                                placeholder="Describe this feature in detail..."
                                value={feature.description}
                                onChange={(e) => {
                                  const updatedFeatures = [...formData.keyFeatures];
                                  updatedFeatures[index].description = e.target.value;
                                  setFormData({ ...formData, keyFeatures: updatedFeatures });
                                }}
                                rows="2"
                                className="w-full px-3 py-2 border-2 border-black text-black"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          keyFeatures: [...(formData.keyFeatures || []), { title: "", description: "" }]
                        })}
                        className="px-4 py-2 bg-green-600 text-white border-2 border-green-600 hover:bg-green-700 transition"
                      >
                        + Add Key Feature
                      </button>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-black">Other Technical Details</h3>
                      {formData.otherTechnicalDetails && formData.otherTechnicalDetails.length > 0
                        ? formData.otherTechnicalDetails.map((detail, index) => (
                          <div key={index} className="flex items-center gap-4 mb-2">
                            <input
                              type="text"
                              name="name"
                              placeholder="Detail Name (e.g., WIFI)"
                              value={detail.name}
                              onChange={(e) => handleOtherTechnicalDetailsChange(index, "name", e.target.value)}
                              className="w-1/2 px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                            />
                            <input
                              type="text"
                              name="value"
                              placeholder="Detail Value (e.g., 802.11ax Wi-Fi 6)"
                              value={detail.value}
                              onChange={(e) => handleOtherTechnicalDetailsChange(index, "value", e.target.value)}
                              className="w-1/2 px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
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
                        className="px-4 py-2 mt-2 text-white bg-black border-2 border-black hover:bg-gray-800"
                      >
                        Add Detail
                      </button>
                    </div>

                    {/* GROUPED SPECIFICATIONS SECTION */}
                    <div className="border-t-2 border-black pt-4 mt-4">
                      <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                        <FaMicrochip className="text-indigo-500" /> Grouped Specifications
                      </h3>
                                          
                      {formData.specifications?.map((group, groupIndex) => (
                        <div key={groupIndex} className="mb-6 p-4 bg-gray-50 border-2 border-black">
                          <div className="flex justify-between items-center mb-3">
                            <input
                              type="text"
                              placeholder="Group Title (e.g., Processor, Memory)"
                              value={group.title}
                              onChange={(e) => {
                                const updatedGroups = [...formData.specifications];
                                updatedGroups[groupIndex].title = e.target.value;
                                setFormData({ ...formData, specifications: updatedGroups });
                              }}
                              className="flex-1 px-3 py-2 border-2 border-black text-black mr-2"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updatedGroups = formData.specifications.filter((_, i) => i !== groupIndex);
                                setFormData({ ...formData, specifications: updatedGroups });
                              }}
                              className="px-3 py-2 bg-red-500 text-white border-2 border-red-500 hover:bg-red-600"
                            >
                              Remove Group
                            </button>
                          </div>
                            
                          {group.specs?.map((spec, specIndex) => (
                            <div key={specIndex} className="flex items-center gap-2 mb-2">
                              <input
                                type="text"
                                placeholder="Spec Name"
                                value={spec.name}
                                onChange={(e) => {
                                  const updatedGroups = [...formData.specifications];
                                  updatedGroups[groupIndex].specs[specIndex].name = e.target.value;
                                  setFormData({ ...formData, specifications: updatedGroups });
                                }}
                                className="flex-1 px-3 py-2 border-2 border-black text-black"
                              />
                              <input
                                type="text"
                                placeholder="Spec Value"
                                value={spec.value}
                                onChange={(e) => {
                                  const updatedGroups = [...formData.specifications];
                                  updatedGroups[groupIndex].specs[specIndex].value = e.target.value;
                                  setFormData({ ...formData, specifications: updatedGroups });
                                }}
                                className="flex-1 px-3 py-2 border-2 border-black text-black"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedGroups = [...formData.specifications];
                                  updatedGroups[groupIndex].specs = group.specs.filter((_, i) => i !== specIndex);
                                  setFormData({ ...formData, specifications: updatedGroups });
                                }}
                                className="px-3 py-2 bg-red-500 text-white border-2 border-red-500 hover:bg-red-600"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ))}
                          
                          <button
                            type="button"
                            onClick={() => {
                              const updatedGroups = [...formData.specifications];
                              updatedGroups[groupIndex].specs.push({ name: "", value: "" });
                              setFormData({ ...formData, specifications: updatedGroups });
                            }}
                            className="mt-2 px-3 py-1 bg-blue-500 text-white border-2 border-blue-500 hover:bg-blue-600 text-sm"
                          >
                            + Add Spec
                          </button>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          specifications: [...(formData.specifications || []), { title: "", specs: [{ name: "", value: "" }] }]
                        })}
                        className="px-4 py-2 bg-green-600 text-white border-2 border-green-600 hover:bg-green-700 transition"
                      >
                        + Add Specification Group
                      </button>
                    </div>



                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-black">Notes</h3>
                      {formData.notes && formData.notes.length > 0 ? (
                        formData.notes.map((note, index) => (
                          <div key={index} className="flex items-center gap-4 mb-2">
                            <textarea
                              name="note"
                              placeholder="Note"
                              value={note}
                              onChange={(e) => handleNotesChange(index, e.target.value)}
                              className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
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
                        <p>No notes available</p>
                      )}

                      <button
                        type="button"
                        onClick={addNote}
                        className="px-4 py-2 mt-2 text-white bg-black border-2 border-black hover:bg-gray-800"
                      >
                        Add Note
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-black text-white font-semibold border-2 border-black hover:bg-gray-800 transition"
                    >
                      {formData.id ? "Update Product" : "Create Product"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </section>
        );

      case 'newsletter':
        return (
          <section className="mb-6">
            <div className="mx-auto bg-white border-4 border-black rounded-none p-6">
              <h1 className="text-2xl font-bold mb-6 text-black">
                Subscribers <span className="text-2x1">({subscribers.length})</span>
              </h1>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border-2 border-black">
                  <thead className="bg-gray-100 border-b-2 border-black">
                    <tr>
                      <th className="border-r border-black p-3 text-left text-black">Email</th>
                      <th className="p-3 text-left text-black">Subscribed At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.length > 0 ? (
                      subscribers.map((subscriber) => (
                        <tr key={subscriber._id} className="hover:bg-gray-50 border-b border-black">
                          <td className="border-r border-black p-3 text-black">{subscriber.email}</td>
                          <td className="p-3 text-black">
                            {new Date(subscriber.subscribedAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="2"
                          className="p-3 text-center text-gray-600"
                        >
                          No subscribers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 text-black">Send a Message</h2>
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Recipient Email (comma-separated for multiple)"
                    className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                    required
                  />
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject"
                    className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                    required
                  />
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Message"
                    className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                    rows="5"
                    required
                  ></textarea>
                  <button className="bg-black text-white p-3 border-2 border-black hover:bg-gray-800">
                    Send Message
                  </button>
                </form>
              </div>

              <div className="border-2 border-black mt-8">
                <div
                  className="flex items-center justify-between p-4 bg-gray-100 cursor-pointer"
                  onClick={toggleHistory}
                >
                  <h2 className="text-xl font-bold text-black">Message History</h2>
                  <span>
                    {isCollapsed ? <FaArrowUp /> : <FaArrowDown />}
                  </span>
                </div>

                {!isCollapsed && (
                  <div className="p-4 space-y-4">
                    {messageHistory.map((msg) => (
                      <div
                        key={msg._id}
                        className="p-4 border-2 border-black"
                      >
                        <h3 className="font-bold text-black">{msg.subject}</h3>
                        <p className="text-gray-700">{msg.message}</p>
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
        );

      case 'device-info':
        return (
          <section className="my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold text-black">
                Device Information{" "}
                <span className="text-sm text-gray-500">({deviceInfo.length} entries)</span>
              </h3>
              <div className="flex items-center space-x-4">
                <button onClick={toggleBox} className="text-gray-600">
                  {isOpen ? <FaArrowUp /> : <FaArrowDown />}
                </button>
                {deviceInfo.length > 0 && (
                  <button
                    onClick={handleDeletedeviceinformation}
                    className="bg-red-500 text-white py-2 px-4 border-2 border-red-500 hover:bg-red-600"
                  >
                    Delete All
                  </button>
                )}
              </div>
            </div>

            {isOpen && (
              <ul className="space-y-4">
                {deviceInfo.length > 0 ? (
                  deviceInfo.map((info, index) => (
                    <li
                      key={index}
                      className="bg-white border-4 border-black p-6 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-300"
                    >
                      <p className="text-lg text-gray-700">
                        User Agent: <span className="font-medium text-black">{info.userAgent}</span>
                      </p>
                      <p className="text-lg text-gray-700">
                        Platform: <span className="font-medium text-black">{info.platform}</span>
                      </p>
                      <p className="text-lg text-gray-700">
                        Screen Resolution:{" "}
                        <span className="font-medium text-black">
                          {info.screenResolution.width}x{info.screenResolution.height}
                        </span>
                      </p>
                      <p className="text-lg text-gray-700">
                        Created At:{" "}
                        <span className="font-medium text-black">
                          {new Date(info.createdAt).toLocaleString()}
                        </span>
                      </p>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-600">No device information available.</p>
                )}
              </ul>
            )}
          </section>
        );

      case 'location-info':
        return (
          <section className="my-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold text-black">
                Location Information{" "}
                <span className="text-sm text-gray-500">({locationInfo.length} entries)</span>
              </h3>
              <div className="flex items-center space-x-4">
                <button onClick={toggleBox1} className="text-gray-600">
                  {isOpenforLocation ? <FaArrowUp /> : <FaArrowDown />}
                </button>
                {locationInfo.length > 0 && (
                  <button
                    onClick={handleDeletelocationinformation}
                    className="bg-red-500 text-white py-2 px-4 border-2 border-red-500 hover:bg-red-600"
                  >
                    Delete All
                  </button>
                )}
              </div>
            </div>

            {isOpenforLocation && (
              <ul className="space-y-4">
                {locationInfo.length > 0 ? (
                  locationInfo.map((info, index) => (
                    <li
                      key={index}
                      className="bg-white border-4 border-black p-6 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-300"
                    >
                      <p className="text-lg text-gray-700">
                        Latitude: <span className="font-medium text-black">{info.latitude}</span>
                      </p>
                      <p className="text-lg text-gray-700">
                        Longitude: <span className="font-medium text-black">{info.longitude}</span>
                      </p>
                      <p className="text-lg text-gray-700">
                        Created At:{" "}
                        <span className="font-medium text-black">
                          {new Date(info.createdAt).toLocaleString()}
                        </span>
                      </p>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-600">No location information available.</p>
                )}
              </ul>
            )}
          </section>
        );

      case 'login-history':
        return (
          <section className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-black">Login History</h2>

              {loginHistory.length > 0 && (
                <button
                  onClick={deleteAllLoginHistory}
                  className="bg-red-500 text-white py-2 px-4 border-2 border-red-500 hover:bg-red-600"
                >
                  Delete All
                </button>
              )}
            </div>

            {loginHistory.length > 0 ? (
              <div className="space-y-4">
                {loginHistory.map((event, index) => (
                  <div key={index} className="p-4 bg-white border-4 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-lg font-medium text-black">{event.username}</p>
                    <p className="text-sm text-gray-600">{event.date}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-500">No login history available.</p>
            )}
          </section>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-xl text-gray-600">Select a section from the menu</p>
          </div>
        );
    }
  };

    return (
    <div className="min-h-screen bg-white text-black">
      {!isAuthenticated ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white border-4 border-black p-8 w-96 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-bold mb-6 text-center text-black">Admin Login</h2>
            <form onSubmit={handleLogin} className="space-y-5">
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <div>
                <label htmlFor="username" className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Username</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={credentials.username}
                  onChange={handleInputChange1}
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange1}
                  className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-black text-white font-semibold border-2 border-black hover:bg-gray-800 transition"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex">
          {/* Sidebar */}
          <div 
            className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r-4 border-black transition-all duration-300 fixed left-0 top-0 z-30 h-screen`}
          >
            <div className="p-4 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                {sidebarOpen && <h1 className="text-xl font-bold text-black">Admin Panel</h1>}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-gray-600 hover:text-black"
                >
                  {sidebarOpen ? <FaTimes /> : <FaBars />}
                </button>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center ${sidebarOpen ? 'justify-start px-4 py-3' : 'justify-center p-3'} 
                      ${activeSection === item.id 
                        ? 'bg-black text-white' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                      } border-2 border-black transition-colors duration-200`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {sidebarOpen && <span className="ml-3">{item.label}</span>}
                  </button>
                ))}

                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center ${sidebarOpen ? 'justify-start px-4 py-3' : 'justify-center p-3'} 
                    text-red-500 hover:bg-red-500 hover:text-white border-2 border-red-500 rounded-none transition-colors duration-200 mt-8`}
                >
                  <FaSignOutAlt />
                  {sidebarOpen && <span className="ml-3">Logout</span>}
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div 
            className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}

          >

            {/* Main content area */}
            <div className="p-6">
              {/* Countdown Timer */}
              <div
                className="fixed bg-white text-black p-4 border-4 border-black cursor-move z-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                style={{
                  top: `${position.y}px`,
                  left: `${position.x}px`,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <p className="text-lg font-semibold">Session Timeout</p>
                <p className="text-xl">{formatTime(countdown)}</p>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-4 bg-red-500 text-white font-semibold border-2 border-red-500 hover:bg-red-600 transition duration-300 mt-2"
                >
                  Logout
                </button>
              </div>

              {/* Render active section */}
              {renderSection()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;