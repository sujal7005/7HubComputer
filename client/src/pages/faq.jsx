import React from "react";

const FAQ = () => {
  const faqs = [
    {
      question: "What is this platform about?",
      answer: "Our platform provides solutions for e-commerce, custom PCs, and pre-built desktop setups to meet your needs.",
    },
    {
      question: "How can I create an account?",
      answer: "You can create an account by clicking on the 'Sign Up' button at the top-right corner and filling out the registration form.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept various payment methods including credit/debit cards, UPI, and popular online wallets.",
    },
    {
      question: "Can I customize a PC using your platform?",
      answer: "Yes! You can use our Custom PC Builder to create a setup tailored to your specific requirements.",
    },
    {
      question: "Do you provide international shipping?",
      answer: "Currently, we provide shipping within India. International shipping will be available soon.",
    },
    {
      question: "How can I contact support?",
      answer: "You can reach our support team via email at support@example.com or through the Contact Us page.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-800 text-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-700 pb-4">
            <h2 className="text-xl font-semibold">{faq.question}</h2>
            <p className="mt-2 text-gray-300">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;