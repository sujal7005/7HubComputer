// src/pages/About.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const About = () => {
  return (
    <div className="bg-white pt-24 md:pt-28 pb-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
        
        {/* Page Header */}
        <div className="border-b-2 border-black pb-8 mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4">
            About 7HubComputers
          </h1>
          <p className="text-lg text-gray-600">
            Building the future of computing, one system at a time.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          
          {/* Introduction Section */}
          <div className="border-2 border-black p-8 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
            <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-black pb-2 inline-block">
              Who We Are
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              At <span className="font-bold text-black">7HubComputers</span>, we specialize in building high-quality custom and pre-built desktop PCs tailored to meet your unique needs. Whether you're a gamer seeking the ultimate gaming rig, a professional requiring a powerful workstation, or just someone who wants a reliable computer for everyday use, we have the perfect solution for you.
            </p>
          </div>

          {/* Our Mission Section */}
          <div className="border-2 border-black p-8 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
            <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-black pb-2 inline-block">
              Our Mission
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              Our mission is to provide our customers with the best possible PC building experience. We believe that everyone deserves a machine that can handle their specific requirements, whether it's for gaming, content creation, programming, or everyday use. We're committed to delivering exceptional quality, performance, and value in every system we build.
            </p>
          </div>

          {/* Why Choose Us Section */}
          <div className="border-2 border-black p-8 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
            <h2 className="text-2xl font-bold text-black mb-4 border-b-2 border-black pb-2 inline-block">
              Why Choose Us?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Custom builds tailored to your exact specifications",
                "High-quality components from trusted brands",
                "Expert advice and support throughout the buying process",
                "Competitive pricing without compromising quality",
                "Comprehensive warranty on all products",
                "7-step quality assurance process",
                "Free shipping on orders over ₹50,000",
                "24/7 customer support"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-2 border-black p-6 text-center bg-gray-50">
              <p className="text-4xl font-bold text-black mb-2">500+</p>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">PCs Built</p>
            </div>
            <div className="border-2 border-black p-6 text-center bg-gray-50">
              <p className="text-4xl font-bold text-black mb-2">1000+</p>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">Happy Customers</p>
            </div>
            <div className="border-2 border-black p-6 text-center bg-gray-50">
              <p className="text-4xl font-bold text-black mb-2">24/7</p>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">Support</p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-bold text-black mb-6 border-b-2 border-black pb-2">
              Get in Touch
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center">
                    <FaEnvelope />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a href="mailto:contact@7hubcomputers.com" className="text-black hover:underline">
                      contact@7hubcomputers.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center">
                    <FaPhone />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <a href="tel:+919876543210" className="text-black hover:underline">
                      +91 98765 43210
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-black">123 Tech Park, Bangalore, India</p>
                  </div>
                </div>
              </div>

              <div className="border-l-2 border-gray-200 pl-8">
                <p className="text-gray-700 mb-4">
                  Have questions? We're here to help! Reach out to us through our contact page or give us a call.
                </p>
                <Link
                  to="/contact"
                  className="inline-block px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors border-2 border-black"
                >
                  CONTACT US
                </Link>
              </div>
            </div>
          </div>

          {/* Back to Home Button */}
          <div className="text-center">
            <Link
              to="/"
              className="inline-block text-sm font-medium text-black border-b-2 border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;