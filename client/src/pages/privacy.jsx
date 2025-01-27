import React from "react";

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-800 text-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">
        Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our services.
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-4">1. Information We Collect</h2>
      <p className="mb-4">
        We may collect personal information such as your name, email address, phone number, and other details you provide when you sign up, log in, or use our services. Additionally, we collect non-personal information such as your IP address and browser type for analytics purposes.
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-4">2. How We Use Your Information</h2>
      <p className="mb-4">
        We use your information to:
        <ul className="list-disc list-inside">
          <li>Provide and improve our services</li>
          <li>Personalize your user experience</li>
          <li>Communicate with you about updates and promotions</li>
          <li>Ensure the security of our platform</li>
        </ul>
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-4">3. Data Sharing and Protection</h2>
      <p className="mb-4">
        We do not sell or share your personal information with third parties except as required by law or to provide services (e.g., payment processing). We take reasonable measures to protect your information from unauthorized access.
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-4">4. Your Rights</h2>
      <p className="mb-4">
        You have the right to:
        <ul className="list-disc list-inside">
          <li>Access your personal information</li>
          <li>Request corrections to your information</li>
          <li>Request deletion of your data</li>
        </ul>
        Please contact us if you wish to exercise these rights.
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-4">5. Changes to This Policy</h2>
      <p className="mb-4">
        We may update this Privacy Policy from time to time. Any changes will be posted on this page with the updated effective date.
      </p>

      <h2 className="text-2xl font-bold mt-6 mb-4">6. Contact Us</h2>
      <p className="mb-4">
        If you have any questions or concerns about this Privacy Policy, please contact us at:
        <br />
        <strong>Email:</strong> support@example.com
      </p>
    </div>
  );
};

export default Privacy;