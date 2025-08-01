import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowBack, AccessTime } from '@mui/icons-material';
import { Box, CircularProgress } from '@mui/material';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { orderId, transactionId, paymentType, orderData } = location.state || {};
  console.log(orderId, transactionId, paymentType, orderData);

  const handleViewOrder = () => {
    try {
      setLoading(true);
      navigate(`/order/${orderId}`);
    } catch (error) {
      console.error('Navigation error:', error);
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    try {
      navigate('/home');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  // Format price with currency symbol
  const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex flex-col">
      {/* Success Icon and Title */}
      <div className="mt-8 mb-6 flex flex-col items-center justify-center px-4">
        <div className="h-20 w-20 rounded-full bg-green-50 flex items-center justify-center mb-4 shadow-md">
          <CheckCircle sx={{ fontSize: 48, color: '#22c55e' }} />
        </div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Order Placed Successfully!</h2>
        <p className="text-gray-600 text-center text-sm md:text-base max-w-sm">
          Your order has been placed successfully and is being processed.
        </p>
      </div>
      
      {/* Order Details */}
      <div className="flex-1 px-5 py-1">
        <div className="w-full max-w-md mx-auto bg-white rounded-[12px] p-4">
          <h3 className="text-gray-800 font-semibold mb-3 text-base">Order Details</h3>
          
          <div className="space-y-1 mb-5">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600 text-sm">Payment Method</span>
              <span className="font-medium text-gray-800 text-sm">{paymentType === 'wallet' ? 'Wallet' : 
                paymentType === 'delivery' ? 'Cash on Delivery' : 
                paymentType === 'online' ? 'Online Payment' : paymentType || 'N/A'}</span>
            </div>
            
            {orderData?.totalAmount && (
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 text-sm">Total Amount</span>
                <span className="font-semibold text-gray-900 text-sm">{formatPrice(orderData.totalAmount)}</span>
              </div>
            )}
            
            {orderData?.orderType && (
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 text-sm">Order Type</span>
                <span className="font-medium text-gray-800 capitalize text-sm">{orderData.orderType}</span>
              </div>
            )}
            
            {orderData?.pickupTime && (
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 text-sm">Pickup Time</span>
                <div className="flex items-center bg-orange-50 px-3 py-1.5 rounded-full">
                  <AccessTime sx={{ fontSize: 16, color: '#FF583A', marginRight: '6px' }} />
                  <span className="font-medium text-[#FF583A] text-sm">
                    {orderData.pickupTime.date?.label} {orderData.pickupTime.time}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {orderData?.address && (
            <div className="mb-5">
              <h3 className="font-medium text-gray-800 mb-2 text-sm">Delivery Address</h3>
              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-[12px] border border-gray-100">{orderData.address
              .split('\n')
              .slice(1)
              .join(' ')
              .trim()}</p>
            </div>
          )}
          
          {orderData?.instruction && (
            <div className="mb-5">
              <h3 className="font-medium text-gray-800 mb-2 text-sm">Instructions</h3>
              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-[12px] border border-gray-100 italic">{orderData.instruction}</p>
            </div>
          )}
          
          <div className="space-y-3 mt-6">
            <button 
              onClick={handleViewOrder}
              disabled={loading}
              className="w-full py-3 cursor-pointer bg-[#FF583A] text-white rounded-[12px] text-sm font-medium active:scale-98 transition-all duration-200 flex justify-center items-center hover:bg-[#e64d30]"
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "View My Order"
              )}
            </button>
            
            <button 
              onClick={handleBackToHome}
              className="w-full py-3 border cursor-pointer border-[#FF583A] text-[#FF583A] bg-white rounded-[12px] text-sm font-medium active:scale-98 transition-all duration-200 hover:bg-orange-50"
            >
              Continue Ordering
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;