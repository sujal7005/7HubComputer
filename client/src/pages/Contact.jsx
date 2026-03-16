// src/pages/Contact.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:4000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      alert('Message sent successfully');
      setFormData({ name: '', email: '', message: '' });
    } else {
      alert('Error sending message: ' + data.message);
    }

    } catch (error) {
      console.error('Error:', error);
      alert('Error sending message');
    }
  };

  return (
    <div className="bg-white pt-24 md:pt-28 pb-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
        
        {/* Page Header */}
        <div className="border-b-2 border-black pb-8 mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-bold text-black mb-6 border-b-2 border-black pb-2">
                Contact Info
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center flex-shrink-0">
                    <FaEnvelope className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">Email</p>
                    <a href="mailto:contact@7hubcomputers.com" className="text-black font-medium hover:underline">
                      contact@7hubcomputers.com
                    </a>
                    <p className="text-sm text-gray-500 mt-1">We reply within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center flex-shrink-0">
                    <FaPhone className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">Phone</p>
                    <a href="tel:+919876543210" className="text-black font-medium hover:underline">
                      +91 98765 43210
                    </a>
                    <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9am to 6pm</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">Address</p>
                    <p className="text-black font-medium">123 Tech Park, Bangalore</p>
                    <p className="text-black">Karnataka, India - 560001</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="border-2 border-black p-6 bg-gray-50">
              <h3 className="text-lg font-bold text-black mb-4 border-b-2 border-black pb-2">
                Business Hours
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="font-medium text-black">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span className="font-medium text-black">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span className="font-medium text-black">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-bold text-black mb-6 border-b-2 border-black pb-2">
                Send us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                  />
                </div>
                
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="How can we help you?"
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="w-full bg-black text-white py-4 px-6 text-lg font-medium hover:bg-gray-800 transition-colors border-2 border-black flex items-center justify-center gap-3"
                >
                  <FaPaperPlane /> Send Message
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section (Optional) */}
        <div className="mt-12 border-2 border-black p-4 bg-gray-50">
          <div className="aspect-video w-full bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">Map integration would go here</p>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="text-center mt-12">
          <Link
            to="/"
            className="inline-block text-sm font-medium text-black border-b-2 border-black pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Contact;