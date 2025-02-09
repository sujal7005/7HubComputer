import { React, useEffect, useState } from 'react';
import { Link } from 'react-router-dom'

const testimonials = [
  {
    name: 'John Doe',
    feedback: 'The Gaming Beast is an absolute powerhouse! I couldn\'t be happier with my purchase.',
  },
  {
    name: 'Jane Smith',
    feedback: 'Expertly assembled and runs like a dream! Highly recommend.',
  },
  {
    name: 'Mike Johnson',
    feedback: 'Fantastic performance and top-notch components. Worth every penny!',
  },
];

const reviews = [
  {
    name: 'John Doe',
    rating: 5,
    feedback: 'The Gaming Beast is an absolute powerhouse! I couldn\'t be happier with my purchase.',
  },
  {
    name: 'Jane Smith',
    rating: 4,
    feedback: 'Expertly assembled and runs like a dream! Highly recommend.',
  },
  {
    name: 'Mike Johnson',
    rating: 3,
    feedback: 'Fantastic performance, but had some minor issues with setup.',
  },
  {
    name: 'Emily Davis',
    rating: 5,
    feedback: 'Great customer service and the product exceeded my expectations!',
  },
];

const Home = () => {

  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [dynamicText, setDynamicText] = useState("Welcome to 7HubComputer");
  const [backgroundImage, setBackgroundImage] = useState(
    "https://jetlaptechnologies.com/wp-content/uploads/2023/07/Antec-Torque.webp"
  );

  useEffect(() => {
    const texts = [
      "Personal Computers (Desktops & Laptops)",
      "High-Performance Workstations",
      "Powerful Gaming PCs",
      "Reliable Servers for Your Needs",
      "Compact Mini PCs for Space-Saving",
      "Sleek All-in-One Computers",
      "Efficient Chromebooks for Everyday Use"
    ];

    const images = [
      "https://jetlaptechnologies.com/wp-content/uploads/2023/07/Antec-Torque.webp",
      "https://example.com/image2.jpg", // Replace with your own image URLs
      "https://example.com/image3.jpg",
      "https://example.com/image4.jpg"
    ];

    let index = 0;
    let imageIndex = 0;

    const intervalId = setInterval(() => {
      setDynamicText(texts[index]);
      setBackgroundImage(images[imageIndex]);

      index = (index + 1) % texts.length;
      imageIndex = (imageIndex + 1) % images.length;
    }, 4000); // Change text every 4 seconds

    return () => clearInterval(intervalId); // Clean up on component unmount
  }, []);

  useEffect(() => {
    const fetchProducts = async (page = 1, limit = 10) => {
      try {
        const response = await fetch(`http://localhost:4000/api/admin/products?page=${page}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();
        // console.log(data)
        const allProducts = [
          ...data.prebuildPC,
          ...data.refurbishedProducts,
          ...data.miniPCs,
          // Add any other product categories here if applicable
        ];
        console.log("All Products:", allProducts)
        setProducts(allProducts);
      } catch (error) {
        console.error(error);
        setError("Unable to load products. Please try again.");
      }
    };

    fetchProducts(1, 10);
  }, [])

  const renderStars = (rating) => {
    const filledStars = Array(rating).fill('★'); // Filled stars
    const emptyStars = Array(5 - rating).fill('☆'); // Empty stars

    // Concatenate both arrays and map to render each star
    const stars = [...filledStars, ...emptyStars];

    return (
      <span className="text-yellow-500">
        {stars.map((star, index) => (
          <span key={index}>{star}</span>
        ))}
      </span>
    );
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section
        className="bg-cover bg-center h-screen relative text-white font-bold overflow-hidden animate-scroll"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          animation: "scrollBackground 20s linear infinite",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-transparent opacity-80"></div>

        <div className="relative container mx-auto flex flex-col md:flex-row items-center left-0 h-full px-6 md:px-12">
          <div className="text-left max-w-3xl">
            <h1 className="text-6xl md:text-7xl font-extrabold mb-4 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400 animate__animated animate__fadeInUp">
              {dynamicText}
            </h1>
            <p className="text-lg md:text-2xl font-light text-gray-300 mt-4 opacity-80 animate__animated animate__fadeInUp animate__delay-1s">
              Your one-stop destination for custom PCs, pre-built systems, laptops, and more.
            </p>
            <a
              href="#featured"
              className="mt-8 inline-block bg-gradient-to-r from-blue-500 to-teal-500 hover:from-teal-500 hover:to-blue-600 text-white py-3 px-6 rounded-full text-lg transition-transform transform hover:-translate-y-1 shadow-lg hover:shadow-xl duration-300"
            >
              Explore Now
            </a>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="featured" className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto text-center mb-12">
          <h2 className="text-4xl font-extrabold text-indigo-700 mb-6 shadow-md inline-block py-2 px-4 bg-white rounded-md">Featured Pre-Built PCs</h2>
          <p className="text-gray-700 text-lg mb-8">Explore our top selections to get started with the ultimate performance.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 container mx-auto px-6">
          {products
            .filter(product => product.type === "Pre-Built PC")
            .slice(0, 3)
            .map((product, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg transform hover:-translate-y-2 hover:shadow-2xl transition duration-300"
              >
                <img
                  src={`http://localhost:4000/uploads/${product.image[0].split('\\').pop()}`}
                  alt={product.name}
                  className="w-full h-56 object-cover transform transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
                  <p className="text-gray-600 text-lg mt-2">{product.price}</p>
                  <Link
                    to={`/prebuilt`}
                    className="mt-4 inline-block bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-blue-600 hover:to-indigo-600 text-white py-2 px-5 rounded-full transition-transform transform hover:-translate-y-1 shadow-md duration-300"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Call to Action Section */}
      {/* <section className="relative bg-gradient-to-r from-gray-800 to-gray-900 text-white py-20 text-center">
        <div className="absolute inset-0 bg-opacity-30 bg-[url('/path-to-your-background-image.jpg')] bg-cover bg-center"></div>
        <div className="relative z-10 container mx-auto px-6">
          <h2 className="text-5xl font-extrabold tracking-wide mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400 shadow-md">
            Ready to Take the Next Step?
          </h2>
          <p className="text-lg font-medium mb-8 max-w-xl mx-auto text-gray-300">
            Join thousands of satisfied customers and build your perfect PC today!
          </p>
          <a
            href="/custom"
            className="inline-block bg-gradient-to-r from-green-400 to-teal-500 hover:from-teal-500 hover:to-green-400 text-white py-4 px-8 rounded-full transition-transform transform hover:-translate-y-1 shadow-xl hover:shadow-2xl duration-300"
          >
            Start Customizing Now
          </a>
        </div> */}
        {/* Decorative Elements */}
        {/* <div className="absolute -top-6 left-10 w-24 h-24 bg-teal-500 bg-opacity-20 blur-lg rounded-full"></div>
        <div className="absolute top-10 right-16 w-36 h-36 bg-green-400 bg-opacity-10 blur-2xl rounded-full"></div>
        <div className="absolute bottom-8 left-20 w-20 h-20 bg-teal-400 bg-opacity-30 blur-lg rounded-full"></div>
      </section> */}


      {/* Refurbished Laptops Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto text-center mb-12">
          <h2 className="text-4xl font-extrabold text-indigo-700 mb-6 shadow-md inline-block py-2 px-4 bg-white rounded-md">Refurbished Laptops</h2>
          <p className="text-gray-700 text-lg mb-8">Quality refurbished laptops at unbeatable prices.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 container mx-auto px-6">
          {products
            .filter(laptop => laptop.type === "Refurbished Laptop")
            .slice(0, 3)
            .map((laptop, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition duration-300"
              >
                <img
                  src={`http://localhost:4000/uploads/${laptop.image[0].split('\\').pop()}`}
                  alt={laptop.name}
                  className="w-full h-56 object-cover transform transition-transform duration-300 hover:scale-90"
                  loading="lazy"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800">{laptop.name}</h3>
                  <p className="text-gray-600 text-lg mt-2">{laptop.price}</p>
                  <Link
                    to={`/laptops`}
                    className="mt-4 inline-block bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-blue-600 hover:to-indigo-600 text-white py-2 px-5 rounded-full transition-transform transform hover:-translate-y-1 shadow-md duration-300"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Quality Components Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Why Choose Us?</h2>
          <p className="text-gray-600 mb-6">Experience the best in performance and quality with our custom PC builds.</p>
        </div>
        <div className="flex flex-wrap justify-center mb-8">
          <div className="w-full md:w-1/3 p-4">
            <h3 className="text-xl font-semibold mb-2">High Performance</h3>
            <p className="text-gray-600">Our PCs are designed to handle the most demanding tasks with ease.</p>
          </div>
          <div className="w-full md:w-1/3 p-4">
            <h3 className="text-xl font-semibold mb-2">Quality Components</h3>
            <p className="text-gray-600">We use only the best components to ensure reliability and longevity.</p>
          </div>
          <div className="w-full md:w-1/3 p-4">
            <h3 className="text-xl font-semibold mb-2">Expert Assembly</h3>
            <p className="text-gray-600">All builds are expertly assembled by professionals to ensure peak performance.</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center">
          <div className="w-full md:w-1/2 p-4">
            <h3 className="text-xl font-semibold mb-2">Customer Testimonials</h3>
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="mb-4 p-2 border-l-4 border-blue-600">
                <p className="text-gray-600 italic">"{testimonial.feedback}"</p>
                <p className="text-gray-800 font-bold">- {testimonial.name}</p>
              </div>
            ))}
          </div>
          <div className="w-full md:w-1/2 p-4">
            <h3 className="text-xl font-semibold mb-2">Watch Our Builds</h3>
            <iframe
              width="100%"
              height="215"
              src="https://www.youtube.com/embed/your-video-id" // Replace with your video link
              title="Watch Our Builds"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-12 bg-gray-200">
        <div className="container mx-auto text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Customer Reviews</h2>
          <p className="text-gray-600 mb-6">What our customers are saying about us.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 container mx-auto px-4">
          {reviews.map((review, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden p-4">
              <h3 className="text-lg font-semibold">{review.name}</h3>
              <div className="flex items-center mb-2">
                {renderStars(review.rating)}
              </div>
              <p className="text-gray-600 italic">"{review.feedback}"</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;