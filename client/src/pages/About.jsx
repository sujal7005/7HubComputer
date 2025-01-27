// src/pages/About.jsx
import React from 'react';

const About = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">About PlexiForge</h1>
      <p className="text-lg mb-4">
        At PlexiForge, we specialize in building high-quality custom and pre-built desktop PCs tailored to meet your unique needs. Whether you're a gamer, a professional, or just someone who wants a reliable computer, we have the perfect solution for you.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
      <p className="mb-4">
        Our mission is to provide our customers with the best possible PC building experience. We believe that everyone deserves a machine that can handle their specific requirements, whether it’s for gaming, content creation, or everyday use.
      </p>
      <h2 className="text-2xl font-semibold mb-2">Why Choose Us?</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Custom builds tailored to your specifications</li>
        <li>High-quality components for optimal performance</li>
        <li>Expert advice and support throughout the buying process</li>
        <li>Competitive pricing without compromising quality</li>
        <li>Comprehensive warranty on all products</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-2">Get in Touch</h2>
      <p>
        If you have any questions or need assistance, feel free to contact us through our <a href="/contact" className="text-blue-500 hover:underline">Contact page</a>. We're here to help!
      </p>
    </div>
  );
};

export default About;