// src/components/AIAssistant.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { 
  FaMicrophone, 
  FaStop, 
  FaRedo, 
  FaArrowLeft, 
  FaRobot, 
  FaVolumeUp,
  FaSpinner,
  FaPaperPlane,
  FaChevronDown,
  FaCheck,
  FaTimes,
  FaStar,
  FaDesktop,
  FaLaptop,
  FaTv,
  FaMicrochip,
  FaGamepad,
  FaBoxOpen,
  FaHeadphones, 
  FaEnvelope, 
  FaPhone, 
  FaComments,
  FaUser,
  FaClock,
  FaTrash,
  FaPlus,
  FaBars,
  FaMagic,
  FaBrain,
  // FaWaveform,
  FaCircle,
  FaVolumeMute,
  FaVolumeOff
} from 'react-icons/fa';
import { MdSupportAgent } from 'react-icons/md';
import { BsTicketPerforated } from 'react-icons/bs';

// Alternative icon for waveform (using FaMusic or create custom)
const FaWaveform = ({ className, size }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M2 12h2" />
    <path d="M6 8h2" />
    <path d="M10 4h2" />
    <path d="M14 4h2" />
    <path d="M18 8h2" />
    <path d="M22 12h2" />
    <path d="M6 16h2" />
    <path d="M10 20h2" />
    <path d="M14 20h2" />
    <path d="M18 16h2" />
  </svg>
);

const AIAssistant = () => {
  const canvasRef = useRef(null);
  const globeCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const navigate = useNavigate();
  
  const { 
    transcript, 
    listening, 
    resetTranscript, 
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable 
  } = useSpeechRecognition();

  const [waveIntensity, setWaveIntensity] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState('llama3.2');
  const [models, setModels] = useState([]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showQuickCommands, setShowQuickCommands] = useState(true);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [showProducts, setShowProducts] = useState(false);
  const [showSupportOptions, setShowSupportOptions] = useState(false);
  const [globeRotation, setGlobeRotation] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesisSupported, setSpeechSynthesisSupported] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const BASE_URL = `http://${window.location.hostname}:4000`;

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check speech synthesis support
  useEffect(() => {
    if (!window.speechSynthesis) {
      setSpeechSynthesisSupported(false);
    }
  }, []);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem('chatSessions');
    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats);
        setChatSessions(parsed);
        
        if (parsed.length > 0 && !currentSessionId) {
          loadChatSession(parsed[0].id);
        }
      } catch (e) {
        console.error('Error parsing chat sessions:', e);
      }
    }
  }, []);

  // Save chat sessions to localStorage
  const saveChatSession = (session) => {
    const updatedSessions = [session, ...chatSessions.filter(s => s.id !== session.id)].slice(0, 20);
    setChatSessions(updatedSessions);
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
  };

  // Update existing session
  const updateChatSession = (sessionId, updatedMessages, updatedProducts) => {
    const sessionIndex = chatSessions.findIndex(s => s.id === sessionId);
    if (sessionIndex >= 0) {
      const updatedSessions = [...chatSessions];
      updatedSessions[sessionIndex] = {
        ...updatedSessions[sessionIndex],
        messages: updatedMessages,
        messageCount: updatedMessages.length,
        lastUpdated: new Date().toISOString(),
        preview: updatedMessages.length > 0 ? 
          (updatedMessages[updatedMessages.length - 1]?.text?.slice(0, 100) + '...') : '',
        recommendedProducts: updatedProducts || updatedSessions[sessionIndex].recommendedProducts
      };
      setChatSessions(updatedSessions);
      localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
    }
  };

  // Load a specific chat session
  const loadChatSession = (sessionId) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setMessages(session.messages || []);
      setCurrentSessionId(sessionId);
      if (session.recommendedProducts && session.recommendedProducts.length > 0) {
        setRecommendedProducts(session.recommendedProducts);
        setShowProducts(true);
      } else {
        setRecommendedProducts([]);
        setShowProducts(false);
      }
      setShowChatHistory(false);
      setShowMobileMenu(false);
    }
  };

  // Delete a chat session
  const deleteChatSession = (sessionId, e) => {
    e.stopPropagation();
    const updatedSessions = chatSessions.filter(s => s.id !== sessionId);
    setChatSessions(updatedSessions);
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
    
    if (currentSessionId === sessionId) {
      if (updatedSessions.length > 0) {
        loadChatSession(updatedSessions[0].id);
      } else {
        startNewChat();
      }
    }
  };

  // Start a new chat
  const startNewChat = () => {
    setMessages([]);
    setRecommendedProducts([]);
    setShowProducts(false);
    setCurrentSessionId(null);
    setShowChatHistory(false);
    setShowMobileMenu(false);
  };

  // Text to Speech function
  const speakText = (text) => {
    if (!speechSynthesisSupported || isMuted || isLoading) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (speechSynthesisSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      stopSpeaking();
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch available models on mount
  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/ai/models`);
      const data = await response.json();
      if (data.success) {
        setModels(data.models || []);
        if (data.currentModel) {
          setCurrentModel(data.currentModel);
        }
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const changeModel = async (modelName) => {
    try {
      const response = await fetch(`${BASE_URL}/api/ai/model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelName })
      });
      const data = await response.json();
      if (data.success) {
        setCurrentModel(modelName);
        setShowModelSelector(false);
        const systemMsg = { 
          id: Date.now().toString(),
          text: `Switched to ${modelName} model`, 
          sender: 'system',
          model: modelName,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, systemMsg]);
        speakText(`Switched to ${modelName} model`);
      }
    } catch (error) {
      console.error('Error changing model:', error);
    }
  };

  // Get icon based on product type
  const getProductIcon = (type) => {
    const typeLower = type?.toLowerCase() || '';
    
    if (typeLower.includes('pre-built') || typeLower.includes('prebuilt') || typeLower.includes('desktop')) {
      return <FaDesktop className="text-indigo-600" />;
    }
    if (typeLower.includes('mini')) {
      return <FaMicrochip className="text-cyan-600" />;
    }
    if (typeLower.includes('laptop') || typeLower.includes('refurbished')) {
      return <FaLaptop className="text-emerald-600" />;
    }
    if (typeLower.includes('display') || typeLower.includes('monitor')) {
      return <FaTv className="text-rose-600" />;
    }
    if (typeLower.includes('accessory') || typeLower.includes('accessories')) {
      return <FaGamepad className="text-amber-600" />;
    }
    return <FaBoxOpen className="text-gray-600" />;
  };

  // Format price in Indian Rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    return !!(token && userStr);
  };

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signin?redirect=ai-assistant');
    }
  }, [navigate]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token) {
      alert('Please sign in to use the AI assistant');
      navigate('/signin');
      return;
    }

    let user = null;
    try {
      user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Error parsing user:', e);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      alert('Session error. Please sign in again.');
      navigate('/signin');
      return;
    }

    if (!user || !user._id) {
      alert('User information is missing. Please sign in again.');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/signin');
      return;
    }

    const timestamp = new Date().toISOString();
    const userMessage = { 
      id: Date.now().toString(),
      text: inputMessage, 
      sender: 'user', 
      timestamp,
      user: { name: user.name }
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowProducts(false);
    setShowSupportOptions(false);

    try {
      console.log("Sending request with message:", inputMessage);

      const response = await fetch(`${BASE_URL}/api/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: inputMessage,
          conversationHistory: messages.slice(-10).map(m => ({
            sender: m.sender,
            text: m.text
          })),
          userId: user._id
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        alert('Your session has expired. Please sign in again.');
        navigate('/signin');
        return;
      }

      const data = await response.json();
      console.log("API Response - Full data:", data);
      console.log("API Response - Products:", data.products);
      console.log("API Response - Products type:", typeof data.products);
      console.log("API Response - Products length:", data.products?.length);

      if (data.reply) {
        const aiMessage = { 
          id: (Date.now() + 1).toString(),
          text: data.reply, 
          sender: 'ai',
          model: data.model || currentModel,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Speak the response (if not muted)
        speakText(data.reply);

        // Save this conversation as a session
        if (messages.length === 0) {
          const session = {
              id: Date.now().toString(),
              title: inputMessage.slice(0, 50) + (inputMessage.length > 50 ? '...' : ''),
              timestamp: new Date().toISOString(),
              lastUpdated: new Date().toISOString(),
              messages: [userMessage, aiMessage],
              messageCount: 2,
              preview: data.reply.slice(0, 100) + '...',
              recommendedProducts: data.products || []
          };
          saveChatSession(session);
        } else {
          // Update existing session
          const updatedMessages = [...messages, userMessage, aiMessage];
          updateChatSession(currentSessionId, updatedMessages, data.products);
        }

        // Check if products exist and have items
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          console.log("Setting products:", data.products);
          setRecommendedProducts(data.products);
          setShowProducts(true);
        } else {
          console.log("No products in response or empty array");
        }

        if (isSupportQuery(inputMessage)) {
          setShowSupportOptions(true);
        }
      } else {
        throw new Error('No reply from server');
      }

    } catch (error) {
      console.error('Error:', error);
      const errorMsg = "I'm having trouble connecting. Please check if Ollama is running and try again.";
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(),
        text: errorMsg, 
        sender: 'ai',
        error: true,
        timestamp: new Date().toISOString()
      }]);
      speakText(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const isSupportQuery = (message) => {
    const supportKeywords = [
      'help', 'support', 'issue', 'problem', 'not working', 'broken', 
      'return', 'refund', 'exchange', 'warranty', 'guarantee',
      'order status', 'track order', 'delivery', 'shipping',
      'contact', 'customer service', 'complaint', 'assistance',
      'repair', 'service', 'technical', 'troubleshoot'
    ];

    const lowerMessage = message.toLowerCase();
    return supportKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  const handleVoiceTranscript = () => {
    if (transcript && !listening) {
      setInputMessage(transcript);
      resetTranscript();
      // Auto-send after voice input
      setTimeout(() => {
        if (transcript.trim()) {
          sendMessage();
        }
      }, 500);
    }
  };

  useEffect(() => {
    handleVoiceTranscript();
  }, [transcript, listening]);

  // Enhanced 3D Globe Animation with smoother transitions
  useEffect(() => {
    const canvas = globeCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrame;
    let rotation = 0;
    let pulsePhase = 0;
    let lastTime = performance.now();
    let targetRotationSpeed = 0.003;
    let currentRotationSpeed = 0.003;
    
    // Create dots in a spherical pattern with more detail
    const createDotMatrix = () => {
      const dots = [];
      const layers = 24;
      const dotsPerLayer = 48;
      
      for (let layer = 0; layer < layers; layer++) {
        const phi = (layer / layers) * Math.PI;
        const y = Math.cos(phi) * 200;
        const radius = Math.sin(phi) * 200;
        
        for (let i = 0; i < dotsPerLayer; i++) {
          const theta = (i / dotsPerLayer) * Math.PI * 2;
          const x = Math.cos(theta) * radius;
          const z = Math.sin(theta) * radius;
          
          dots.push({
            x, y, z,
            phase: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 1.5,
            baseSize: 1 + Math.random() * 2,
            originalX: x,
            originalY: y,
            originalZ: z
          });
        }
      }
      
      return dots;
    };

    const dots = createDotMatrix();
    let mouseX = 0, mouseY = 0;

    // 3D rotation functions
    const rotateY = (point, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x: point.x * cos - point.z * sin,
        y: point.y,
        z: point.x * sin + point.z * cos
      };
    };

    const rotateX = (point, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x: point.x,
        y: point.y * cos - point.z * sin,
        z: point.y * sin + point.z * cos
      };
    };

    const drawGlobe = (currentTime) => {
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Smooth rotation speed transition
      if (isLoading) {
        targetRotationSpeed = 0.015;
      } else if (listening) {
        targetRotationSpeed = 0.008;
      } else if (isSpeaking) {
        targetRotationSpeed = 0.012;
      } else {
        targetRotationSpeed = 0.003;
      }
      
      currentRotationSpeed += (targetRotationSpeed - currentRotationSpeed) * 0.05;
      rotation += currentRotationSpeed * deltaTime * 60;
      
      // Sort dots by Z for depth effect
      const sortedDots = [...dots].sort((a, b) => {
        const az = rotateY(a, rotation).z;
        const bz = rotateY(b, rotation).z;
        return bz - az;
      });

      sortedDots.forEach(dot => {
        // Apply rotations
        const rotated = rotateY(dot, rotation);
        
        // Mouse influence on rotation
        const mouseInfluenceX = (mouseX - centerX) / centerX * 0.2;
        const rotatedWithMouse = rotateY(rotated, mouseInfluenceX);
        
        // Perspective projection
        const perspective = 600 / (600 + rotatedWithMouse.z);
        const screenX = centerX + rotatedWithMouse.x * perspective;
        const screenY = centerY + rotatedWithMouse.y * perspective;
        
        // Don't draw if behind the sphere
        if (rotatedWithMouse.z < -180) return;
        
        // Smooth pulse animation
        pulsePhase += 0.01;
        let pulse;
        
        if (isLoading) {
          pulse = 0.6 + Math.sin(pulsePhase * 4 + dot.phase) * 0.4;
        } else if (listening) {
          pulse = 0.5 + Math.sin(pulsePhase * 2.5 + dot.phase) * 0.3 + audioLevel * 0.4;
        } else if (isSpeaking) {
          pulse = 0.5 + Math.sin(pulsePhase * 3 + dot.phase) * 0.35 + (Math.sin(Date.now() * 0.01) * 0.2);
        } else {
          pulse = 0.5 + Math.sin(pulsePhase * 1.2 + dot.phase) * 0.2;
        }
        
        // Dynamic dot size
        let dotSize = dot.baseSize * (0.8 + pulse * 0.8);
        
        // Opacity based on position
        let opacity = 0.4 + pulse * 0.3;
        if (rotatedWithMouse.z < 0) {
          opacity *= 0.6;
        }
        
        // Color based on state
        let color;
        if (isLoading) {
          color = `rgba(245, 158, 11, ${opacity})`;
        } else if (listening) {
          color = `rgba(139, 92, 246, ${opacity})`;
        } else if (isSpeaking) {
          color = `rgba(16, 185, 129, ${opacity})`;
        } else if (isHovering) {
          color = `rgba(59, 130, 246, ${opacity})`;
        } else {
          color = `rgba(75, 85, 99, ${opacity})`;
        }
        
        // Draw dot
        ctx.beginPath();
        ctx.arc(screenX, screenY, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = color;
        
        // Add glow effect
        if (listening) {
          ctx.shadowColor = 'rgba(139, 92, 246, 0.5)';
          ctx.shadowBlur = 20;
        } else if (isLoading) {
          ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
          ctx.shadowBlur = 25;
        } else if (isSpeaking) {
          ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
          ctx.shadowBlur = 20;
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
      });
      
      // Reset shadow
      ctx.shadowBlur = 0;
      
      // Update audio level
      if (listening) {
        setAudioLevel(prev => {
          const target = Math.random() * 0.8 + 0.2;
          return prev * 0.95 + target * 0.05;
        });
        setWaveIntensity(prev => (prev + 1) % 100);
      } else {
        setAudioLevel(prev => prev * 0.98);
      }
      
      animationFrame = requestAnimationFrame(drawGlobe);
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    animationFrame = requestAnimationFrame(drawGlobe);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, [listening, isHovering, audioLevel, isLoading, isSpeaking]);

  const startListening = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      alert('Please sign in to use the AI assistant');
      navigate('/signin');
      return;
    }

    SpeechRecognition.startListening({ 
      continuous: true,
      language: 'en-US'
    });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  const handleReset = () => {
    resetTranscript();
    setMessages([]);
    setRecommendedProducts([]);
    setShowProducts(false);
    setShowSupportOptions(false);
    setCurrentSessionId(null);
    stopSpeaking();
  };

  // Animated Product Card Component
  const ProductCard = ({ product, index }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef(null);
    
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      
      if (cardRef.current) {
        observer.observe(cardRef.current);
      }
      
      return () => observer.disconnect();
    }, []);
    
    const getProductUrl = () => {
      const type = product.type?.toLowerCase() || '';
      
      if (type.includes('display')) {
        return `/display/${product.id}`;
      } else if (type.includes('accessory')) {
        return `/accessories/${product.id}`;
      } else if (type.includes('laptop')) {
        return `/refurbished/${product.id}`;
      } else if (type.includes('mini')) {
        return `/mini-pcs/${product.id}`;
      } else {
        return `/pc/${product.id}`;
      }
    };

    const getImageUrl = () => {
      if (!product.image) return null;
      if (product.image.startsWith('http')) {
        return product.image;
      }
      const filename = product.image.split(/[\\/]/).pop();
      return `${BASE_URL}/uploads/${filename}`;
    };

    return (
      <div
        ref={cardRef}
        className={`transform transition-all duration-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
        style={{ transitionDelay: `${index * 0.1}s` }}
      >
        <Link
          to={getProductUrl()}
          className="block"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={`bg-white border-2 rounded-xl overflow-hidden transition-all duration-500 ${
            isHovered ? 'border-indigo-500 shadow-xl scale-[1.02]' : 'border-gray-200 shadow-md'
          }`}>
            <div className="flex flex-col sm:flex-row p-4">
              {/* Product Image */}
              <div className={`w-full sm:w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-3 rounded-lg border border-gray-200 mx-auto sm:mx-0 mb-3 sm:mb-0 transition-all duration-500 ${
                isHovered ? 'scale-105 rotate-1' : ''
              }`}>
                {getImageUrl() ? (
                  <img 
                    src={getImageUrl()}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-700"
                    style={{ transform: isHovered ? 'scale(1.15) rotate(3deg)' : 'scale(1)' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-4xl transition-transform duration-700" 
                       style={{ transform: isHovered ? 'scale(1.15) rotate(3deg)' : 'scale(1)' }}>
                    {getProductIcon(product.type)}
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="flex-1 sm:ml-4">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                  <div className="flex-1 w-full">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {product.brand || '7HUB'}
                    </p>
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-2">
                      {product.name}
                    </h4>
                  </div>
                  {product.rating && (
                    <div className="flex items-center gap-1 text-amber-500 text-xs flex-shrink-0 self-start">
                      <FaStar size={10} className={isHovered ? 'animate-pulse' : ''} />
                      <span className="font-medium">{product.rating}</span>
                    </div>
                  )}
                </div>
                
                {/* Specs Tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {product.specs?.processor && (
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                      {product.specs.processor.split(' ')[0]}
                    </span>
                  )}
                  {product.specs?.ram && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                      {product.specs.ram}
                    </span>
                  )}
                  {product.specs?.storage && (
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">
                      {product.specs.storage}
                    </span>
                  )}
                </div>
                
                {/* Price */}
                <div className="flex items-center justify-between mt-3">
                  <div className="relative">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-gray-400 line-through ml-2 absolute -top-4 right-0">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-all duration-300 ${
                    product.inStock 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                      : 'bg-rose-100 text-rose-700 border border-rose-200'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900 flex items-center justify-center p-4">
        <div className="text-center p-6 sm:p-12 max-w-2xl mx-auto border-2 border-gray-200 rounded-2xl bg-white shadow-xl animate-fadeIn">
          <FaRobot className="text-5xl sm:text-7xl mx-auto mb-4 sm:mb-6 text-indigo-600 animate-bounce" />
          <h2 className="text-2xl sm:text-4xl font-light mb-4 sm:mb-6">Browser Not Supported</h2>
          <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg">
            Your browser doesn't support speech recognition.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 sm:px-8 py-2 sm:py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg text-sm sm:text-base"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900 pt-16 sm:pt-20">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
        
        {/* Header with animations */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-8 animate-fadeInDown">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900 transition-all duration-300 group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center group-hover:border-indigo-500 group-hover:shadow-lg transform group-hover:-translate-x-1 transition-all duration-300">
              <FaArrowLeft size={14} className="sm:size-18 group-hover:text-indigo-600" />
            </div>
            <span className="text-xs sm:text-sm group-hover:text-indigo-600 hidden sm:inline">Back</span>
          </button>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mute/Unmute Button */}
            <button
              onClick={toggleMute}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 text-xs sm:text-sm ${
                isMuted 
                  ? 'bg-gray-100 border-2 border-gray-300 text-gray-500'
                  : isSpeaking 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white animate-pulse'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-emerald-500'
              }`}
              title={isMuted ? "Unmute voice" : "Mute voice"}
            >
              {isMuted ? <FaVolumeOff size={12} /> : <FaVolumeUp size={12} />}
              <span className="hidden sm:inline">{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
            
            {/* New Chat Button */}
            <button
              onClick={startNewChat}
              className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1 text-xs sm:text-sm"
            >
              <FaPlus size={12} />
              <span>New Chat</span>
            </button>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-full hover:border-indigo-500 transition-all duration-300"
            >
              <FaBars className="text-gray-600" />
              <span className="text-xs text-gray-700">Menu</span>
            </button>
            
            {/* Chat History Button */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowChatHistory(!showChatHistory)}
                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white border-2 border-gray-200 rounded-full hover:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 text-xs sm:text-sm"
              >
                <FaClock className="text-gray-600" />
                <span className="text-gray-700">History</span>
                {chatSessions.length > 0 && (
                  <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded-full">
                    {chatSessions.length}
                  </span>
                )}
              </button>
              
              {showChatHistory && (
                <div className="absolute top-full right-0 mt-2 w-72 sm:w-96 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-slideInRight">
                  <div className="p-3 sm:p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white flex justify-between items-center">
                    <p className="text-xs sm:text-sm font-semibold text-indigo-700">Chat History</p>
                    <button
                      onClick={() => setShowChatHistory(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                  <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                    {chatSessions.length > 0 ? (
                      chatSessions.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => loadChatSession(session.id)}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 transition-all duration-200 border-b border-gray-100 last:border-0 group cursor-pointer ${
                            currentSessionId === session.id ? 'bg-indigo-50' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className={`text-xs sm:text-sm font-medium ${
                                currentSessionId === session.id ? 'text-indigo-700' : 'text-gray-900'
                              } group-hover:text-indigo-600 line-clamp-1`}>
                                {session.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                {session.preview}
                              </p>
                              <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2">
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                  {session.messageCount} msgs
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {formatTimestamp(session.timestamp)}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => deleteChatSession(session.id, e)}
                              className="p-1.5 sm:p-2 text-gray-400 hover:text-rose-500 transition-colors rounded-full hover:bg-rose-50"
                            >
                              <FaTrash size={10} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 sm:px-4 py-6 sm:py-8 text-xs sm:text-sm text-gray-500 text-center">
                        <FaClock className="mx-auto mb-2 text-2xl sm:text-3xl text-gray-300" />
                        <p>No chat history yet</p>
                        <p className="text-xs mt-1">Start a conversation to see it here</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Model Selector */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="flex items-center gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 bg-white border-2 border-gray-200 rounded-full hover:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 text-xs sm:text-sm"
              >
                <FaBrain className="text-gray-600" size={12} />
                <span className="font-semibold text-indigo-600">{currentModel}</span>
                <FaChevronDown size={10} className={`text-gray-500 transition-transform duration-300 ${showModelSelector ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`absolute top-full right-0 mt-2 w-48 sm:w-64 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden transition-all duration-300 transform ${
                showModelSelector ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}>
                <div className="p-2 sm:p-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
                  <p className="text-xs font-medium text-indigo-700">Available Models</p>
                </div>
                <div className="max-h-48 sm:max-h-64 overflow-y-auto">
                  {models.length > 0 ? (
                    models.map((model) => (
                      <button
                        key={model.name}
                        onClick={() => changeModel(model.name)}
                        className={`w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm hover:bg-indigo-50 transition-all duration-200 ${
                          currentModel === model.name ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        <span className="truncate">{model.name}</span>
                        {currentModel === model.name && <FaCheck size={10} className="text-indigo-600 flex-shrink-0 ml-2" />}
                      </button>
                    ))
                  ) : (
                    <p className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-500 text-center">No models available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-full">
              <div className="relative">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-ping opacity-30"></div>
              </div>
              <span className="text-xs sm:text-sm font-medium text-emerald-700 hidden sm:inline">Online</span>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="sm:hidden mb-4 p-3 bg-white border-2 border-gray-200 rounded-xl shadow-lg animate-slideInDown">
            <div className="space-y-2">
              <button
                onClick={() => {
                  startNewChat();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
              >
                <FaPlus size={14} />
                <span className="text-sm">New Chat</span>
              </button>
              
              <button
                onClick={toggleMute}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isMuted 
                    ? 'bg-gray-100 border-2 border-gray-300 text-gray-500'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-emerald-500'
                }`}
              >
                {isMuted ? <FaVolumeOff size={14} /> : <FaVolumeUp size={14} />}
                <span className="text-sm">{isMuted ? 'Unmute Voice' : 'Mute Voice'}</span>
              </button>
              
              <button
                onClick={() => {
                  setShowChatHistory(!showChatHistory);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <FaClock className="text-gray-600" />
                  <span className="text-sm text-gray-700">Chat History</span>
                </div>
                {chatSessions.length > 0 && (
                  <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded-full">
                    {chatSessions.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setShowModelSelector(!showModelSelector);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <FaMicrochip className="text-gray-600" />
                  <span className="text-sm text-gray-700">Model: {currentModel}</span>
                </div>
                <FaChevronDown size={12} className="text-gray-500" />
              </button>

              <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-lg">
                <div className="relative">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-30"></div>
                </div>
                <span className="text-sm font-medium text-emerald-700">Online</span>
              </div>
            </div>

            {/* Mobile Chat History */}
            {showChatHistory && (
              <div className="mt-3 p-3 bg-gray-50 border-2 border-gray-200 rounded-lg max-h-80 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-semibold text-indigo-700">Chat History</p>
                  <button
                    onClick={() => setShowChatHistory(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
                {chatSessions.length > 0 ? (
                  chatSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => {
                        loadChatSession(session.id);
                        setShowMobileMenu(false);
                      }}
                      className={`p-2 mb-2 text-left hover:bg-white transition-all duration-200 border border-gray-200 rounded-lg cursor-pointer ${
                        currentSessionId === session.id ? 'bg-white border-indigo-300' : ''
                      }`}
                    >
                      <p className={`text-xs font-medium ${
                        currentSessionId === session.id ? 'text-indigo-700' : 'text-gray-900'
                      } line-clamp-1`}>
                        {session.title}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">
                        {session.preview}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[8px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                          {session.messageCount} msgs
                        </span>
                        <span className="text-[8px] text-gray-400">
                          {formatTimestamp(session.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 text-center py-4">No chat history</p>
                )}
              </div>
            )}

            {/* Mobile Model Selector */}
            {showModelSelector && (
              <div className="mt-3 p-3 bg-gray-50 border-2 border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-medium text-indigo-700">Available Models</p>
                  <button
                    onClick={() => setShowModelSelector(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
                {models.length > 0 ? (
                  models.map((model) => (
                    <button
                      key={model.name}
                      onClick={() => {
                        changeModel(model.name);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-indigo-50 transition-all duration-200 rounded-lg mb-1 ${
                        currentModel === model.name ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      <span className="truncate">{model.name}</span>
                      {currentModel === model.name && <FaCheck size={8} className="text-indigo-600 flex-shrink-0 ml-2" />}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 text-center py-2">No models available</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8 items-start min-h-[60vh] sm:min-h-[80vh]">
          
          {/* Left Side - Animated Globe */}
          <div className="relative order-2 lg:order-1 animate-slideInLeft mt-4 lg:mt-0">
            <div 
              ref={containerRef}
              className="relative aspect-square max-w-md sm:max-w-2xl mx-auto"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {/* Globe Canvas */}
              <canvas
                ref={globeCanvasRef}
                width={400}
                height={400}
                className="w-full h-full cursor-pointer rounded-full transition-all duration-700 hover:scale-105 hover:shadow-2xl"
                onClick={listening ? stopListening : startListening}
              />
              
              {/* Center Glow */}
              <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 sm:w-48 h-32 sm:h-48 rounded-full transition-all duration-700 ${
                isLoading ? 'bg-amber-400/10 blur-3xl scale-150 animate-pulse' :
                listening ? 'bg-indigo-400/10 blur-3xl scale-150 animate-pulse' : 
                isSpeaking ? 'bg-emerald-400/10 blur-3xl scale-150 animate-pulse' :
                'bg-blue-400/5 blur-2xl'
              }`} />
              
              {/* Status Indicator */}
              <div className="absolute -bottom-10 sm:-bottom-12 left-1/2 transform -translate-x-1/2 w-full text-center animate-float">
                <div className={`inline-flex px-3 sm:px-6 py-1.5 sm:py-3 rounded-full text-[10px] sm:text-sm font-medium border-2 transition-all duration-500 bg-white shadow-lg ${
                  isLoading ? 'border-amber-400 text-amber-700' :
                  listening ? 'border-indigo-400 text-indigo-700' : 
                  isSpeaking ? 'border-emerald-400 text-emerald-700 animate-pulse' :
                  'border-gray-200 text-gray-600'
                }`}>
                  <span className="flex items-center gap-1 sm:gap-2">
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin text-amber-500" size={12} />
                        <span className="animate-pulse">THINKING...</span>
                      </>
                    ) : listening ? (
                      <>
                        <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-indigo-500"></span>
                        </span>
                        <span className="animate-pulse">LISTENING</span>
                      </>
                    ) : isSpeaking ? (
                      <>
                        <FaWaveform className="text-emerald-500 animate-pulse" size={12} />
                        <span className="animate-pulse">SPEAKING</span>
                      </>
                    ) : (
                      <>
                        <FaVolumeUp className="text-gray-500 animate-bounce" size={12} />
                        TAP TO SPEAK
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Voice Wave Visualization */}
              {listening && (
                <div className="absolute -bottom-16 sm:-bottom-24 left-1/2 transform -translate-x-1/2 w-48 sm:w-64 animate-fadeInUp">
                  <div className="flex items-center justify-center gap-[2px] sm:gap-[3px] h-8 sm:h-12">
                    {[...Array(20)].map((_, i) => {
                      const height = Math.sin((waveIntensity + i * 15) * 0.1) * 15 + 15;
                      return (
                        <div
                          key={i}
                          className="w-[2px] sm:w-[3px] bg-gradient-to-t from-indigo-500 to-purple-500 rounded-full transition-all duration-100"
                          style={{ 
                            height: `${height}px`,
                            opacity: 0.2 + Math.sin((waveIntensity + i * 15) * 0.1) * 0.2
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Chat Interface */}
          <div className="space-y-3 sm:space-y-6 animate-slideInRight order-1 lg:order-2">
            
            {/* AI Header */}
            <div className="flex items-center gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg transform transition-transform duration-500 hover:rotate-12 hover:scale-110">
                <FaRobot size={24} className="sm:size-32 text-white animate-pulse" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-3xl font-light text-gray-900">AI Assistant</h2>
                <p className="text-xs sm:text-sm text-gray-600">Ask me anything about our products</p>
              </div>
              {isSpeaking && !isMuted && (
                <div className="flex items-center gap-1">
                  <FaWaveform className="text-emerald-500 animate-pulse" size={16} />
                  <button
                    onClick={stopSpeaking}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Stop
                  </button>
                </div>
              )}
            </div>

            {/* Product Recommendations */}
            {showProducts && recommendedProducts.length > 0 && (
              <div className="bg-white border-2 border-indigo-200 rounded-2xl p-3 sm:p-4 shadow-lg animate-fadeInUp">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className="text-sm sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaMagic className="text-indigo-600 animate-spin-slow" size={16} />
                    Recommended for You
                  </h3>
                  <span className="text-[10px] sm:text-xs text-indigo-600 bg-indigo-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-indigo-200 animate-pulse">
                    {recommendedProducts.length} items
                  </span>
                </div>
                
                <div className="space-y-2 sm:space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                  {recommendedProducts.map((product, index) => (
                    <ProductCard key={index} product={product} index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages Container */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-3 sm:p-4 shadow-lg">
              <div 
                ref={chatContainerRef}
                className="h-[250px] sm:h-[400px] overflow-y-auto space-y-2 sm:space-y-4 pr-1 sm:pr-2 custom-scrollbar"
              >
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-6 sm:py-12 animate-fadeIn">
                    <div className="text-4xl sm:text-7xl mb-2 sm:mb-4 text-gray-300 animate-bounce">✨</div>
                    <p className="text-sm sm:text-lg text-gray-600">Start a conversation</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 animate-pulse">Tap the globe and speak or type below</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => (
                      <div
                        key={msg.id || idx}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slideIn${
                          msg.sender === 'user' ? 'Right' : 'Left'
                        }`}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <div
                          className={`max-w-[90%] sm:max-w-[85%] rounded-xl sm:rounded-2xl p-2 sm:p-4 transition-all duration-300 hover:shadow-lg ${
                            msg.sender === 'user'
                              ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                              : msg.sender === 'system'
                              ? 'bg-gradient-to-br from-gray-100 to-gray-50 text-gray-700 border-2 border-gray-200'
                              : msg.error
                              ? 'bg-gradient-to-br from-rose-100 to-red-50 text-rose-700 border-2 border-rose-200'
                              : 'bg-gradient-to-br from-gray-100 to-gray-50 text-gray-700 border-2 border-gray-200'
                          }`}
                        >
                          {/* Message Header */}
                          <div className="flex items-center justify-between gap-2 sm:gap-4 mb-1 sm:mb-2">
                            <div className="flex items-center gap-1 sm:gap-2">
                              {msg.sender === 'user' ? (
                                <FaUser size={10} className="text-white/80" />
                              ) : (
                                <FaRobot size={10} className="text-gray-600" />
                              )}
                              <span className="text-[10px] font-medium opacity-80">
                                {msg.sender === 'user' ? 'You' : 'AI'}
                              </span>
                            </div>
                            {msg.timestamp && (
                              <span className="text-[8px] opacity-60">
                                {formatTimestamp(msg.timestamp)}
                              </span>
                            )}
                          </div>

                          {msg.model && msg.sender === 'ai' && (
                            <p className="text-[8px] sm:text-xs text-gray-500 mb-1 sm:mb-2 bg-white/50 px-1.5 sm:px-2 py-0.5 rounded-full inline-block">
                              {msg.model}
                            </p>
                          )}
                          <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}

                {isLoading && (
                  <div className="flex justify-start animate-fadeIn">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <FaSpinner className="animate-spin text-amber-500" size={14} />
                        <span className="text-xs sm:text-sm text-gray-700 animate-pulse">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transcript Display */}
            {transcript && listening && (
              <div className="p-2 sm:p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl sm:rounded-2xl animate-fadeInUp">
                <p className="text-xs sm:text-sm text-indigo-600 mb-1 flex items-center gap-1 sm:gap-2">
                  <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-indigo-500"></span>
                  </span>
                  Listening...
                </p>
                <p className="text-sm sm:text-lg text-gray-900">"{transcript}"</p>
              </div>
            )}

            {/* Input Area */}
            <div className="flex gap-2 sm:gap-3 animate-fadeInUp">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-3 sm:px-6 py-2 sm:py-4 bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:shadow-lg transition-all duration-300 hover:shadow-md"
                disabled={isLoading}
              />
              
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 sm:px-6 py-2 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl sm:rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:-translate-y-1 flex items-center gap-1 sm:gap-2 group"
              >
                <FaPaperPlane size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center animate-fadeInUp">
              {listening ? (
                <button
                  onClick={stopListening}
                  className="px-3 sm:px-6 py-1.5 sm:py-3 bg-gradient-to-r from-rose-100 to-red-50 text-rose-700 rounded-full transition-all duration-300 hover:from-rose-200 hover:to-red-100 hover:shadow-lg border-2 border-rose-200 flex items-center gap-1 sm:gap-2 transform hover:-translate-y-1 text-xs sm:text-sm"
                >
                  <FaStop size={12} />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  onClick={startListening}
                  disabled={!isMicrophoneAvailable}
                  className={`px-3 sm:px-6 py-1.5 sm:py-3 rounded-full transition-all duration-300 flex items-center gap-1 sm:gap-2 transform hover:-translate-y-1 text-xs sm:text-sm ${
                    isMicrophoneAvailable 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaMicrophone size={12} />
                  <span>Speak</span>
                </button>
              )}
              
              {(transcript || messages.length > 0) && (
                <button
                  onClick={handleReset}
                  className="px-3 sm:px-6 py-1.5 sm:py-3 bg-white border-2 border-gray-200 rounded-full transition-all duration-300 text-gray-700 hover:bg-gray-50 hover:shadow-lg hover:-translate-y-1 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                >
                  <FaRedo size={12} />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Quick Commands */}
            {showQuickCommands && (
              <div className="mt-4 sm:mt-8 text-center animate-fadeInUp">
                <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 tracking-wide">QUICK COMMANDS</p>
                <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
                  {[
                    'Gaming PCs under ₹1L',
                    'Best programming laptops',
                    'Budget monitors',
                    'Latest accessories',
                    'RTX 4060 vs 4070'
                  ].map((cmd, i) => (
                    <button
                      key={i}
                      onClick={() => setInputMessage(cmd)}
                      className="px-2 sm:px-4 py-1 sm:py-2 bg-white border-2 border-gray-200 rounded-full text-[10px] sm:text-sm text-gray-700 transition-all duration-300 hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md hover:-translate-y-1"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Support Options */}
            {showSupportOptions && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 animate-fadeInUp">
                <h3 className="text-sm sm:text-lg font-semibold text-blue-700 mb-2 sm:mb-3 flex items-center gap-2">
                  <FaHeadphones className="text-blue-600 animate-pulse" size={16} />
                  Need Help?
                </h3>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {[
                    { icon: FaEnvelope, color: 'from-blue-500 to-blue-600', text: 'Email', action: () => window.open('mailto:support@7hubcomputer.com') },
                    { icon: FaPhone, color: 'from-emerald-500 to-green-600', text: 'Call', action: () => window.location.href = 'tel:+919876543210' },
                    { icon: FaComments, color: 'from-purple-500 to-purple-600', text: 'Chat', action: () => {} },
                    { icon: BsTicketPerforated, color: 'from-amber-500 to-orange-600', text: 'Ticket', action: () => {} }
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={item.action}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white hover:bg-gray-50 rounded-lg sm:rounded-xl border-2 border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        <item.icon size={14} className="sm:size-18" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-900">{item.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Microphone Permission Warning */}
            {!isMicrophoneAvailable && (
              <div className="mt-3 sm:mt-4 p-2 sm:p-4 bg-amber-50 border-2 border-amber-200 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 text-amber-700 text-xs sm:text-sm animate-pulse">
                <FaTimes className="flex-shrink-0" size={12} />
                <span>Please allow microphone access</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add custom styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-fadeInDown { animation: fadeInDown 0.6s ease-out; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
        .animate-slideInLeft { animation: slideInLeft 0.5s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.5s ease-out; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c7d2fe;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #818cf8;
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;