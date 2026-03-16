// Footer.jsx - Full Width with Balanced Design
import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link } from 'react-router-dom';

const Footer = () => {
  const BASE_URL = `http://${window.location.hostname}:4000`;
  
  return (
    <footer className="bg-white border-t-4 border-black w-full">
      {/* Main Footer Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Top Section: Contact & Newsletter */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12">
          
          {/* Left Side: Contact Links */}
          <div className="w-full lg:w-auto">
            <h5 className="text-lg font-bold text-black mb-4 border-b-2 border-black pb-1 inline-block">
              Contact Us
            </h5>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {[
                { name: 'About Us', path: '/about' },
                { name: 'Contact', path: '/contact' },
                { name: 'Privacy', path: '/privacy' },
                { name: 'Terms', path: '/terms' },
                { name: 'FAQ', path: '/faq' },
                { name: 'Support', path: '/support' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side: Newsletter */}
          <div className="w-full lg:w-auto lg:max-w-md">
            <h5 className="text-lg font-bold text-black mb-4 border-b-2 border-black pb-1 inline-block">
              Newsletter
            </h5>
            <form
              className="flex flex-col sm:flex-row items-stretch w-full"
              onSubmit={async (e) => {
                e.preventDefault();
                const emailInput = e.target.elements.email;
                if (!emailInput || !emailInput.value) {
                  alert("Please enter a valid email.");
                  return;
                }
                const email = emailInput.value;
                try {
                  const response = await fetch(`${BASE_URL}/api/subscribe`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                  });
                  const result = await response.json();
                  alert(result.message);
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
                className="flex-1 px-3 py-2 border-2 border-black text-sm focus:outline-none focus:ring-2 focus:ring-black text-black"
              />
              <button className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors border-2 border-black sm:-ml-0.5 mt-2 sm:mt-0">
                Subscribe
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              Get exclusive offers and updates
            </p>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t-2 border-black">
          <div>
            <h6 className="font-bold text-black mb-3 text-sm">Shop</h6>
            <ul className="space-y-2">
              <li><Link to="/prebuilt" className="text-xs text-gray-600 hover:text-black transition-colors">Pre-Built PCs</Link></li>
              <li><Link to="/laptops" className="text-xs text-gray-600 hover:text-black transition-colors">Laptops</Link></li>
              <li><Link to="/mini-pcs" className="text-xs text-gray-600 hover:text-black transition-colors">Mini PCs</Link></li>
              <li><Link to="/custom" className="text-xs text-gray-600 hover:text-black transition-colors">Custom Builds</Link></li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold text-black mb-3 text-sm">Support</h6>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-xs text-gray-600 hover:text-black transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="text-xs text-gray-600 hover:text-black transition-colors">FAQ</Link></li>
              <li><Link to="/shipping" className="text-xs text-gray-600 hover:text-black transition-colors">Shipping</Link></li>
              <li><Link to="/returns" className="text-xs text-gray-600 hover:text-black transition-colors">Returns</Link></li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold text-black mb-3 text-sm">Company</h6>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-xs text-gray-600 hover:text-black transition-colors">About Us</Link></li>
              <li><Link to="/blog" className="text-xs text-gray-600 hover:text-black transition-colors">Blog</Link></li>
              <li><Link to="/careers" className="text-xs text-gray-600 hover:text-black transition-colors">Careers</Link></li>
              <li><Link to="/reviews" className="text-xs text-gray-600 hover:text-black transition-colors">Reviews</Link></li>
            </ul>
          </div>
          <div>
            <h6 className="font-bold text-black mb-3 text-sm">Legal</h6>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-xs text-gray-600 hover:text-black transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="text-xs text-gray-600 hover:text-black transition-colors">Terms</Link></li>
              <li><Link to="/cookies" className="text-xs text-gray-600 hover:text-black transition-colors">Cookies</Link></li>
              <li><Link to="/accessibility" className="text-xs text-gray-600 hover:text-black transition-colors">Accessibility</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t-2 border-black">
          
          {/* Copyright */}
          <p className="text-xs text-gray-600 order-2 md:order-1">
            &copy; {new Date().getFullYear()} <span className="font-medium text-black">7HubComputers</span>. All rights reserved.
          </p>

          {/* Social & Payments */}
          <div className="flex items-center gap-4 order-1 md:order-2">
            
            {/* Social Icons */}
            <div className="flex items-center gap-2">
              {[
                { icon: 'fab fa-facebook-f', url: 'https://facebook.com', label: 'Facebook' },
                { icon: 'fab fa-twitter', url: 'https://twitter.com', label: 'Twitter' },
                { icon: 'fab fa-instagram', url: 'https://instagram.com', label: 'Instagram' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 border-2 border-black flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <i className={`${social.icon} text-xs`}></i>
                </a>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase border border-gray-300 px-1.5 py-0.5">Visa</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase border border-gray-300 px-1.5 py-0.5">MC</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase border border-gray-300 px-1.5 py-0.5">UPI</span>
            </div>
          </div>
        </div>

        {/* Trust Badges - Simplified */}
        <div className="flex flex-wrap justify-center gap-4 mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-1">
            <span className="text-sm">🔒</span>
            <span className="text-xs text-gray-500">Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm">🚚</span>
            <span className="text-xs text-gray-500">Free Shipping</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm">🛡️</span>
            <span className="text-xs text-gray-500">24/7 Support</span>
          </div>
        </div>

        {/* Location - Simple */}
        <p className="text-xs text-gray-400 text-center mt-4">
          7HubComputers • Bangalore, India
        </p>
      </div>
    </footer>
  );
};

export default Footer;