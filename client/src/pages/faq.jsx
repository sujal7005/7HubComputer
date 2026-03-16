import React from "react";
import { Link } from 'react-router-dom';
import { FaQuestionCircle, FaEnvelope, FaPhone } from 'react-icons/fa';

const FAQ = () => {
  const faqs = [
    {
      question: "What is 7HubComputers all about?",
      answer: "7HubComputers is your premier destination for high-quality custom and pre-built desktop PCs. We specialize in building systems tailored to gamers, professionals, and everyday users, with a focus on performance, reliability, and customer satisfaction.",
    },
    {
      question: "How can I create an account?",
      answer: "Creating an account is simple! Click on the 'Account' button at the top-right corner of the page, select 'Sign Up', and fill out the registration form with your details. You'll be able to track orders, save configurations, and access exclusive offers.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept a wide range of payment methods including all major credit/debit cards (Visa, MasterCard, RuPay), UPI (Google Pay, PhonePe, Paytm), net banking, and cash on delivery for eligible orders.",
    },
    {
      question: "How does the Custom PC Builder work?",
      answer: "Our Custom PC Builder lets you choose every component of your dream system. Start by selecting your processor, then add compatible motherboard, RAM, storage, graphics card, and more. The builder ensures compatibility and shows real-time price updates.",
    },
    {
      question: "Do you provide warranty on your products?",
      answer: "Yes! All our pre-built and custom systems come with a comprehensive 2-year warranty on parts and labor. Individual components also carry their manufacturer warranties. Extended warranty options are available at checkout.",
    },
    {
      question: "What is your shipping policy?",
      answer: "We offer free shipping on all orders above ₹50,000 within India. Standard shipping takes 3-5 business days. All systems are carefully packed with premium packaging materials to ensure safe delivery.",
    },
    {
      question: "Can I return or cancel my order?",
      answer: "Orders can be cancelled within 24 hours of placement for a full refund. For returns, we have a 7-day return policy if the system arrives damaged or defective. Custom builds are non-returnable but fully covered under warranty.",
    },
    {
      question: "Do you offer technical support?",
      answer: "Absolutely! Our team provides lifetime technical support for all systems purchased from us. You can reach us via phone, email, or live chat during business hours. We also offer remote assistance for software issues.",
    },
    {
      question: "Are the refurbished laptops quality tested?",
      answer: "Yes, every refurbished laptop undergoes a rigorous 30-point quality check including hardware testing, cosmetic inspection, and performance benchmarking. They also come with a 1-year warranty for your peace of mind.",
    },
    {
      question: "How can I track my order?",
      answer: "Once your order is shipped, you'll receive a tracking number via email and SMS. You can also track your order status in real-time by logging into your account and visiting the 'My Orders' section.",
    },
  ];

  return (
    <div className="bg-white pt-24 md:pt-28 pb-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
        
        {/* Page Header */}
        <div className="border-b-2 border-black pb-8 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <FaQuestionCircle className="text-3xl text-black" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">Got Questions?</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about our products, services, and policies.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border-2 border-black bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-black mb-3 flex items-start gap-3">
                  <span className="w-6 h-6 bg-black text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                    {index + 1}
                  </span>
                  <span>{faq.question}</span>
                </h2>
                <p className="text-gray-700 pl-9">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions Section */}
        <div className="mt-16 border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-bold text-black mb-4">Still Have Questions?</h2>
          <p className="text-gray-700 mb-6">
            Can't find the answer you're looking for? Our support team is here to help!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 border-2 border-black hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center flex-shrink-0">
                <FaEnvelope className="text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider">Email Us</p>
                <a href="mailto:support@7hubcomputers.com" className="text-black font-medium hover:underline">
                  support@7hubcomputers.com
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 border-2 border-black hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center flex-shrink-0">
                <FaPhone className="text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider">Call Us</p>
                <a href="tel:+919876543210" className="text-black font-medium hover:underline">
                  +91 98765 43210
                </a>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <Link
              to="/contact"
              className="inline-block px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors border-2 border-black"
            >
              CONTACT SUPPORT
            </Link>
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

export default FAQ;