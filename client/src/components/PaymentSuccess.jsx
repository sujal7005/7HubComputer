import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate('/profile');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
      <div className="bg-white p-12 rounded-2xl shadow-2xl text-center max-w-md border-4 border-green-500">
        <FaCheckCircle className="text-7xl text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">Thank you for your purchase. Your order has been confirmed.</p>
        <p className="text-sm text-gray-500">Redirecting to your profile...</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;