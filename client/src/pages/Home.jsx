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
  const [showFloatingButtons, setShowFloatingButtons] = useState(false);
  const navigate = useNavigate();

  // Enhanced HD Images with detailed text overlay content
  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1603484477859-abe6a73f9366?q=80&w=2070&auto=format&fit=crop",
      alt: "Premium Gaming Laptop with RGB Keyboard",
      title: "Gaming Laptops",
      subtitle: "RTX 40 Series",
      description: "Experience next-gen gaming with ray tracing and AI-powered performance.",
      price: "Starting ₹89,999",
      badge: "NEW",
      cta: "SHOP GAMING LAPTOPS",
      link: "/laptops"
    },
    {
      url: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?q=80&w=2071&auto=format&fit=crop",
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
      url: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=2070&auto=format&fit=crop",
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
      url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop",
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
      url: "https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?q=80&w=2070&auto=format&fit=crop",
      alt: "Custom Water Cooled PC",
      title: "Custom Builds",
      subtitle: "Liquid Cooling",
      description: "Design your dream PC with custom water cooling and premium components.",
      price: "Starting ₹1,99,999",
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

  const resetAutoPlay = () => {
    setIsAutoPlaying(true);
  };

  const handleAddToCart = (product) => {

  // Log the product to see what we're getting
  // console.log('Adding product to cart:', product);

    // Create a cart item object with all necessary fields
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

    // console.log('Cart item created:', cartItem);
    
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

      {/* Floating Action Buttons - Smooth Animation */}
      <div className="fixed bottom-8 left-8 z-50 flex flex-col items-end">
        
        {/* Main Toggle Button with Rotating Arrow */}
        <motion.button
          onClick={() => setShowFloatingButtons(!showFloatingButtons)}
          className="w-14 h-14 bg-black text-white rounded-full shadow-2xl hover:bg-gray-800 flex items-center justify-center border-2 border-white relative z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{ rotate: showFloatingButtons ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <motion.div
            animate={{ rotate: showFloatingButtons ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <FaArrowLeft className="w-6 h-6" />
          </motion.div>
        </motion.button>
        
        {/* WhatsApp Button - Smooth Slide and Fade */}
        <motion.a
          href="https://wa.me/919876543210?text=Hi%20I'm%20interested%20in%20your%20products"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-0 right-0 w-14 h-14 bg-green-500 text-white rounded-full shadow-2xl hover:bg-green-600 flex items-center justify-center border-2 border-white"
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ 
            opacity: showFloatingButtons ? 1 : 0,
            y: showFloatingButtons ? -80 : 0,
            scale: showFloatingButtons ? 1 : 0.5,
            pointerEvents: showFloatingButtons ? 'auto' : 'none'
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            delay: 0.1
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <FaWhatsapp className="w-6 h-6" />
          </motion.div>
        </motion.a>
        
        {/* AI Assistant Button - Smooth Slide and Fade */}
        <motion.a
          href="/ai-assistant"
          className="absolute bottom-0 right-0 w-14 h-14 bg-purple-600 text-white rounded-full shadow-2xl hover:bg-purple-700 flex items-center justify-center border-2 border-white"
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ 
            opacity: showFloatingButtons ? 1 : 0,
            y: showFloatingButtons ? -160 : 0,
            scale: showFloatingButtons ? 1 : 0.5,
            pointerEvents: showFloatingButtons ? 'auto' : 'none'
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            delay: 0.2
          }}
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 360],
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
        </motion.a>
          
        {/* Ripple Effect Background */}
        {showFloatingButtons && (
          <>
            <motion.div
              className="absolute bottom-0 right-0 w-14 h-14 bg-green-500/30 rounded-full"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ zIndex: -1 }}
            />
            <motion.div
              className="absolute bottom-0 right-0 w-14 h-14 bg-purple-600/30 rounded-full"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
              style={{ zIndex: -1 }}
            />
          </>
        )}
      </div>
      
      {/* Add a pulsing dot to indicate interaction when buttons are hidden */}
      {!showFloatingButtons && (
        <motion.div
          className="fixed bottom-8 left-20 w-4 h-4 bg-red-500 rounded-full z-40"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* HERO SECTION - BIG IMAGES WITH TEXT OVERLAY */}
      <section className="relative w-full h-[80vh] md:h-[90vh] overflow-hidden">
        
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

        {/* Play/Pause Button */}
        <button
          onClick={resetAutoPlay}
          className="absolute top-8 right-8 bg-white/90 hover:bg-white p-2 md:p-3 rounded-full shadow-lg border-2 border-black z-20"
        >
          {isAutoPlaying ? (
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="black" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
            </svg>
          ) : (
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="black" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
          )}
        </button>
        
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








// Home.jsx
// import { React, useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import { Link } from 'react-router-dom';

// const Home = () => {
//   const [products, setProducts] = useState([]);
//   const [error, setError] = useState(null);
//   const [dynamicText, setDynamicText] = useState("Welcome to 7HubComputer");
//   const [hoveredProduct, setHoveredProduct] = useState(null);

//   useEffect(() => {
//     const texts = [
//       "Personal Computers (Desktops & Laptops)",
//       "High-Performance Workstations",
//       "Powerful Gaming PCs",
//       "Reliable Servers",
//       "Compact Mini PCs",
//       "All-in-One Computers"
//     ];

//     let index = 0;
//     const intervalId = setInterval(() => {
//       setDynamicText(texts[index]);
//       index = (index + 1) % texts.length;
//     }, 4000);

//     return () => clearInterval(intervalId);
//   }, []);

//   useEffect(() => {
//     const fetchProducts = async (page = 1, limit = 10) => {
//       try {
//         const response = await fetch(`http://localhost:4000/api/admin/products?page=${page}&limit=${limit}`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         });

//         if (!response.ok) throw new Error("Failed to fetch products");

//         const data = await response.json();
//         const allProducts = [
//           ...data.prebuildPC,
//           ...data.refurbishedProducts,
//           ...data.miniPCs,
//         ];
//         setProducts(allProducts);
//       } catch (error) {
//         console.error(error);
//         setError("Unable to load products. Please try again.");
//       }
//     };

//     fetchProducts(1, 10);
//   }, []);

//   const renderStars = (rating) => {
//     const filledStars = Array(rating).fill('★');
//     const emptyStars = Array(5 - rating).fill('☆');
//     const stars = [...filledStars, ...emptyStars];

//     return (
//       <span className="text-yellow-500 text-lg">
//         {stars.map((star, index) => (
//           <span key={index}>{star}</span>
//         ))}
//       </span>
//     );
//   };

//   return (
//     <div className="bg-white">
//       {/* Hero Section - Minimal with Black Border */}
//       <section className="bg-white text-black py-24 px-4 border-2 border-black m-4 md:m-6 lg:m-8 relative overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-50"></div>
//         <div className="container mx-auto text-center max-w-4xl relative z-10">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//           >
//             <h1 className="text-5xl md:text-7xl font-bold mb-6 relative inline-block">
//               {dynamicText}
//               <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
//             </h1>
//           </motion.div>
          
//           <motion.p
//             className="text-xl md:text-2xl text-gray-600 mb-8"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.3, duration: 0.8 }}
//           >
//             Custom PCs, pre-built systems, laptops, and more.
//           </motion.p>

//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.6, duration: 0.8 }}
//           >
//             <Link
//               to="#featured"
//               className="inline-block px-8 py-3 bg-black text-white text-lg hover:bg-white hover:text-black border-2 border-black transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
//             >
//               Explore Products
//             </Link>
//           </motion.div>
//         </div>
//       </section>

//       {/* Why 7HubComputer - Black Border with Hover Effect */}
//       <section className="py-24 px-4 m-4 md:m-6 lg:m-8 border-2 border-black bg-white hover:shadow-xl transition-shadow duration-300">
//         <div className="container mx-auto text-center max-w-2xl">
//           <h2 className="text-4xl md:text-5xl font-bold text-black mb-6 relative inline-block">
//             Why 7HubComputer?
//             <span className="absolute -bottom-2 left-0 w-full h-1 bg-black"></span>
//           </h2>
//           <p className="text-xl text-gray-700 mb-8 leading-relaxed">
//             Discover the best-in-class PC solutions with our 7-step quality check.
//           </p>
//           <Link
//             to="/7hubcomputer-details"
//             className="inline-block px-8 py-3 bg-white text-black border-2 border-black hover:bg-black hover:text-white transition-all duration-300 transform hover:scale-105"
//           >
//             Know More
//           </Link>
//         </div>
//       </section>

//       {/* Pre-Built Desktop PCs - HD Images with Black Border & Hover Effects */}
//       <section id="featured" className="py-24 px-4">
//         <div className="container mx-auto">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 relative inline-block">
//               Pre-Built Desktop PCs
//               <span className="absolute -bottom-2 left-0 w-full h-1 bg-black"></span>
//             </h2>
//             <p className="text-xl text-gray-600">
//               Top selections for ultimate performance
//             </p>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
//             {products
//               .filter(product => product.type === "Pre-Built PC")
//               .slice(0, 3)
//               .map((product, index) => {
//                 const ramPrice = product?.specs?.ramOptions?.[0]?.price || 0;
//                 const storage1Price = product?.specs?.storage1Options?.[0]?.price || 0;
//                 const storage2Price = product?.specs?.storage2Options?.[0]?.price || 0;
//                 const totalPrice = product.finalPrice + ramPrice + storage1Price + storage2Price;
                
//                 return (
//                   <motion.div 
//                     key={index} 
//                     className="group relative"
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: index * 0.1 }}
//                     onHoverStart={() => setHoveredProduct(index)}
//                     onHoverEnd={() => setHoveredProduct(null)}
//                   >
//                     {/* Black Border Container with Hover Effect */}
//                     <div className="border-2 border-black bg-white p-8 mb-6 flex items-center justify-center h-96 relative overflow-hidden transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
//                       {/* Black and White Merge Effect on Hover */}
//                       <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                      
//                       {/* Diagonal Line Animation on Hover */}
//                       <div className="absolute -inset-full top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-gray-200 to-transparent transform -skew-x-12 group-hover:animate-shimmer"></div>
                      
//                       {/* Product Image */}
//                       <img
//                         src={`http://localhost:4000/uploads${product.image[0].split('\\').pop()}`}
//                         alt={product.name}
//                         className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
//                         loading="lazy"
//                       />
                      
//                       {/* Category Badge */}
//                       <div className="absolute top-4 left-4 bg-black text-white px-4 py-1 text-sm font-medium">
//                         {product.category}
//                       </div>
                      
//                       {/* Price Badge */}
//                       <div className="absolute top-4 right-4 bg-white border-2 border-black text-black px-4 py-1 text-lg font-bold group-hover:bg-black group-hover:text-white transition-colors duration-300">
//                         ₹{totalPrice}
//                       </div>
//                     </div>
                    
//                     {/* Product Info with Hover Effect */}
//                     <div className="text-center relative">
//                       <h3 className="text-2xl font-bold text-black mb-2 group-hover:-translate-y-1 transition-transform duration-300">
//                         {product.name}
//                       </h3>
//                       <p className="text-gray-600 mb-4 text-sm uppercase tracking-wider">
//                         {product.specs?.processor || "High Performance"}
//                       </p>
                      
//                       {/* Animated Border Button */}
//                       <Link
//                         to={`/prebuilt`}
//                         className="relative inline-block px-8 py-3 overflow-hidden group/btn border-2 border-black"
//                       >
//                         <span className="absolute inset-0 w-full h-full bg-black transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300"></span>
//                         <span className="relative text-black group-hover/btn:text-white transition-colors duration-300">
//                           View Details
//                         </span>
//                       </Link>
//                     </div>
//                   </motion.div>
//                 );
//               })}
//           </div>
//         </div>
//       </section>

//       {/* Refurbished Laptops - HD Images with Black Border & Hover Effects */}
//       <section className="py-24 px-4 bg-gray-50">
//         <div className="container mx-auto">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 relative inline-block">
//               Refurbished Laptops
//               <span className="absolute -bottom-2 left-0 w-full h-1 bg-black"></span>
//             </h2>
//             <p className="text-xl text-gray-600">
//               Quality refurbished laptops at unbeatable prices
//             </p>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
//             {products
//               .filter(laptop => laptop.type === "Refurbished Laptop")
//               .slice(0, 3)
//               .map((laptop, index) => (
//                 <motion.div 
//                   key={index} 
//                   className="group"
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: index * 0.1 }}
//                 >
//                   {/* Black Border Container with Hover Effect */}
//                   <div className="border-2 border-black bg-white p-8 mb-6 flex items-center justify-center h-96 relative overflow-hidden transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
//                     {/* Black and White Merge Effect */}
//                     <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                    
//                     {/* Grid Overlay on Hover */}
//                     <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
//                       <div className="w-full h-full" style={{
//                         backgroundImage: 'linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)',
//                         backgroundSize: '20px 20px'
//                       }}></div>
//                     </div>
                    
//                     <img
//                       src={`http://localhost:4000/uploads${laptop.image[0].split('\\').pop()}`}
//                       alt={laptop.name}
//                       className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
//                       loading="lazy"
//                     />
                    
//                     <div className="absolute top-4 left-4 bg-black text-white px-4 py-1 text-sm font-medium">
//                       {laptop.category}
//                     </div>
                    
//                     <div className="absolute top-4 right-4 bg-white border-2 border-black text-black px-4 py-1 text-lg font-bold group-hover:bg-black group-hover:text-white transition-colors duration-300">
//                       ₹{laptop.finalPrice}
//                     </div>
//                   </div>
                  
//                   <div className="text-center">
//                     <h3 className="text-2xl font-bold text-black mb-2 group-hover:-translate-y-1 transition-transform duration-300">
//                       {laptop.name}
//                     </h3>
//                     <p className="text-gray-600 mb-4 text-sm uppercase tracking-wider">
//                       {laptop.specs?.processor || "Refurbished"}
//                     </p>
                    
//                     <Link
//                       to={`/laptops`}
//                       className="relative inline-block px-8 py-3 overflow-hidden group/btn border-2 border-black"
//                     >
//                       <span className="absolute inset-0 w-full h-full bg-black transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300"></span>
//                       <span className="relative text-black group-hover/btn:text-white transition-colors duration-300">
//                         View Details
//                       </span>
//                     </Link>
//                   </div>
//                 </motion.div>
//               ))}
//           </div>
//         </div>
//       </section>

//       {/* Mini PCs - HD Images with Black Border & Hover Effects */}
//       <section className="py-24 px-4">
//         <div className="container mx-auto">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 relative inline-block">
//               Mini PCs
//               <span className="absolute -bottom-2 left-0 w-full h-1 bg-black"></span>
//             </h2>
//             <p className="text-xl text-gray-600">
//               Compact yet powerful computing solutions
//             </p>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
//             {products
//               .filter(minipc => minipc.type === "Mini PC")
//               .slice(0, 3)
//               .map((minipc, index) => (
//                 <motion.div 
//                   key={index} 
//                   className="group"
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: index * 0.1 }}
//                 >
//                   {/* Black Border Container with Hover Effect */}
//                   <div className="border-2 border-black bg-white p-8 mb-6 flex items-center justify-center h-96 relative overflow-hidden transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
//                     {/* Black and White Merge Effect */}
//                     <div className="absolute inset-0 bg-gradient-to-br from-black to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                    
//                     {/* Dots Pattern on Hover */}
//                     <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
//                       <div className="w-full h-full" style={{
//                         backgroundImage: 'radial-gradient(black 1px, transparent 1px)',
//                         backgroundSize: '16px 16px'
//                       }}></div>
//                     </div>
                    
//                     <img
//                       src={`http://localhost:4000/uploads${minipc.image[0].split('\\').pop()}`}
//                       alt={minipc.name}
//                       className="w-full h-full object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-2"
//                       loading="lazy"
//                     />
                    
//                     <div className="absolute top-4 left-4 bg-black text-white px-4 py-1 text-sm font-medium">
//                       {minipc.category}
//                     </div>
                    
//                     <div className="absolute top-4 right-4 bg-white border-2 border-black text-black px-4 py-1 text-lg font-bold group-hover:bg-black group-hover:text-white transition-colors duration-300">
//                       ₹{minipc.finalPrice}
//                     </div>
//                   </div>
                  
//                   <div className="text-center">
//                     <h3 className="text-2xl font-bold text-black mb-2 group-hover:-translate-y-1 transition-transform duration-300">
//                       {minipc.name}
//                     </h3>
//                     <p className="text-gray-600 mb-4 text-sm uppercase tracking-wider">
//                       {minipc.specs?.processor || "Compact Design"}
//                     </p>
                    
//                     <Link
//                       to={`/mini-pcs`}
//                       className="relative inline-block px-8 py-3 overflow-hidden group/btn border-2 border-black"
//                     >
//                       <span className="absolute inset-0 w-full h-full bg-black transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300"></span>
//                       <span className="relative text-black group-hover/btn:text-white transition-colors duration-300">
//                         View Details
//                       </span>
//                     </Link>
//                   </div>
//                 </motion.div>
//               ))}
//           </div>
//         </div>
//       </section>

//       {/* Why Choose Us - Black Border with Icons */}
//       <section className="py-24 px-4 m-4 md:m-6 lg:m-8 border-2 border-black bg-white">
//         <div className="container mx-auto">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 relative inline-block">
//               Why Choose Us?
//               <span className="absolute -bottom-2 left-0 w-full h-1 bg-black"></span>
//             </h2>
//             <p className="text-xl text-gray-600">Experience the best in performance and quality</p>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
//             {[
//               {
//                 title: "High Performance",
//                 desc: "Designed to handle the most demanding tasks with ease.",
//                 icon: "⚡"
//               },
//               {
//                 title: "Quality Components",
//                 desc: "Only the best components for reliability and longevity.",
//                 icon: "🔧"
//               },
//               {
//                 title: "Expert Assembly",
//                 desc: "Professionally assembled for peak performance.",
//                 icon: "🛠️"
//               }
//             ].map((item, index) => (
//               <motion.div 
//                 key={index} 
//                 className="text-center group p-8 border-2 border-transparent hover:border-black transition-all duration-300"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1 }}
//               >
//                 <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
//                   {item.icon}
//                 </div>
//                 <h3 className="text-2xl font-bold text-black mb-3">{item.title}</h3>
//                 <p className="text-gray-600">{item.desc}</p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Testimonials - Black Border with Quote Design */}
//       <section className="py-24 px-4">
//         <div className="container mx-auto max-w-6xl">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 relative inline-block">
//               Customer Testimonials
//               <span className="absolute -bottom-2 left-0 w-full h-1 bg-black"></span>
//             </h2>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {[
//               {
//                 name: 'John Doe',
//                 feedback: 'The Gaming Beast is an absolute powerhouse! I couldn\'t be happier with my purchase.',
//                 role: 'Gamer'
//               },
//               {
//                 name: 'Jane Smith',
//                 feedback: 'Expertly assembled and runs like a dream! Highly recommend.',
//                 role: 'Designer'
//               },
//               {
//                 name: 'Mike Johnson',
//                 feedback: 'Fantastic performance and top-notch components. Worth every penny!',
//                 role: 'Developer'
//               }
//             ].map((testimonial, idx) => (
//               <motion.div 
//                 key={idx} 
//                 className="border-2 border-black p-8 text-center relative group hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: idx * 0.1 }}
//               >
//                 <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-black text-white w-8 h-8 flex items-center justify-center text-2xl">
//                   "
//                 </div>
//                 <p className="text-gray-700 text-lg italic mb-6 mt-4">"{testimonial.feedback}"</p>
//                 <div>
//                   <p className="text-black font-bold text-lg">- {testimonial.name}</p>
//                   <p className="text-gray-500 text-sm">{testimonial.role}</p>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Customer Reviews - Black Border with Rating */}
//       <section className="py-24 px-4 bg-gray-50">
//         <div className="container mx-auto max-w-6xl">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 relative inline-block">
//               Customer Reviews
//               <span className="absolute -bottom-2 left-0 w-full h-1 bg-black"></span>
//             </h2>
//             <p className="text-xl text-gray-600">What our customers are saying about us</p>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {[
//               {
//                 name: 'John Doe',
//                 rating: 5,
//                 feedback: 'The Gaming Beast is an absolute powerhouse! I couldn\'t be happier with my purchase.',
//                 date: '2 days ago'
//               },
//               {
//                 name: 'Jane Smith',
//                 rating: 4,
//                 feedback: 'Expertly assembled and runs like a dream! Highly recommend.',
//                 date: '1 week ago'
//               },
//               {
//                 name: 'Mike Johnson',
//                 rating: 5,
//                 feedback: 'Fantastic performance and top-notch components. Worth every penny!',
//                 date: '2 weeks ago'
//               },
//               {
//                 name: 'Emily Davis',
//                 rating: 5,
//                 feedback: 'Great customer service and the product exceeded my expectations!',
//                 date: '3 weeks ago'
//               }
//             ].map((review, index) => (
//               <motion.div 
//                 key={index} 
//                 className="border-2 border-black p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1 }}
//               >
//                 <div className="flex justify-between items-start mb-3">
//                   <h3 className="text-xl font-bold text-black">{review.name}</h3>
//                   <span className="text-sm text-gray-500">{review.date}</span>
//                 </div>
//                 <div className="mb-3">
//                   {renderStars(review.rating)}
//                 </div>
//                 <p className="text-gray-700 italic">"{review.feedback}"</p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Call to Action - Black Border */}
//       <section className="py-24 px-4 m-4 md:m-6 lg:m-8 border-2 border-black bg-black text-white">
//         <div className="container mx-auto text-center max-w-3xl">
//           <h2 className="text-4xl md:text-5xl font-bold mb-6">
//             Ready to Build Your Dream PC?
//           </h2>
//           <p className="text-xl text-gray-300 mb-8">
//             Contact us today for custom configurations and expert advice
//           </p>
//           <Link
//             to="/contact"
//             className="inline-block px-8 py-3 bg-white text-black border-2 border-white hover:bg-black hover:text-white hover:border-white transition-all duration-300 transform hover:scale-105"
//           >
//             Get Started
//           </Link>
//         </div>
//       </section>

//       {/* Add custom CSS for animations */}
//       <style jsx>{`
//         @keyframes shimmer {
//           100% {
//             transform: translateX(100%) skewX(-12deg);
//           }
//         }
//         .animate-shimmer {
//           animation: shimmer 1.5s infinite;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Home;