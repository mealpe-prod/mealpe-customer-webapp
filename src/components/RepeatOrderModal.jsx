import React from 'react';
import PropTypes from 'prop-types';

const RepeatOrderModal = ({ isOpen, onClose, onRepeat, onCustomize }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black opacity-60 z-40 transition-opacity duration-300 sidebar-overlay" 
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-t-xl overflow-hidden shadow-xl mb-0 z-50">
        <div className="p-4 text-center">
          <h3 className="text-lg font-medium text-gray-800 mb-6 text-left">Repeat Order?</h3>
          
          <div className="flex justify-between gap-4 py-2">
            <button 
              onClick={onCustomize}
              className="flex-1 py-2.5 px-5 border border-[#5046E5] text-[#5046E5] font-medium rounded-lg hover:bg-[#EEEDFD] transition-colors duration-200 cursor-pointer"
            >
              Customize
            </button>
            
            <button 
              onClick={onRepeat}
              className="flex-1 py-2.5 px-5 bg-[#5046E5] text-white font-medium rounded-lg hover:bg-[#4038C7] transition-colors duration-200 cursor-pointer"
            >
              Repeat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

RepeatOrderModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onRepeat: PropTypes.func.isRequired,
  onCustomize: PropTypes.func.isRequired
};

export default RepeatOrderModal; 