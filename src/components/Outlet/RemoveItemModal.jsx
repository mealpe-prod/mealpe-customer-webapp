import React from 'react';

const RemoveItemModal = ({ 
  show, 
  onClose, 
  item, 
  matchingCartItems, 
  onRemoveItem,
  getItemDescription 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
      <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-2">Remove {item.itemname}</h3>
        <p className="text-gray-600 mb-4">Which item would you like to remove?</p>
        
        <div className="grid grid-cols-1 gap-3 mb-4 max-h-60 overflow-y-auto">
          {matchingCartItems.map((cartItem, index) => (
            <button 
              key={index}
              onClick={() => onRemoveItem(cartItem)}
              className="py-3 px-4 bg-white border border-gray-200 rounded-lg text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between mb-1">
                <span className="font-medium">{item.itemname}</span>
                <span className="text-[#FF583A]">₹{cartItem.price}</span>
              </div>
              <p className="text-xs text-gray-500">
                {getItemDescription(cartItem)}
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-700">Qty: {cartItem.qty}</span>
              </div>
            </button>
          ))}
        </div>
        
        <button 
          onClick={onClose}
          className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all active:scale-95 duration-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RemoveItemModal; 