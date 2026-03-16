import React from "react";
import { Link } from 'react-router-dom';
import { FaGavel, FaFileContract, FaShieldAlt, FaEnvelope } from 'react-icons/fa';

const TermsOfService = () => {
  return (
    <div className="bg-white pt-24 md:pt-28 pb-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
        
        {/* Page Header */}
        <div className="border-b-2 border-black pb-8 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <FaGavel className="text-3xl text-black" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">Legal Agreement</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: February 15, 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="border-2 border-black p-8 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 mb-8">
          <p className="text-gray-700 text-lg leading-relaxed">
            Welcome to <span className="font-bold text-black">7HubComputers</span>. By accessing or using our services, you agree to abide by these Terms of Service. Please read them carefully before using our platform.
          </p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6">
          
          {/* Section 1 */}
          <div className="border-2 border-black p-6 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h2 className="text-2xl font-bold text-black">Acceptance of Terms</h2>
            </div>
            <div className="pl-13">
              <p className="text-gray-700">
                By using our website, purchasing products, or accessing any of our services, you agree to be bound by these Terms of Service, our Privacy Policy, and any additional guidelines or rules we may provide. If you do not agree to these terms, please do not use our services.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="border-2 border-black p-6 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h2 className="text-2xl font-bold text-black">Use of Services</h2>
            </div>
            <div className="pl-13">
              <p className="text-gray-700 mb-4">
                When using our services, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Use the services only for lawful purposes and in accordance with these terms</li>
                <li>Not engage in any activity that disrupts or interferes with our platform's functionality</li>
                <li>Provide accurate, current, and complete information during account registration and checkout</li>
                <li>Not attempt to gain unauthorized access to any part of our platform</li>
                <li>Not use our services for any fraudulent or illegal activities</li>
              </ul>
            </div>
          </div>

          {/* Section 3 */}
          <div className="border-2 border-black p-6 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h2 className="text-2xl font-bold text-black">Account Responsibilities</h2>
            </div>
            <div className="pl-13">
              <p className="text-gray-700">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account. We are not liable for any loss or damage arising from your failure to protect your account information.
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div className="border-2 border-black p-6 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg">
                4
              </div>
              <h2 className="text-2xl font-bold text-black">Orders and Payments</h2>
            </div>
            <div className="pl-13">
              <p className="text-gray-700 mb-4">
                By placing an order, you agree to the following:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>All prices are in Indian Rupees (₹) and include applicable taxes unless stated otherwise</li>
                <li>Payment must be received in full before order processing begins</li>
                <li>We reserve the right to cancel or refuse any order at our discretion</li>
                <li>Custom-built PCs are non-returnable but covered under warranty</li>
                <li>Shipping times are estimates and not guaranteed</li>
              </ul>
            </div>
          </div>

          {/* Section 5 */}
          <div className="border-2 border-black p-6 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg">
                5
              </div>
              <h2 className="text-2xl font-bold text-black">Shipping and Delivery</h2>
            </div>
            <div className="pl-13">
              <p className="text-gray-700">
                We ship to addresses within India. Risk of loss and title for products pass to you upon delivery. We are not responsible for delays caused by carriers, weather, or other factors beyond our control. Free shipping applies to orders over ₹50,000.
              </p>
            </div>
          </div>

          {/* Section 6 */}
          <div className="border-2 border-black p-6 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg">
                6
              </div>
              <h2 className="text-2xl font-bold text-black">Warranty and Returns</h2>
            </div>
            <div className="pl-13">
              <p className="text-gray-700 mb-4">
                Our warranty and return policy includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>2-year comprehensive warranty on all pre-built and custom systems</li>
                <li>1-year warranty on refurbished laptops</li>
                <li>30-day return policy for unused, unopened products (excluding custom builds)</li>
                <li>Manufacturer warranties on individual components</li>
              </ul>
            </div>
          </div>

          {/* Section 7 */}
          <div className="border-2 border-black p-6 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg">
                7
              </div>
              <h2 className="text-2xl font-bold text-black">Intellectual Property</h2>
            </div>
            <div className="pl-13">
              <p className="text-gray-700">
                All content on this platform, including logos, images, text, and software, is the property of 7HubComputers or its licensors and is protected by copyright and intellectual property laws. Unauthorized use, reproduction, or distribution is prohibited.
              </p>
            </div>
          </div>

          {/* Section 8 */}
          <div className="border-2 border-black p-6 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg">
                8
              </div>
              <h2 className="text-2xl font-bold text-black">Limitation of Liability</h2>
            </div>
            <div className="pl-13">
              <p className="text-gray-700">
                To the maximum extent permitted by law, 7HubComputers shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, arising from your use of our services or products.
              </p>
            </div>
          </div>

          {/* Section 9 */}
          <div className="border-2 border-black p-6 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg">
                9
              </div>
              <h2 className="text-2xl font-bold text-black">Changes to Terms</h2>
            </div>
            <div className="pl-13">
              <p className="text-gray-700">
                We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of our platform after any changes constitutes acceptance of the revised terms.
              </p>
            </div>
          </div>

          {/* Section 10 */}
          <div className="border-2 border-black p-6 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg">
                10
              </div>
              <h2 className="text-2xl font-bold text-black">Governing Law</h2>
            </div>
            <div className="pl-13">
              <p className="text-gray-700">
                These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3 mb-6">
            <FaEnvelope className="text-2xl text-black" />
            <h2 className="text-2xl font-bold text-black">Contact Us</h2>
          </div>
          
          <p className="text-gray-700 mb-6">
            If you have any questions about these Terms of Service, please contact us:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-black p-4 hover:bg-gray-50 transition-colors">
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Email</p>
              <a href="mailto:legal@7hubcomputers.com" className="text-black font-medium hover:underline">
                legal@7hubcomputers.com
              </a>
            </div>
            <div className="border-2 border-black p-4 hover:bg-gray-50 transition-colors">
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Phone</p>
              <a href="tel:+919876543210" className="text-black font-medium hover:underline">
                +91 98765 43210
              </a>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-6 text-center">
            For legal inquiries, please allow up to 7 business days for a response.
          </p>
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

export default TermsOfService;