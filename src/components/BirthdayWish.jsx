import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const BirthdayWish = ({ userName, onClose }) => {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Auto-hide after 10 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
      setTimeout(() => {
        onClose && onClose();
      }, 1000);
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 animate-fadeIn" style={{backgroundColor: 'rgba(0, 0, 0, 0.7)'}}>
      {showConfetti && <Confetti width={width} height={height} recycle={true} numberOfPieces={200} />}
      
      <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center transform transition-all animate-bounceIn">
        <div className="absolute -top-6 left-0 right-0 flex justify-center">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-2xl">🎂</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-pink-600 mt-6 animate-pulse">Happy Birthday!</h2>
        <p className="text-lg mt-4 text-gray-700">
          Wishing you a fantastic birthday, <span className="font-bold text-pink-600">{userName}</span>!
        </p>
        <p className="mt-2 text-gray-600 text-sm">May your day be filled with joy and celebration!</p>
        
        <div className="mt-6 flex justify-center space-x-2">
          <span className="text-2xl animate-bounce delay-100">🎉</span>
          <span className="text-2xl animate-bounce delay-200">🎈</span>
          <span className="text-2xl animate-bounce delay-300">🎁</span>
          <span className="text-2xl animate-bounce delay-400">🥳</span>
        </div>
        
        <button
          onClick={() => {
            setShowConfetti(false);
            setTimeout(() => onClose && onClose(), 500);
          }}
          className="mt-8 px-6 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors duration-300 font-medium text-sm"
        >
          Thank you!
        </button>
      </div>
    </div>
  );
};

export default BirthdayWish; 