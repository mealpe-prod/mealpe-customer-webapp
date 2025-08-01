import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Cancel, ArrowBack, SentimentVeryDissatisfied } from '@mui/icons-material';

const PaymentFailed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { errorMessage } = location.state || {};


  const handleTryAgain = () => {
    try {
      navigate('/cart');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleBackToHome = () => {
    try {
      navigate('/');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col -mt-12 md:-mt-0">
      {/* Header */}
      {/* <div className="bg-white px-4 py-3 shadow-sm flex items-center sticky top-0 z-10">
        <button 
          onClick={handleBackToHome}
          className="mr-4 p-1 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
          aria-label="Back to home"
        >
          <ArrowBack sx={{ fontSize: 20 }} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Payment Failed</h1>
      </div> */}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="relative mb-6">
            <div className="absolute -inset-3 rounded-full bg-red-100 opacity-50 animate-pulse"></div>
            <div className="relative h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
              <SentimentVeryDissatisfied sx={{ fontSize: 48, color: '#ef4444' }} />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Payment Failed</h2>
          
          <p className="text-gray-600 text-center text-sm mb-8 max-w-xs">
            {errorMessage || 'Your payment could not be processed. Please try again or choose a different payment method.'}
          </p>
          
          <div className="w-full space-y-3 max-w-xs">
            <button 
              onClick={handleTryAgain}
              className="w-full py-2.5 cursor-pointer bg-[#FF583A] text-white text-sm rounded-[12px] font-medium active:scale-[0.98] transition-all duration-300 hover:bg-[#e64d30] focus:outline-none"
            >
              Try Again
            </button>
            
            <button 
              onClick={handleBackToHome}
              className="w-full py-2.5 border cursor-pointer border-[#FF583A] text-[#FF583A] bg-white text-sm rounded-[12px] font-medium active:scale-[0.98] transition-all duration-300 hover:bg-red-50 focus:outline-none"
            >
              Back to Home
            </button>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Need help? <span className="text-[#FF583A] font-medium">Contact Support</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed; 