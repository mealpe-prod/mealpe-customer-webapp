import React from 'react';

const PaymentMode = ({ paymentMode, setPaymentMode, priceBreakdown, walletBalance, formatCurrency }) => {
  return (
    <div className="bg-white p-4 mb-3 rounded-[12px]">
      <p className="text-sm mb-3">Payment Mode :</p>
      <div className="space-y-3">
        {priceBreakdown.isAcceptingCash && (
          <button 
            className={`w-full py-3 px-4 border rounded-[12px] text-sm flex items-center active:scale-95 transition-all duration-300 cursor-pointer ${
              paymentMode === 'cash' 
                ? 'border-[#FF583A] bg-[#FFF1EE]' 
                : 'border-gray-300'
            }`}
            onClick={() => setPaymentMode('cash')}
          >
            {paymentMode === 'cash' && (
              <span className="w-4 h-4 mr-1 bg-[#FF583A] text-white rounded-full text-xs flex items-center justify-center">⬤</span>
            )}
            {paymentMode !== 'cash' && (
              <span className="w-4 h-4 mr-3 border-2 border-gray-300 rounded-full"></span>
            )}
            Pay on Delivery
          </button>
        )}
        
        {priceBreakdown.isAcceptingWallet && walletBalance > 0 && (
          <button 
            className={`w-full py-3 px-4 border rounded-[12px] text-sm flex items-center active:scale-95 transition-all duration-300 cursor-pointer ${
              paymentMode === 'wallet' 
                ? 'border-[#FF583A] bg-[#FFF1EE]' 
                : 'border-gray-300'
            }`}
            onClick={() => setPaymentMode('wallet')}
          >
            {paymentMode === 'wallet' && (
              <span className="w-4 h-4 mr-1 bg-[#FF583A] text-white rounded-full text-xs flex items-center justify-center">⬤</span>
            )}
            {paymentMode !== 'wallet' && (
              <span className="inline-block w-4 h-4 mr-3 border-2 border-gray-300 rounded-full"></span>
            )}
            MealPe Wallet
            <span className="ml-auto text-sm text-gray-500">Balance - {formatCurrency(walletBalance)}</span>
          </button>
        )}
        
        {priceBreakdown.isAcceptingOnline && (
          <button 
              className={`w-full py-3 px-4 border rounded-[12px] text-sm flex items-center active:scale-95 transition-all duration-300 cursor-pointer ${
              paymentMode === 'online' 
                ? 'border-[#FF583A] bg-[#FFF1EE]' 
                : 'border-gray-300'
            }`}
            onClick={() => setPaymentMode('online')}
          >
            {paymentMode === 'online' && (
              <span className="w-4 h-4 mr-1 bg-[#FF583A] text-white rounded-full text-xs flex items-center justify-center">⬤</span>
            )}
            {paymentMode !== 'online' && (
              <span className="inline-block w-4 h-4 mr-3 border-2 border-gray-300 rounded-full"></span>
            )}
            Pay Online
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentMode; 