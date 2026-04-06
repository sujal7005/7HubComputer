// Home.jsx - Redesigned Hero Section with Big Images & Overlay Text
import { useContext, React, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import AIAssistant from "../components/AIAssistant";
import { CartContext } from '../context/CartContext';
import { FaWhatsapp, FaRobot, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

const Home = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useContext(CartContext);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const navigate = useNavigate();

  // Enhanced HD Images with detailed text overlay content
  const heroImages = [
    {
      url: "https://www.jagatreview.com/wp-content/uploads/2023/01/Ada_Lovelace_laptop_header-720x378.jpg",
      alt: "Premium Gaming Laptop with RGB Keyboard",
      title: "Gaming Laptops",
      subtitle: "RTX 40 Series",
      description: "Experience next-gen gaming with ray tracing and AI-powered performance.",
      price: "Starting ₹40,999",
      badge: "NEW",
      cta: "SHOP GAMING LAPTOPS",
      link: "/laptops"
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/0/04/MSI-Gaming-PC_2024-09-30.png",
      alt: "Custom RGB Gaming PC Setup",
      title: "Gaming Desktops",
      subtitle: "RGB Custom Builds",
      description: "Fully customizable RGB gaming rigs with liquid cooling options.",
      price: "Starting ₹1,49,999",
      badge: "BESTSELLER",
      cta: "BUILD YOUR RIG",
      link: "/prebuilt"
    },
    {
      url: "https://scribejoy.com/wp-content/uploads/emplibot/HIPAA-Compliant-Email_-Essential-Security-Requirements_1745284224.jpeg",
      alt: "Compact Mini PC",
      title: "Mini PCs",
      subtitle: "Space-Saving Power",
      description: "Ultra-compact design with desktop-grade performance for work and play.",
      price: "Starting ₹45,999",
      badge: "COMPACT",
      cta: "EXPLORE MINI PCs",
      link: "/mini-pcs"
    },
    {
      url: "https://static.vecteezy.com/system/resources/thumbnails/056/654/427/small/mockup-showcases-collection-of-tech-gadgets-designed-in-isometric-view-featuring-stylish-headphones-sleek-power-bank-and-modern-smartphone-all-ready-for-branding-and-customization-photo.jpeg",
      alt: "Accessible with Assistive Technology",
      title: "Accessibility",
      subtitle: "Accessible Power",
      description: "Accessible PCs designed for everyone, with assistive technologies and ergonomic features.",
      price: "Starting ₹2,49,999",
      badge: "PRO",
      cta: "VIEW ACCESSIBILITY OPTIONS",
      link: "/accessibility"
    },
    {
      url: "https://www.hks.net.au/cdn/shop/files/DALL_E2024-04-1021.57.00-Acustom-builthigh-endgamingdesktopPCinamodernsetting.ThePCfeaturesatransparentsidepanelshowcasingitsinternalcomponents_likeanRG.webp?v=1712751986",
      alt: "Custom Water Cooled PC",
      title: "Custom Builds",
      subtitle: "Liquid Cooling",
      description: "Design your dream PC with custom water cooling and premium components.",
      price: "Starting ₹1,00,000",
      badge: "CUSTOM",
      cta: "START BUILDING",
      link: "/custom"
    }
  ];

  // Auto-rotate images
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, heroImages.length]);

  const nextImage = () => {
    setIsAutoPlaying(false);
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  };

  const prevImage = () => {
    setIsAutoPlaying(false);
    setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const handleAddToCart = (product) => {
    const cartItem = {
      id: product._id,
      _id: product._id || product.id,
      name: product.name,
      price: product.finalPrice || product.price,
      finalPrice: product.finalPrice || product.price,
      originalPrice: product.originalPrice,
      image: product.image || [],
      description: product.description,
      brand: product.brand,
      category: product.category,
      type: product.type || 'product',
      quantity: 1,
      inStock: product.inStock !== false,
      specs: product.specs || {}
    };
    
    addToCart(cartItem);
    console.log(`${product.name} added to cart`);
    navigate('/cart')
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/admin/products?page=1&limit=6`);
        const data = await response.json();
        const allProducts = [
          ...data.prebuildPC || [],
          ...data.refurbishedProducts || [],
          ...data.miniPCs || [],
        ];
        setProducts(allProducts);
      } catch (error) {
        console.error(error);
        setError("Unable to load products");
      }
    };
    fetchProducts();
  }, []);

  const currentImage = heroImages[currentImageIndex];

  return (
    <div className="bg-white pt-20 md:pt-24">

      {/* Floating Action Buttons - Always Visible with Pulse Animation */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
        
        {/* WhatsApp Button - Always Visible */}
        <motion.a
          href="https://wa.me/919876543210?text=Hi%20I'm%20interested%20in%20your%20products"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-green-500 text-white rounded-full shadow-2xl hover:bg-green-600 flex items-center justify-center border-2 border-white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <FaWhatsapp className="w-6 h-6" />
          </motion.div>
        </motion.a>
        
        {/* AI Assistant Button - Always Visible */}
        <motion.a
          href="/ai-assistant"
          className="w-14 h-14 bg-purple-600 text-white rounded-full shadow-2xl hover:bg-purple-700 flex items-center justify-center border-2 border-white relative"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 }}
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut"
            }}
          >
            <FaRobot className="w-6 h-6" />
          </motion.div>
          
          {/* Pulse Ring Effect */}
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-purple-400"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
        </motion.a>
      </div>
      
      {/* HERO SECTION - BIG IMAGES WITH TEXT OVERLAY */}
      <section className="relative w-full h-[80vh] md:h-[90vh] overflow-hidden mt-10">
        
        {/* Background Image with Overlay */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            <img
              src={currentImage.url}
              alt={currentImage.alt}
              className="w-full h-full object-cover"
            />
            {/* Dark Gradient Overlay for Text Visibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
          </motion.div>
        </AnimatePresence>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6 md:px-10 lg:px-16">
            <div className="max-w-2xl">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="space-y-6"
              >
                {/* Badge */}
                <span className="inline-block px-4 py-2 bg-red-600 text-white text-sm font-bold uppercase tracking-wider border-2 border-white">
                  {currentImage.badge}
                </span>

                {/* Title */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight">
                  {currentImage.title}
                </h1>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-white/90 font-medium">
                  {currentImage.subtitle}
                </p>

                {/* Description */}
                <p className="text-lg text-white/80 max-w-xl">
                  {currentImage.description}
                </p>

                {/* Price */}
                <p className="text-3xl md:text-4xl font-bold text-white">
                  {currentImage.price}
                </p>

                {/* CTA Button */}
                <div className="pt-4">
                  <Link
                    to={currentImage.link}
                    className="inline-block px-8 py-4 bg-white text-black font-bold text-lg hover:bg-black hover:text-white transition-all duration-300 border-2 border-white"
                  >
                    {currentImage.cta} →
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 md:p-4 rounded-full shadow-lg transition-all border-2 border-black z-20"
        >
          <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="black" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={nextImage}
          className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 md:p-4 rounded-full shadow-lg transition-all border-2 border-black z-20"
        >
          <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="black" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentImageIndex(index);
                setIsAutoPlaying(false);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
        
      </section>

      {/* REST OF THE SECTIONS REMAIN THE SAME */}
      {/* BEST SELLERS SECTION */}
      <section className="border border-black mx-4 md:mx-6 lg:mx-8 my-4 md:my-6">
        <div className="container mx-auto px-6 md:px-10 py-16 md:py-20">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight mb-2">
                Best Sellers
              </h2>
              <p className="text-sm text-gray-500 uppercase tracking-wider">
                Most popular computers & laptops
              </p>
            </div>
            <Link 
              to="/"
              className="text-sm font-medium text-black border-b border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors"
            >
              SHOP ALL →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.slice(0, 4).map((product, index) => (
              <div key={index} className="group bg-white border-2 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
                <Link to={`/product/${product._id}`} className='block relative border-b-2 border-black overflow-hidden bg-gray-50'>
                  <div className="aspect-square flex items-center justify-center p-6">
                    <img
                      src={`http://localhost:4000/uploads/${product.image[0].split(/[\\/]/).pop()}`}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </Link>
                <div className="p-5 text-left">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                    {product.brand || product.type || "7HUBCOMPUTERS"}
                  </p>
                  <Link to={`/product/${product._id}`} className="block group">
                    <h3 className="text-xl font-bold text-black mb-2 hover:underline">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-600 mb-3">
                    {product.category || product.specs?.processor || "Intel Core i7"} • {product.specs?.ram || "16GB RAM"}
                  </p>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {Math.floor(Math.random() * 100) + 20} Reviews
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-black">₹{product.finalPrice}</span>
                    {product.originalPrice && (
                      <>
                        <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                        <span className="text-xs font-semibold text-green-600">
                          {Math.round(((product.originalPrice - product.finalPrice) / product.originalPrice) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      if (product) {
                        handleAddToCart(product);
                      }
                    }}
                    className="w-full bg-black text-white py-3 px-4 text-sm font-medium hover:bg-gray-800 transition-colors border-4 border-black"
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
          
      {/* REFURBISHED LAPTOPS SECTION */}
      <section className="border border-black mx-4 md:mx-6 lg:mx-8 my-4 md:my-6">
        <div className="container mx-auto px-6 md:px-10 py-16 md:py-20">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight mb-2">
                Refurbished Laptops
              </h2>
              <p className="text-sm text-gray-500 uppercase tracking-wider">
                Quality tested • 1 year warranty
              </p>
            </div>
            <Link 
              to="/laptops" 
              className="text-sm font-medium text-black border-b border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors"
            >
              SHOP ALL →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products
              .filter(laptop => laptop.type === "Refurbished Laptop")
              .slice(0, 4)
              .map((laptop, index) => (
                <div key={index} className="group bg-white border-2 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
                  <Link to={`/refurbished/${laptop._id}`} className='block relative border-b-2 border-black overflow-hidden bg-gray-50'>
                    <div className="aspect-square flex items-center justify-center p-6">
                      <img
                        src={`http://localhost:4000/uploads/${laptop.image[0].split(/[\\/]/).pop()}`}
                        alt={laptop.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </Link>
                  <div className="p-5 text-left">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                      {laptop.brand || "REFURBISHED"}
                    </p>
                    <Link to={`/product/${laptop._id}`} className="block group">
                      <h3 className="text-xl font-bold text-black mb-2 hover:underline">
                        {laptop.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600 mb-3">
                      {laptop.specs?.processor || "Intel i5"} • {laptop.specs?.ram || "8GB"} • {laptop.specs?.storage || "512GB SSD"}
                    </p>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        {Math.floor(Math.random() * 50) + 10} Reviews
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-black">₹{laptop.finalPrice}</span>
                      {laptop.originalPrice && (
                        <>
                          <span className="text-sm text-gray-400 line-through">₹{laptop.originalPrice}</span>
                          <span className="text-xs font-semibold text-green-600">
                            SAVE {Math.round(((laptop.originalPrice - laptop.finalPrice) / laptop.originalPrice) * 100)}%
                          </span>
                        </>
                      )}
                    </div>
                    <button 
                        onClick={() => {
                          if (laptop) {
                            handleAddToCart(laptop);
                          }
                        }}
                      className="w-full bg-black text-white py-3 px-4 text-sm font-medium hover:bg-gray-800 transition-colors border-4 border-black"
                    >
                      ADD TO CART
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
            
      {/* MINI PCS SECTION */}
      <section className="border border-black mx-4 md:mx-6 lg:mx-8 my-4 md:my-6">
        <div className="container mx-auto px-6 md:px-10 py-16 md:py-20">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight mb-2">
                Mini PCs
              </h2>
              <p className="text-sm text-gray-500 uppercase tracking-wider">
                Compact power • Silent operation
              </p>
            </div>
            <Link 
              to="/mini-pcs" 
              className="text-sm font-medium text-black border-b border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors"
            >
              SHOP ALL →
            </Link>
          </div>
            
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products
              .filter(minipc => minipc.type === "Mini PC")
              .slice(0, 4)
              .map((minipc, index) => (
                <div key={index} className="group bg-white border-2 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
                  <Link to={`/mini-pcs/${minipc._id}`} className='block relative border-b-2 border-black overflow-hidden bg-gray-50'>
                    <div className="">
                      <img
                        src={`http://localhost:4000/uploads/${minipc.image[0].split(/[\\/]/).pop()}`}
                        alt={minipc.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </Link>
                  <div className="p-5 text-left">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                      {minipc.brand || "MINI PC"}
                    </p>
                    <Link to={`/product/${minipc._id}`} className="block group">
                      <h3 className="text-xl font-bold text-black mb-2 hover:underline">
                        {minipc.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600 mb-3">
                      {minipc.specs?.processor || "Intel N100"} • {minipc.specs?.ram || "8GB"} • {minipc.specs?.storage || "256GB"}
                    </p>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        {Math.floor(Math.random() * 30) + 5} Reviews
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-black">₹{minipc.finalPrice}</span>
                    </div>
                    <button 
                        onClick={() => {
                          if (minipc) {
                            handleAddToCart(minipc);
                          }
                        }}
                      className="w-full bg-black text-white py-3 px-4 text-sm font-medium hover:bg-gray-800 transition-colors border-4 border-black"
                    >
                      ADD TO CART
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* WHY 7HUBCOMPUTER SECTION */}
      <section className="py-24 px-4 mx-4 md:mx-6 lg:mx-8 my-4 md:my-6 border-2 border-black bg-white hover:shadow-xl transition-shadow duration-300">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6 relative inline-block">
            Why 7HubComputer?
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-black"></span>
          </h2>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            Discover the best-in-class PC solutions with our 7-step quality check.
          </p>
          <Link
            to="/7hubcomputer-details"
            className="inline-block px-8 py-3 bg-white text-black border-2 border-black hover:bg-black hover:text-white transition-all duration-300 transform hover:scale-105"
          >
            Know More
          </Link>
        </div>
      </section>
            
      {/* CUSTOM BUILD SECTION */}
      <section className="border-2 border-black mx-4 md:mx-6 lg:mx-8 my-4 md:my-6">
        <div className="container mx-auto px-6 md:px-10 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="bg-white border-2 border-black p-12 flex items-center justify-center aspect-square">
              <img
                src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=2070&auto=format&fit=crop"
                alt="Custom Built PC"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
                7HUBCOMPUTERS
              </p>
              <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
                Build Ur Own <br />PC + 20% Off
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Your First Custom Build
              </p>
              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">540 Reviews</span>
              </div>
              <Link 
                to="/custom" 
                className="inline-block bg-black text-white px-12 py-4 text-lg font-medium hover:bg-gray-800 transition-colors border-2 border-black"
              >
                BUILD YOUR PC →
              </Link>
              <p className="text-xs text-gray-500 mt-6">
                *20% off applies to your first custom build. Terms apply.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES */}
      <section className="border-2 border-black mx-4 md:mx-6 lg:mx-8 my-4 md:my-6">
        <div className="container mx-auto px-6 md:px-10 py-16 md:py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-16 tracking-tight">
            Shop by Category
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Gaming PCs', path: '/prebuilt', image: '🎮', count: '12 models' },
              { name: 'Laptops', path: '/laptops', image: '💻', count: '24 models' },
              { name: 'Mini PCs', path: '/mini-pcs', image: '🖥️', count: '8 models' },
              { name: 'Accessibility', path: '/accessibility', image: '⚡', count: '6 models' },
            ].map((category) => (
              <Link 
                key={category.name}
                to={category.path}
                className="group relative bg-gray-50 border-2 border-transparent hover:border-black transition-all duration-300 p-10 text-center"
              >
                <span className="text-6xl mb-6 block">{category.image}</span>
                <h3 className="text-2xl font-bold text-black mb-2">{category.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{category.count}</p>
                <span className="text-sm font-medium text-gray-700 group-hover:text-black group-hover:border-b-2 group-hover:border-black transition-all pb-0.5">
                  Shop Now →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="border-2 border-black mx-4 md:mx-6 lg:mx-8 my-4 md:my-6">
        <div className="container mx-auto px-6 md:px-10 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs uppercase tracking-[0.3em] font-semibold text-gray-600 mb-6">
              EVERY GAMER'S BEST FRIEND
            </p>
            <h2 className="text-5xl md:text-6xl font-bold text-black mb-8 leading-tight">
              Layer Your <span className="border-b-4 border-black">Performance</span>
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Custom build your dream PC with premium components
            </p>
            <Link 
              to="/custom" 
              className="inline-block text-lg font-semibold text-white bg-black px-12 py-4 hover:bg-gray-800 transition-colors"
            >
              BUILD YOUR DREAM PC →
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-2 border-black mx-4 md:mx-6 lg:mx-8 my-4 md:my-6">
        <div className="container mx-auto px-6 md:px-10 py-16 md:py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-16 text-center tracking-tight">
            Customer Reviews
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Rahul M.',
                rating: '★★★★★',
                text: 'The Gaming Beast is absolutely incredible! Handles everything I throw at it with ease. Best investment for my gaming setup.',
                product: 'Gaming Beast RTX 4070',
                location: 'Mumbai'
              },
              {
                name: 'Priya S.',
                rating: '★★★★★',
                text: 'Excellent build quality and exceptional customer service. The team helped me choose the perfect workstation for my design work.',
                product: 'Workstation Pro',
                location: 'Bangalore'
              },
              {
                name: 'Amit K.',
                rating: '★★★★☆',
                text: 'Great value for money. The mini PC is perfect for my home office setup - compact yet powerful. Highly recommended!',
                product: 'Mini PC Elite',
                location: 'Delhi'
              }
            ].map((review, idx) => (
              <div key={idx} className="border-2 border-black p-8 text-center hover:bg-gray-50 transition-colors">
                <div className="text-yellow-500 text-2xl mb-4">{review.rating}</div>
                <p className="text-gray-700 text-lg italic mb-6 leading-relaxed">"{review.text}"</p>
                <div>
                  <p className="text-base font-bold text-black">— {review.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{review.location}</p>
                  <p className="text-xs text-gray-600 mt-3 border-t border-gray-200 pt-3">{review.product}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/reviews" 
              className="inline-block text-sm font-medium text-black border-b-2 border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors"
            >
              READ ALL REVIEWS →
            </Link>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="border-2 border-black mx-4 md:mx-6 lg:mx-8 my-4 md:my-6 bg-black text-white">
        <div className="container mx-auto px-6 md:px-10 py-20 md:py-24 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Stay Updated
          </h2>
          <p className="text-gray-300 text-xl mb-10 max-w-2xl mx-auto">
            Subscribe for exclusive deals, new arrivals, and tech insights
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-6 py-4 bg-white text-black border-2 border-white focus:border-gray-300 focus:outline-none text-lg"
            />
            <button
              type="submit"
              className="px-10 py-4 bg-white text-black font-semibold text-lg hover:bg-gray-200 transition-colors border-2 border-white"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-6">
            By subscribing, you agree to our Privacy Policy and consent to receive updates.
          </p>
        </div>
      </section>

      {/* INSTAGRAM FEED */}
      <section className="border-2 border-black mx-4 md:mx-6 lg:mx-8 my-4 md:my-6">
        <div className="container mx-auto px-6 md:px-10 py-16 md:py-20">
          <div className="flex justify-between items-end mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
              @7HubComputers
            </h2>
            <Link 
              to="https://instagram.com/7hubcomputers" 
              className="text-sm font-medium text-black border-b-2 border-black pb-0.5 hover:text-gray-600 hover:border-gray-600 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              FOLLOW US →
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="aspect-square bg-gray-100 border-2 border-transparent hover:border-black transition-all duration-300 flex items-center justify-center">
                <span className="text-4xl text-gray-400">📷</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;