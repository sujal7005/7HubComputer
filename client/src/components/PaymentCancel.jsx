import { Link } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';

const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center">
      <div className="bg-white p-12 rounded-2xl shadow-2xl text-center max-w-md border-4 border-red-500">
        <FaTimesCircle className="text-7xl text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
        <p className="text-gray-600 mb-6">Your payment was cancelled. No charges were made.</p>
        <Link 
          to="/cart" 
          className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Return to Cart
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancel;