import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeadset, FaQuestionCircle, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

const Support = () => {
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    email: '',
    message: '',
  });

  const supportOptions = [
    { title: 'Technical Support', description: 'Hardware issues, software setup, troubleshooting' },
    { title: 'Customer Service', description: 'Order status, shipping, returns, general inquiries' },
    { title: 'Billing and Payments', description: 'Payment issues, invoices, refunds' },
    { title: 'Feedback and Suggestions', description: 'Share your ideas to help us improve' },
    { title: 'Pre-Sales Questions', description: 'Questions about products before purchasing' },
    { title: 'Warranty Support', description: 'Warranty claims and repairs' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:4000/api/support', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      setFormData({ title: '', name: '', email: '', message: '' });
    } else {
      alert(result.message || 'Something went wrong!');
    }
  };

  return (
    <div className="bg-white pt-24 md:pt-28 pb-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
        
        {/* Page Header */}
        <div className="border-b-2 border-black pb-8 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <FaHeadset className="text-3xl text-black" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">We're Here to Help</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4">
            Support Center
          </h1>
          <p className="text-lg text-gray-600">
            Get the help you need. Choose a support topic and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Support Options & Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Support Categories */}
            <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-bold text-black mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
                <FaQuestionCircle /> Support Topics
              </h2>
              <div className="space-y-3">
                {supportOptions.map((option, index) => (
                  <div 
                    key={index} 
                    className="p-3 border-2 border-black hover:bg-gray-50 cursor-pointer transition-all"
                    onClick={() => setFormData({ ...formData, title: option.title })}
                  >
                    <p className="font-bold text-black">{option.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Contact */}
            <div className="border-2 border-black p-6 bg-gray-50">
              <h3 className="text-lg font-bold text-black mb-4">Quick Contact</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black text-white flex items-center justify-center">
                    <FaPhone className="text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <a href="tel:+919876543210" className="text-black font-medium hover:underline text-sm">
                      +91 98765 43210
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black text-white flex items-center justify-center">
                    <FaEnvelope className="text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <a href="mailto:support@7hubcomputers.com" className="text-black font-medium hover:underline text-sm">
                      support@7hubcomputers.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black text-white flex items-center justify-center">
                    <FaClock className="text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Hours</p>
                    <p className="text-black text-sm">Mon-Fri, 9am - 6pm</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="border-2 border-black p-4 text-center">
              <p className="text-gray-600 mb-2">Check our FAQ for quick answers</p>
              <Link
                to="/faq"
                className="inline-block px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors border-2 border-black"
              >
                VIEW FAQ
              </Link>
            </div>
          </div>

          {/* Right Column - Support Form */}
          <div className="lg:col-span-2">
            <div className="border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-bold text-black mb-6 border-b-2 border-black pb-2">
                Submit a Support Request
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Support Type Dropdown */}
                <div>
                  <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Support Type
                  </label>
                  <select
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black bg-white"
                  >
                    <option value="" disabled>
                      Select a support topic
                    </option>
                    {supportOptions.map((option, index) => (
                      <option key={index} value={option.title}>
                        {option.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your issue or question in detail..."
                    required
                    rows="6"
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black text-black resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-black text-white py-4 px-6 text-lg font-medium hover:bg-gray-800 transition-colors border-2 border-black"
                >
                  SUBMIT REQUEST
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  We typically respond within 24-48 hours during business days.
                </p>
              </form>
            </div>
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

export default Support;