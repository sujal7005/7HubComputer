import React, { useState } from 'react';

const Support = () => {
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    email: '',
    message: '',
  });

  const supportOptions = [
    { title: 'Technical Support' },
    { title: 'Customer Service' },
    { title: 'Billing and Payments' },
    { title: 'Feedback and Suggestions' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:5000/api/support', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      setFormData({ title: '', name: '', email: '', message: '' });
    } else {
      alert(result.message || 'Something went wrong!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-800 text-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6">Support Center</h1>
      <form onSubmit={handleSubmit}>
        <select
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="block w-full p-2 mb-4 bg-gray-700 text-white rounded"
        >
          <option value="" disabled>
            Select Support Type
          </option>
          {supportOptions.map((option, index) => (
            <option key={index} value={option.title}>
              {option.title}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name"
          required
          className="block w-full p-2 mb-4 bg-gray-700 text-white rounded"
        />

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your Email"
          required
          className="block w-full p-2 mb-4 bg-gray-700 text-white rounded"
        />

        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Your Message"
          required
          className="block w-full p-2 mb-4 bg-gray-700 text-white rounded"
        />

        <button
          type="submit"
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
        >
          Send Message
        </button>
      </form>
    </div>
  );
};

export default Support;
