import React from 'react';
import PropTypes from 'prop-types';

const MessageModal = ({ 
  isOpen, 
  title, 
  message,
  icon: Icon,
  iconColor = "#0066FF",
  iconBgColor = "#E5EFFF",
  gifUrl,
  onClose,
  autoClose = true,
  autoCloseDelay = 2000
}) => {
  // Auto close modal after delay if autoClose is true
  React.useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="bg-white rounded-2xl p-6 max-w-sm w-[90%] relative flex flex-col items-center text-center animate-fade-up">
        {/* Icon/GIF Container */}
        <div 
          className="w-24 h-24 rounded-lg flex items-center justify-center mb-6"
          style={{ backgroundColor: gifUrl ? 'transparent' : iconBgColor }}
        >
          {gifUrl ? (
            <img 
              src={gifUrl} 
              alt="Status"
              className="w-24 h-24 object-cover rounded-lg"
            />
          ) : Icon && (
            <Icon 
              style={{ 
                width: '48px', 
                height: '48px',
                color: iconColor
              }} 
            />
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {title}
        </h2>

        {/* Message */}
        <p className="text-gray-600 text-lg">
          {message}
        </p>
      </div>
    </div>
  );
};

MessageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  iconColor: PropTypes.string,
  iconBgColor: PropTypes.string,
  gifUrl: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  autoClose: PropTypes.bool,
  autoCloseDelay: PropTypes.number
};

export default MessageModal;
