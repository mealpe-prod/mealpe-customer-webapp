import React from 'react';

const AddItemModal = ({ 
  show, 
  onClose, 
  item, 
  onRepeatItem, 
  onChooseCustomization 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
      <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-2">{item.itemname}</h3>
        <p className="text-gray-600 mb-4">How would you like to add this item?</p>
        
        <div className="grid grid-cols-1 gap-4 mb-4">
          <button 
            onClick={onRepeatItem}
            className="py-3 px-4 bg-[#FF583A] text-white rounded-lg font-medium hover:bg-[#e54d33] transition-all duration-300 active:scale-95 cursor-pointer"
          >
            Repeat
            <p className="text-xs font-normal text-white/80 mt-1">
              Add with same customization
            </p>
          </button>
          
          <button 
            onClick={onChooseCustomization}
            className="py-3 px-4 bg-white border border-[#FF583A] text-[#FF583A] rounded-lg font-medium hover:bg-[#fff8f7] transition-all duration-300 active:scale-95 cursor-pointer"
          >
            I'll Choose
            <p className="text-xs font-normal text-[#FF583A]/80 mt-1">
              Select different variations & add-ons
            </p>
          </button>
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

export default AddItemModal; 