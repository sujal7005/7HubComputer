import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-10">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start px-6 md:px-10 mb-10 space-y-8 md:space-y-0">

        {/* Left Side: Links */}
        <div className="text-center md:text-left">
          <h5 className="text-center font-semibold">Contact Us</h5>
          <div className="flex flex-wrap justify-center md:justify-start space-x-4 space-y-2 mt-2">
            <a href="/about" className="hover:text-gray-400 text-base">About Us</a>
            <a href="/contact" className="hover:text-gray-400 text-base">Contact</a>
            <a href="/privacy" className="hover:text-gray-400 text-base">Privacy Policy</a>
            <a href="/terms" className="hover:text-gray-400 text-base">Terms of Service</a>
            <a href="/faq" className="hover:text-gray-400 text-base">FAQ</a>
            <a href="/support" className="hover:text-gray-400 text-base">Support</a>
          </div>
        </div>

        {/* Right Side: Newsletter Signup */}
        <div className="flex flex-col items-center">
          <h5 className="text-lg font-semibold mb-2">Subscribe to Our Newsletter</h5>
          <form
            className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0"
            onSubmit={async (e) => {
              e.preventDefault();
              const emailInput = e.target.elements.email;

              if (!emailInput || !emailInput.value) {
                alert("Please enter a valid email.");
                return;
              }

              const email = emailInput.value;

              try {
                const response = await fetch("http://localhost:5000/api/subscribe", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                });

                const result = await response.json();
                alert(result.message); // Show the response message
              } catch (error) {
                console.error("Error subscribing:", error);
                alert("Failed to subscribe. Please try again later.");
              }
            }}
          >
            <input
              type="email"
              name='email'
              placeholder="Enter your email"
              className="p-3 rounded-md sm:rounded-l-md w-full sm:w-auto sm:flex-1 focus:outline-none focus:ring focus:ring-gray-300 text-black"
            />
            <button className="bg-blue-500 text-white p-3 rounded-md sm:rounded-r-md hover:bg-blue-600 w-full sm:w-auto">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="text-center mt-6">
        <p className="mb-4 text-sm">&copy; {new Date().getFullYear()} PlexiForge. All rights reserved.</p>

        {/* Social Media Links */}
        <div className="flex justify-center space-x-4 mt-4">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 text-xl">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 text-xl">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 text-xl">
            <i className="fab fa-instagram"></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;