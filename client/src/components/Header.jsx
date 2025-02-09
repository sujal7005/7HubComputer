// src/components/Header.jsx
import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FaShoppingCart, FaUserCircle } from 'react-icons/fa';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { cartItems } = useContext(CartContext);
  const [suggestions, setSuggestions] = useState([]);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState({});
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchTerm.length > 0) {
      axios
        .get(`http://localhost:4000/api/admin/products?q=${searchTerm}`)
        .then((res) => {
          console.log("API Response:", res.data);
          const allProducts = [
            ...res.data.prebuildPC || [],
            ...res.data.officePC || [],
            ...res.data.refurbishedProducts || [],
            ...res.data.miniPCs || []
          ];
          setSuggestions(allProducts);
        })
        .catch((err) => {
          console.error("Error fetching suggestions:", err)
          setSuggestions([]);
        });
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const handleSearch = (event) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
      setSuggestions([]);
    }
  };

  const generateUrl = (product) => {
    let type = product.type || ""; // Ensure type is at least an empty string
    if (typeof type !== "string") {
      console.warn("Invalid type:", type);
      type = "pc"; // Fallback to default if type is not a string
    }
  
    let basePath = "pc"; // Default path
    const lowerCaseType = type.toLowerCase();
  
    if (lowerCaseType.includes("mini pc")) {
      basePath = "mini-pcs";
    } else if (lowerCaseType.includes("refurbished")) {
      basePath = "refurbished";
    }
  
    return `/${basePath}/${product._id}`;
  };

  
  const handleSuggestionClick = (product) => {
    const productUrl = generateUrl(product);
    navigate(productUrl);
    setSearchTerm('');
    setSuggestions([]);
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleAccountMenu = () => setIsAccountMenuOpen(!isAccountMenuOpen);

  const isLoggedIn = Boolean(localStorage.getItem('user'));

  const handleSignOut = () => {
    localStorage.removeItem('user');
    setIsAccountMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gray-900 text-white shadow-md h-20">
      <div className="container mx-auto flex justify-between items-center py-6 px-6 md:px-10">

        {/* Logo */}
        <Link to="/" className="text-lg md:text-xl font-bold tracking-wider text-indigo-400"> {/* Decreased font size here */}
          7HubComputers
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center w-1/2 relative">
          <input
            type="text"
            placeholder="Search for PCs..."
            className="w-full px-3 py-1.5 bg-gray-800 text-gray-300 rounded-l-md focus:outline-none text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 bg-gray-800 text-gray-300 text-xs rounded-md mt-1 shadow-lg max-h-40 overflow-y-auto">
              {suggestions.map((product, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-gray-700 cursor-pointer flex items-center gap-3"
                  onClick={() => handleSuggestionClick(product)}
                >
                  <img
                    src={`http://localhost:4000/uploads/${product.image[0].split('\\').pop()}`}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-md border border-gray-700"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-indigo-400 font-semibold">₹{product.finalPrice}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <button
            type="submit"
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 text-xs"
          >
            Search
          </button>
        </form>

        {/* Nav Links for Desktop */}
        <nav className="hidden md:flex space-x-6 items-center text-sm">
          {[
            {
              name: 'Home',
              path: '/',
            },
            {
              name: 'All Categories',
              dropdown: [
                { name: 'Pre-Built PCs', path: '/prebuilt' },
                // { name: 'Custom PCs', path: '/custom' },
                { name: 'Mini PCs', path: '/mini-pcs' },
                // { name: 'All-in-One PCs', path: '/all-in-one-pcs' },
                { name: 'Laptops', path: '/laptops' },
              ],
            },
            {
              name: 'About Us',
              path: '/about',
            },
            {
              name: 'Contact',
              path: '/contact',
            },
          ].map((link, idx) => {
            // Render normal links
            if (!link.dropdown) {
              return (
                <NavLink
                  key={idx}
                  to={link.path}
                  className={({ isActive }) =>
                    `relative ${isActive ? 'text-indigo-400' : 'hover:text-gray-400'} transition duration-300`
                  }
                >
                  {link.name}
                  {({ isActive }) => (
                    <span
                      className={`absolute left-0 right-0 bottom-0 h-[1.5px] ${isActive ? 'bg-indigo-400' : 'bg-transparent'
                        } transition-all duration-300`}
                    />
                  )}
                </NavLink>
              );
            }

            // Render dropdown for "All Categories"
            return (
              <div key={idx} className="relative group">
                <span className="flex items-center cursor-pointer hover:text-gray-400 transition duration-300">
                  {link.name}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-1 h-4 w-4 transform transition-transform group-hover:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
                <div className="absolute left-0 mt-2 opacity-0 invisible group-hover:visible group-hover:opacity-100 bg-white shadow-lg rounded-lg transition-all duration-500">
                  <ul className="py-2 px-4 bg-gray-900">
                    {link.dropdown.map((category, categoryIdx) => (
                      <li key={categoryIdx} className="py-1">
                        <NavLink
                          to={category.path}
                          className="block text-white hover:text-indigo-400 transition duration-300"
                        >
                          {category.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </nav>


        {/* Account and Cart Icons */}
        <div className="flex items-center space-x-4">
          <Link to="/cart" className="relative flex items-center">
            <div className="relative">
              <FaShoppingCart className="text-gray-400 hover:text-indigo-400 transition duration-300" size={24} />
              {/* Display item count inside the cart icon */}
              {cartItems.length > 0 && (
                <span className="absolute inset-0 flex justify-center items-center text-xs font-bold text-white bg-red-600 rounded-full w-5 h-5" style={{ top: '-4px', right: '-6px' }}>
                  {cartItems.length}
                </span>
              )}
            </div>
          </Link>

          {/* My Account Dropdown */}
          <div className="relative">
            <button onClick={toggleAccountMenu} className="flex items-center space-x-1 text-gray-400 hover:text-indigo-400 transition duration-300">
              <FaUserCircle size={20} />
              <span className="text-xs">My Account</span> {/* Decreased font size here */}
            </button>
            {isAccountMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-gray-800 text-white rounded-md shadow-lg text-xs"> {/* Decreased font size here */}
                {isLoggedIn ? (
                  <>
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-700 text-xs"> {/* Decreased font size here */}
                      Profile
                    </Link>
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-2 hover:bg-gray-700 text-xs"> {/* Decreased font size here */}
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/signin" className="block px-4 py-2 hover:bg-gray-700 text-xs"> {/* Decreased font size here */}
                    Sign In
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-400 focus:outline-none"
          onClick={toggleMenu}
        >
          <svg
            className={`w-6 h-6 transform transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <nav className="md:hidden bg-gray-800 py-3 transition-all duration-500 ease-in-out transform translate-y-0 animate-[fadeInSlideDown_0.5s_ease-in-out]">
          {[
            { name: 'Home', path: '/' },
            {
              name: 'All Categories',
              dropdown: [
                { name: 'Pre-Built PCs', path: '/prebuilt' },
                // { name: 'Custom PCs', path: '/custom' },
                { name: 'Mini PCs', path: '/mini-pcs' },
                // { name: 'All-in-One PCs', path: '/all-in-one' },
                { name: 'Laptops', path: '/laptops' },
              ],
            },
            { name: 'About Us', path: '/about' },
            { name: 'Contact', path: '/contact' },
          ].map((link, index) => {
            if (!link.dropdown) {
              return (
                <NavLink
                  key={index}
                  to={link.path}
                  className={({ isActive }) =>
                    `block px-4 py-2 text-center ${isActive ? 'underline text-indigo-400' : 'hover:bg-gray-700 text-gray-300'
                    } text-sm`
                  }
                  onClick={toggleMenu}
                >
                  {link.name}
                </NavLink>
              );
            }

            return (
              <div key={index} className="relative">
                <button
                  className="w-full flex items-center justify-between px-4 py-2 text-gray-300 hover:bg-gray-700 text-sm"
                  onClick={() => setDropdownOpen((prev) => ({ ...prev, [index]: !prev[index] }))}
                >
                  {link.name}
                  <span
                    className={`transform transition-transform duration-300 ${dropdownOpen[index] ? 'rotate-180' : ''
                      }`}
                  >
                    ▼ {/* Down arrow icon */}
                  </span>
                </button>
                {dropdownOpen[index] && (
                  <ul className="bg-gray-700">
                    {link.dropdown.map((category, categoryIdx) => (
                      <li key={categoryIdx} className="py-1 text-center">
                        <NavLink
                          to={category.path}
                          className="block text-gray-300 hover:text-indigo-400 transition"
                          onClick={toggleMenu}
                        >
                          {category.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      )}
    </header>
  );
};

export default Header;