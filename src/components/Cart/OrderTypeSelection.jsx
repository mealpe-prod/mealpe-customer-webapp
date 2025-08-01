import React from 'react';

const OrderTypeSelection = ({ orderType, setOrderType, outletDetails }) => {
  return (
    <div className="bg-white p-4 mb-3 rounded-[12px]">
      <p className="text-sm mb-3">Select Order Type :</p>
      <div className="flex gap-2">
        {outletDetails?.outdetails?.isDineIn && (
          <button 
            className={`py-2 px-4 border rounded-[12px] text-sm active:scale-95 transition-all duration-300 cursor-pointer ${
              orderType === 'dining' 
                ? 'border-[#FF583A] bg-[#FFF1EE] text-[#FF583A]' 
                : 'border-gray-300 bg-white'
            }`}
            onClick={() => setOrderType('dining')}
          >
            <div className="flex items-center">
              {orderType === 'dining' && (
                <span className="w-4 h-4 mr-1 bg-[#FF583A] text-white rounded-full text-xs flex items-center justify-center">✓</span>
              )}
              <span>Dining</span>
            </div>
          </button>
        )}
        
        {outletDetails?.outdetails?.isPickUp && (
          <button 
            className={`py-2 px-4 border rounded-[12px] text-sm active:scale-95 transition-all duration-300 cursor-pointer ${
              orderType === 'takeaway' 
                ? 'border-[#FF583A] bg-[#FFF1EE] text-[#FF583A]' 
                : 'border-gray-300 bg-white'
            }`}
            onClick={() => setOrderType('takeaway')}
          >
            <div className="flex items-center">
              {orderType === 'takeaway' && (
                <span className="w-4 h-4 mr-1 bg-[#FF583A] text-white rounded-full text-xs flex items-center justify-center">✓</span>
              )}
              <span>Take Away</span>
            </div>
          </button>
        )}
        
        {outletDetails?.outdetails?.isDelivery && (
          <button 
            className={`py-2 px-4 border rounded-[12px] text-sm active:scale-95 transition-all duration-300 cursor-pointer ${
              orderType === 'delivery' 
                ? 'border-[#FF583A] bg-[#FFF1EE] text-[#FF583A]' 
                : 'border-gray-300 bg-white'
            }`}
            onClick={() => setOrderType('delivery')}
          >
            <div className="flex items-center">
              {orderType === 'delivery' && (
                <span className="w-4 h-4 mr-1 bg-[#FF583A] text-white rounded-full text-xs flex items-center justify-center">✓</span>
              )}
              <span>Delivery</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderTypeSelection; 