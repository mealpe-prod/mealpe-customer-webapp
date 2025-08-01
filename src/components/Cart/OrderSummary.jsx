import React from 'react';

const OrderSummary = ({ subtotal, priceBreakdown, loadingPrices, formatCurrency, items }) => {
  return (
    <div className="bg-white p-4 mb-3 rounded-[12px]">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-500">Sub Total + Taxes</span>
        <span className="text-sm font-medium">{formatCurrency(subtotal)}</span>
      </div>
      
      {loadingPrices && (
        <div className="text-sm text-gray-500 mb-2">Loading price details...</div>
      )}
      
      {priceBreakdown.isGstApplied && priceBreakdown.foodGST > 0 && (
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">GST</span>
          <span className="text-sm font-medium">{formatCurrency(priceBreakdown.foodGST)}</span>
        </div>
      )}
      
      {priceBreakdown.convenienceTotalAmount > 0 && (
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">Convenience Fee</span>
          <span className="text-sm font-medium">{formatCurrency(priceBreakdown.convenienceTotalAmount)}</span>
        </div>
      )}
      
      {priceBreakdown.deliveryCharge > 0 && (
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">Delivery Charges</span>
          <span className="text-sm font-medium">{formatCurrency(priceBreakdown.deliveryCharge)}</span>
        </div>
      )}
      
      {priceBreakdown.packagingCharge > 0 && (
        <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Packaging Charges</span>
            <span className="text-sm font-medium">{formatCurrency(priceBreakdown.packagingCharge)}</span>
        </div>
      )}
      
      <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between">
        <span className="text-sm font-medium">Total :</span>
        <span className="text-sm font-bold">{formatCurrency(priceBreakdown.totalPriceForCustomer || subtotal)}</span>
      </div>
      <div className="text-sm text-gray-500 text-right mt-1">
        ({items.reduce((acc, item) => acc + (item.qty || 1), 0)} items)
      </div>
    </div>
  );
};

export default OrderSummary; 