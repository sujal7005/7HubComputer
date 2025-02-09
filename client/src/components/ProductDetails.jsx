import React, { useContext, useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useStripe } from '@stripe/react-stripe-js';
import { CartContext } from '../context/CartContext';

const ProductDetails = () => {
  const stripe = useStripe();
  const { id } = useParams();
  const location = useLocation();
  const isRefurbished = location.pathname.includes('refurbished');
  const isMiniPC = location.pathname.includes('mini-pcs');

  const productType = isRefurbished
    ? 'refurbished-laptop'
    : isMiniPC
      ? 'Mini PC'
      : 'Pre-Built PC';

  const productId = id;

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart, isLoggedIn, updateQuantity } = useContext(CartContext);
  const navigate = useNavigate();

  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLargeImage, setShowLargeImage] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(null);
  const { image: images = [], name, code, description, condition, specs = {}, finalPrice, originalPrice, discount, otherTechnicalDetails: otherDetails, bonuses, reviews: initialReviews = [] } = product || {};

  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [newReview, setNewReview] = useState("");
  const reviewsSectionRef = useRef(null);
  const [newImage, setNewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedSpecs, setSelectedSpecs] = useState({
    ramOptions: "",
    storage1Options: "",
    storage2Options: "",
  });

  useEffect(() => {
    if (specs && specs.ramOptions && specs.storage1Options && specs.storage2Options) {
      setSelectedSpecs({
        ramOptions: specs.ramOptions[0]?._id || "",
        storage1Options: specs.storage1Options[0]?._id || "",
        storage2Options: specs.storage2Options[0]?._id || "",
      });
    }
  }, [specs]); // This will run when specs change

  useEffect(() => {
    const fetchProduct = async (page = 1, limit = 10) => {
      try {
        const response = await fetch(`http://localhost:4000/api/admin/products?page=${page}&limit=${limit}`);
        if (response.ok) {
          const data = await response.json();

          let productItem;

          if (isRefurbished) {
            productItem = data.refurbishedProducts.find((item) => item._id === id);
          } else if (isMiniPC) {
            productItem = data.miniPCs.find((item) => item._id === id);
          } else {
            productItem = [...data.prebuildPC, ...data.officePC].find((item) => item._id === id);
          }

          console.log('Found Product:', productItem);

          if (productItem) {
            setProduct(productItem);  // Set the found product
            setReviews(productItem.reviews || []);  // Set reviews for that product
          } else {
            console.log('Product not found in the selected category');
            setProduct(null);
          }
        } else {
          console.log('Product not found in the API');
          setProduct(null);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct(1, 10);
  }, [id, isRefurbished, isMiniPC]);

  // Auto-scrolling for images
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3400); // Change image every 3 seconds

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [images]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!product) {
    console.log('Product is null or undefined');
    return <p className='text-amber-700'>Product not found</p>;
  }

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
      updateQuantity(product.id, quantity - 1);
    }
  };

  // Function to calculate the price of the selected specs
  const getSelectedSpecsPrice = () => {
    let finalPrice = product.finalPrice;  // Initialize finalPrice within the function

    // console.log("Selected Specs:", selectedSpecs);
    // console.log("Product Specs:", product.specs);

    // Iterate through the selected specs and calculate their prices
    Object.entries(selectedSpecs).forEach(([category, selectedValue]) => {
      // console.log("Checking category:", category);  // Log the category being checked

      const specOptions = product.specs[category];  // Get options for the category
      if (specOptions) {
        const selectedOption = specOptions.find((option) => option._id === selectedValue);  // Match by _id
        if (selectedOption) {
          finalPrice += selectedOption.price || 0;  // Add price to final price
        } else {
          // console.log(`No option found for selected value: ${selectedValue} in category: ${category}`);
        }
      } else {
        console.log(`No specs found for category: ${category}`);
      }
    });

    // console.log("Final Price Calculated:", finalPrice);
    return finalPrice;  // Return the calculated finalPrice
  };

  // Handler for spec change
  const handleSpecChange = (category, value, isOther = false) => {
    if (isOther) {
      // Handle "Other" input value separately
      setSelectedSpecs(prevState => ({
        ...prevState,
        [`other_${category}`]: value, // Store the "Other" input value separately
      }));
    } else {
      // Handle dropdown value (e.g., RAM, Storage1, Storage2)
      setSelectedSpecs(prevState => ({
        ...prevState,
        [category]: value, // Store the selected dropdown value
      }));
    }
  };

  const handlePreviousImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
    }
  };

  const handleNextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    console.log(`${product.name} added to cart`);
    navigate('/cart')
  };

  const getStarRating = (rating) => {
    const stars = [];
    // Determine the full, half, and empty stars based on the rating
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push('full'); // Full star
      } else if (rating >= i - 0.5) {
        stars.push('half'); // Half star
      } else {
        stars.push('empty'); // Empty star
      }
    }
    return stars;
  };

  const stars = getStarRating(product.rating); // Assuming product.rating is available

  const handleStarClick = (star) => {
    setReviewRating(star);  // Set review rating
    if (reviewsSectionRef.current) {
      // Scroll to the reviews section
      reviewsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Selected file:', file);
      const previewURL = URL.createObjectURL(file); // Generate a preview URL for the image
      setNewImage(previewURL); // Update the state with the preview URL
      setImageFile(file);
    }
  };

  const handleAddReview = async () => {
    if (newReview.trim()) {

      const user = JSON.parse(localStorage.getItem('user')); // Example: Get from localStorage
      const reviewerName = user?.name || 'Anonymous';

      const formData = new FormData();
      formData.append('reviewerName', reviewerName);
      formData.append('text', newReview);
      formData.append('rating', reviewRating);

      // Check if the image is properly selected
      if (imageFile) {
        formData.append('image', imageFile); // Append the File object
      } else {
        console.error('No valid image selected');
      }

      // Debug: Log the FormData contents
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }

      try {

        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/products/${encodeURIComponent(productType)}/${encodeURIComponent(productId)}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Server response:", data);
          // Update the reviews state with the new review
          if (data && data.review) {
            // Update reviews state with the new review if it's present in the response
            setReviews([...reviews, data.review]);
            setNewReview(""); // Clear the review input
            setNewImage(null); // Clear the image
            setReviewRating(0);
          }
        } else {
          console.error('Failed to submit review');
        }
      } catch (error) {
        console.error('Error submitting review:', error);
      }
    }
  };

  const downloadQuotation = async (productId, productName) => {
    try {
      const response = await fetch(`http://localhost:4000/api/download-quotation/${productId}`);

      if (!response.ok) throw new Error("Failed to fetch quotation");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Quotation-${productName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download Error:", error);
    }
  };

  const handleConfirmPayment = async () => {
    navigate('/payment', { state: { product } });
    // if (isLoggedIn) {
    // } else {
    //   navigate('/signin');
    // }
  };

  const handleThumbnailClick = (index) => {
    setModalImageIndex(index);
    setShowLargeImage(true);
  };

  const handleCancelImage = () => {
    setShowLargeImage(false);
    setModalImageIndex(null);
  };

  return (
    <>
      <Helmet>
        <title>{product ? `${product.name} | 7HubComputers` : "Product Details"}</title>
        <meta name="description" content={product?.description || "Product details page"} />
        <meta property="og:title" content={product?.name || "Product Details"} />
        <meta property="og:description" content={product?.description || "Product details page"} />
        <meta property="og:image" content={images?.[0] ? `http://localhost:4000/uploads/${images[0]}` : "default-image-url"} />
      </Helmet>
      <div className={`flex flex-col md:flex-row justify-start items-start p-5 md:p-10 bg-gray-900 text-white min-h-screen ${isModalOpen ? 'blur-sm' : ''}`}>
        {/* Left Section - Image Slider */}
        <div className="w-full md:w-1/3 flex flex-col justify-start items-center relative mb-5 md:mb-0 md:sticky top-20 z-2">
          <div className="relative w-full flex justify-center">
            {Array.isArray(images) && images.length > 0 ? (
              <div className="relative w-full h-[30em] flex justify-center items-center">
                {/* Badge for Refurbished Laptop */}
                {product.type === "Refurbished Laptop" && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-lg shadow-lg z-10 shadow-[0_0_20px_4px_rgba(255,0,0,0.8)]">
                    Refurbished
                  </div>
                )}

                {images.map((image, index) => {
                  // Check if image is a string and sanitize the file name
                  const sanitizedPath = typeof image === "string" ? image.split(/\\|\//).pop() : "";

                  return (
                    <img
                      key={index}
                      src={`http://localhost:4000/uploads/${sanitizedPath}`}
                      alt={`${product.name} - Image ${index + 1}`}
                      onClick={() => handleThumbnailClick(index)}
                      loading='lazy'
                      className={`absolute w-auto h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? "opacity-100" : "opacity-0"
                        }`}
                    />
                  );
                })}
              </div>
            ) : (
              <p>No images available</p>
            )}
            {/* Slider Controls */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-700 bg-opacity-50 p-2 rounded-full text-white"
                >
                  ‹
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 bg-opacity-50 p-2 rounded-full text-white"
                >
                  ›
                </button>
              </>
            )}
          </div>
          {/* Image Indicators */}
          <div className="flex space-x-2 mt-3">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-gray-500'}`}
              ></div>
            ))}
          </div>
          {/* Thumbnail Images */}
          <div className="flex space-x-2 mt-4 overflow-x-scroll overflow-y-hidden">
            {images.map((thumbnail, index) => {
              const sanitizedPath = thumbnail.split("\\").pop(); // Extract the filename
              const thumbnailURL = `http://localhost:4000/uploads/${sanitizedPath}`; // Construct the correct URL

              return (
                <img
                  key={index}
                  src={thumbnailURL}
                  alt={`Thumbnail ${index + 1}`}
                  onClick={() => setCurrentImageIndex(index)} // Change the current image index on click
                  className={`w-16 h-16 object-cover cursor-pointer rounded-lg transition-all duration-300 ease-in-out ${currentImageIndex === index
                    ? 'border-4 border-blue-500 transform scale-105'
                    : 'border border-transparent'
                    }`}
                />
              );
            })}
          </div>

          {showLargeImage && modalImageIndex !== null && (
            <div
              className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50"
            >
              {/* Large Image */}
              <div className="relative top-5">
                <img
                  src={`http://localhost:4000/uploads/${images[modalImageIndex].split("\\").pop()}`}
                  alt={`Large view of ${product.name}`}
                  className="max-w-full max-h-[75vh] object-contain z-10"
                />
                <button
                  onClick={handleCancelImage}
                  className="absolute top-2 right-2 bg-white text-black rounded-full p-2 hover:bg-gray-200 focus:outline-none"
                >
                  ✖
                </button>
              </div>

              {/* Thumbnail Navigation */}
              <div className="flex space-x-2 mt-5 overflow-x-auto">
                {images.map((thumbnail, index) => {
                  const sanitizedPath = `http://localhost:4000/uploads/${thumbnail.split("\\").pop()}`;
                  return (
                    <img
                      key={index}
                      src={sanitizedPath}
                      alt={`Thumbnail ${index + 1}`}
                      className={`w-16 h-16 object-cover border-2 cursor-pointer ${modalImageIndex === index ? 'border-blue-500' : 'border-gray-300'
                        }`}
                      onClick={() => setModalImageIndex(index)}
                    />
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right Section - Product Details */}
        <div className="w-full md:w-2/3 pl-0 md:pl-10 space-y-4 mt-16 md:mt-0 z-1">
          <span className={`text-xs px-2 py-1 rounded ${product.inStock ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {product.inStock ? "IN STOCK" : "OUT OF STOCK"}
          </span>

          <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
          <p className="text-gray-400">Code: {code}</p>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4 mt-4">
            <button
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-l-lg text-lg font-bold transition"
              onClick={handleDecrease}
            >
              -
            </button>
            <span className="bg-gray-800 text-white text-lg font-semibold px-6 py-2 rounded-md border border-gray-600">
              {quantity}
            </span>
            <button
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-r-lg text-lg font-bold transition"
              onClick={handleIncrease}
            >
              +
            </button>
          </div>

          {/* Product Rating */}
          <div className="flex items-center cursor-pointer" onClick={() => handleStarClick(product.rating)}>
            {stars.map((star, index) => (
              <span key={index} className={`text-yellow-400 text-lg mr-1`}>
                {star === 'full' ? '★' : star === 'half' ? '☆' : '☆'}
              </span>
            ))}
            <span className="text-gray-400">({product.rating})</span>
          </div>

          {/* Product Description */}
          <p className="text-gray-300">
            {isRefurbished ? (
              <span className="bg-yellow-500 text-black px-2 py-1 rounded">Condition: {condition}</span>
            ) : ""}
          </p>
          <p className="text-gray-300">{description}</p>

          {/* Top Product Price and Buttons */}
          <div className="">
            <div className="flex items-center space-x-2">
              <span className="bg-yellow-500 text-black text-sm px-2 py-1 rounded">-{discount}%</span>
              <p className="text-3xl md:text-4xl font-bold text-blue-400">₹{getSelectedSpecsPrice()}</p>
              <p className="text-xl text-gray-500 line-through">₹{originalPrice}</p>
            </div>

            <p className="text-sm text-blue-400">+{bonuses} bonuses for the purchase of goods!</p>
            {paymentError && <p className="text-red-500 mt-4">{paymentError}</p>}
            {paymentSuccess && <p className="text-green-500 mt-4">{paymentSuccess}</p>}

            <div className="flex flex-col md:flex-row space-x-0 md:space-x-4">
              <button
                onClick={handleAddToCart}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-10 rounded-lg text-xl font-semibold mt-4"
              >
                ADD TO CART
              </button>
              {product.inStock && (
                <button
                  onClick={handleConfirmPayment}
                  disabled={!stripe}
                  className="bg-green-600 text-white py-3 px-10 rounded-lg text-xl font-semibold mt-4 md:mt-0"
                >
                  BUY NOW
                </button>
              )}
              {productType === "Pre-Built PC" && (
                <button
                  onClick={() => downloadQuotation(product._id, product.name)}
                  className="bg-yellow-500 text-black py-3 px-6 rounded-lg text-lg font-semibold mt-4"
                >
                  Download Quotation
                </button>
              )}
            </div>
          </div>

          {/* Specifications Section */}
          <div className="relative w-full md:w-5/6 lg:w-11/12 bg-gray-800 p-6 rounded-lg mb-10 z-1">
            <h2 className="text-xl font-semibold text-white mb-4">Specifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
              {Object.keys(product.specs || {}).map((category) => {
                const isTargetCategory = ["ramOptions", "storage1Options", "storage2Options"].includes(category); // Check if category is one of the target categories
                const specOptions = product.specs[category]; // Options for this category

                return (
                  <div key={category} className="flex items-center bg-gray-900 p-4 rounded-lg shadow-md relative">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-200 uppercase mb-2">
                        {category === "liquidcooler" ? (
                          <span>Liquid&nbsp;Cooler</span>
                        ) : category === "graphiccard" ? (
                          <span>Graphic&nbsp;Card</span>
                        ) : category === "ramOptions" ? (
                          <span>RAM-Options</span>
                        ) : category === "storage1Options" ? (
                          <span>storage1-Options</span>
                        ) : category === "storage2Options" ? (
                          <span>storage2-Options</span>
                        ) : (
                          category // Default display of the category name
                        )}
                      </h3>

                      {/* Dropdown for RAM, Storage1, and Storage2 */}
                      {isTargetCategory ? (
                        <select
                          id={category}
                          className="p-2 rounded-md bg-gray-700 text-white w-[340px] overflow-hidden"
                          value={selectedSpecs[category] || ""}
                          onChange={(e) => handleSpecChange(category, e.target.value)}
                        >
                          {Array.isArray(specOptions) && specOptions.length > 0 &&
                            specOptions.map((spec, index) => (
                              <option key={index} value={spec._id}>
                                {spec.value} {/* Display value */}
                              </option>
                            ))}
                        </select>
                      ) : (
                        // Display specs for categories that aren't RAM, Storage1, or Storage2
                        Array.isArray(specOptions) && specOptions.length > 0 ? (
                          specOptions.map((spec, index) => (
                            <p key={index} className="text-gray-400 text-sm">
                              {spec.value}
                            </p>
                          ))
                        ) : (
                          <p className="text-gray-400 text-sm">
                            {typeof specOptions === "string" ? specOptions : "No details available"}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Other Technical Details */}
          <div className="bg-gray-800 p-6 rounded-lg w-full mb-10">
            <h2 className="text-xl font-semibold mb-4 text-white">Other Technical Details</h2>
            <table className="table-auto w-full text-left text-gray-300">
              <thead>
                <tr>
                  <th className="border-b border-gray-700 px-4 py-2">Feature</th>
                  <th className="border-b border-gray-700 px-4 py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(otherDetails) && otherDetails.length > 0 ? (
                  otherDetails.map((detail, index) => (
                    <tr key={index}>
                      <td className="border-b border-gray-700 px-4 py-2">{detail.name}</td>
                      <td className="border-b border-gray-700 px-4 py-2">{detail.value}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="border-b border-gray-700 px-4 py-2 text-gray-400">No details available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 p-10 border-t border-gray-300">
        {/* Notes Section */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 rounded-lg shadow-lg mb-10">
          <h2 className="text-xl font-semibold mb-2 text-yellow-700">*Note*</h2>
          <ul className="ist-disc list-inside text-yellow-900">
            {product.notes?.length > 0 ? (
              product.notes
                .map(note => note.trim()) // Trim leading/trailing spaces for each note
                .join(' ') // Join array into a single string
                .split('"') // Split by period
                .filter((note) => note.trim()) // Remove empty strings
                .map((note, index) => (
                  <li key={index} className="mb-2">
                    {note.replace(/[\[\],\\]/g, '').trim()} {/* Add the period back */}
                  </li>
                ))
            ) : (
              <li>No notes available</li>
            )}
          </ul>
        </div>

        {/* Reviews Section */}
        <div ref={reviewsSectionRef} className="bg-gray-800 p-6 rounded-lg mb-10">
          <h2 className="text-xl font-semibold mb-2 text-white">Reviews</h2>

          {/* Image Upload */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mb-2"
          /><br />
          {newImage && <img src={newImage} alt="Review" className="w-16 h-16 rounded-full mb-2" />}

          {/* Star Rating */}
          <div className="flex items-center mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setReviewRating(star)}
                className={`cursor-pointer text-xl ${reviewRating >= star ? 'text-yellow-500' : 'text-gray-400'
                  }`}
              >
                ★
              </span>
            ))}
          </div>

          {/* Review Text and Rating */}
          <input
            type="text"
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Write a review..."
            className="p-2 border border-gray-500 rounded-lg w-full mb-2 text-black"
          />

          <button onClick={handleAddReview} className="bg-blue-500 text-white p-2 rounded-lg">
            Submit Review
          </button>

          {/* Display Existing Reviews */}
          <div className="space-y-2 mb-4">
            {reviews.map((review, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  {/* Assuming the review object contains a username */}
                  <p className="text-white font-semibold">{review.username || `User ${index + 1}`}</p>
                </div>
                {/* Display product name */}
                <p className="text-white font-medium">{name}</p>

                {/* Review Text */}
                <p className="text-gray-300">{review.text}</p>

                <div className="flex items-center">
                  {/* Displaying rating with mid-size stars */}
                  <p className="text-gray-500 mr-2">Rating:</p>
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-yellow-500 text-lg ${i < review.rating ? 'text-yellow-500' : 'text-gray-400'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;