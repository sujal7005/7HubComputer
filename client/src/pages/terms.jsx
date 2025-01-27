import React from "react";

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-800 text-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4">
        Welcome to our platform. By accessing or using our services, you agree to abide by these Terms of Service. Please read them carefully.
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-4">1. Acceptance of Terms</h2>
      <p className="mb-4">
        By using our website or services, you agree to be bound by these terms, our Privacy Policy, and any additional guidelines we provide.
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-4">2. Use of Services</h2>
      <p className="mb-4">
        You agree to:
        <ul className="list-disc list-inside">
          <li>Use the services only for lawful purposes</li>
          <li>Not misuse or attempt to disrupt our platform</li>
          <li>Provide accurate and truthful information during account registration</li>
        </ul>
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-4">3. Account Responsibilities</h2>
      <p className="mb-4">
        You are responsible for maintaining the confidentiality of your account information and for all activities conducted under your account.
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-4">4. Intellectual Property</h2>
      <p className="mb-4">
        All content, logos, and trademarks displayed on this platform are the property of their respective owners. Unauthorized use is prohibited.
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-4">5. Termination</h2>
      <p className="mb-4">
        We reserve the right to suspend or terminate your access to our services at our discretion for any violation of these terms.
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-4">6. Limitation of Liability</h2>
      <p className="mb-4">
        We are not liable for any indirect, incidental, or consequential damages resulting from your use of our services.
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-4">7. Changes to Terms</h2>
      <p className="mb-4">
        We reserve the right to update or modify these terms at any time. Continued use of the platform constitutes acceptance of the revised terms.
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-4">8. Governing Law</h2>
      <p className="mb-4">
        These terms are governed by the laws of [Your Jurisdiction]. Any disputes will be resolved exclusively in the courts of [Your Location].
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-4">9. Contact Us</h2>
      <p className="mb-4">
        If you have any questions about these Terms of Service, please contact us:
        <br />
        <strong>Email:</strong> support@example.com
      </p>
    </div>
  );
};

export default TermsOfService;