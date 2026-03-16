import React from "react";
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaLock, FaUserSecret, FaEnvelope } from 'react-icons/fa';

const Privacy = () => {
  return (
    <div className="bg-white pt-24 md:pt-28 pb-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
        
        {/* Page Header */}
        <div className="border-b-2 border-black pb-8 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <FaShieldAlt className="text-3xl text-black" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">Your Privacy Matters</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: February 15, 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="border-2 border-black p-8 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 mb-8">
          <p className="text-gray-700 text-lg leading-relaxed">
            Your privacy is important to us. This Privacy Policy explains how <span className="font-bold text-black">7HubComputers</span> collects, uses, and protects your information when you use our services. By using our platform, you agree to the terms outlined in this policy.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-6">
          
          {/* Section 1 */}
          <div className="border-2 border-black p-6 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h2 className="text-2xl font-bold text-black">Information We Collect</h2>
            </div>
            <div className="pl-13">
              <p className="text-gray-700 mb-4">
                We may collect the following types of information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><span className="font-bold text-black">Personal Information:</span> Your name, email address, phone number, and shipping address when you create an account or place an order.</li>
                <li><span className="font-bold text-black">Payment Information:</span> Credit/debit card details, UPI IDs, and billing information (processed securely through our payment partners).</li>
                <li><span className="font-bold text-black">Account Information:</span> Username, password, and order history associated with your account.</li>
                <li><span className="font-bold text-black">Technical Information:</span> IP address, browser type, device information, and cookies for analytics and site optimization.</li>
                <li><span className="font-bold text-black">Communication Data:</span> Any information you provide when contacting our support team or subscribing to newsletters.</li>
              </ul>
            </div>
          </div>

          {/* Section 2 */}
          <div className="border-2 border-black p-6 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h2 className="text-2xl font-bold text-black">How We Use Your Information</h2>
            </div>
            <div className="pl-13">
              <p className="text-gray-700 mb-4">
                We use your information to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Process and fulfill your orders, including sending order confirmations and shipping updates</li>
                <li>Provide, maintain, and improve our services and user experience</li>
                <li>Personalize your experience and recommend products you might like</li>
                <li>Communicate with you about promotions, new products, and important updates</li>
                <li>Ensure the security and integrity of our platform</li>
                <li>Respond to your questions, comments, or concerns</li>
                <li>Analyze usage patterns to improve our website and services</li>
              </ul>
            </div>
          </div>

          {/* Section 3 */}
          <div className="border-2 border-black p-6 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h2 className="text-2xl font-bold text-black">Data Sharing and Protection</h2>
            </div>
            <div className="pl-13 space-y-4">
              <p className="text-gray-700">
                <span className="font-bold text-black">We do not sell or rent your personal information</span> to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><span className="font-bold text-black">Service Providers:</span> With trusted partners who help us process payments, deliver orders, and provide customer support</li>
                <li><span className="font-bold text-black">Legal Requirements:</span> When required by law or to protect our rights and safety</li>
                <li><span className="font-bold text-black">Business Transfers:</span> In the event of a merger, acquisition, or sale of assets</li>
              </ul>
              <div className="mt-4 p-4 bg-gray-50 border-l-4 border-black">
                <p className="text-gray-700 flex items-center gap-2">
                  <FaLock className="text-black" />
                  <span className="font-medium">We use industry-standard encryption and security measures to protect your data.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="border-2 border-black p-6 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg">
                4
              </div>
              <h2 className="text-2xl font-bold text-black">Your Rights</h2>
            </div>
            <div className="pl-13">
              <p className="text-gray-700 mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><span className="font-bold text-black">Access:</span> Request a copy of the personal data we hold about you</li>
                <li><span className="font-bold text-black">Correction:</span> Update or correct inaccurate information</li>
                <li><span className="font-bold text-black">Deletion:</span> Request deletion of your data (subject to legal requirements)</li>
                <li><span className="font-bold text-black">Opt-out:</span> Unsubscribe from marketing communications</li>
                <li><span className="font-bold text-black">Cookie Preferences:</span> Manage cookie settings through your browser</li>
              </ul>
            </div>
          </div>

          {/* Section 5 */}
          <div className="border-2 border-black p-6 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg">
                5
              </div>
              <h2 className="text-2xl font-bold text-black">Cookies and Tracking</h2>
            </div>
            <div className="pl-13">
              <p className="text-gray-700">
                We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser preferences. By continuing to use our site, you consent to our use of cookies as described in this policy.
              </p>
            </div>
          </div>

          {/* Section 6 */}
          <div className="border-2 border-black p-6 bg-white hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-lg">
                6
              </div>
              <h2 className="text-2xl font-bold text-black">Changes to This Policy</h2>
            </div>
            <div className="pl-13">
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. Any updates will be posted on this page with the revised effective date. We encourage you to review this policy periodically.
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
            If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-black p-4 hover:bg-gray-50 transition-colors">
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Email</p>
              <a href="mailto:privacy@7hubcomputers.com" className="text-black font-medium hover:underline">
                privacy@7hubcomputers.com
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
            We typically respond to privacy inquiries within 5-7 business days.
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

export default Privacy;