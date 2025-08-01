import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const Offers = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    console.log("Back button clicked");
    navigate(-1); // This will navigate to the previous page in history
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - matching Cart.jsx header style */}
      <div className="flex items-center p-4 bg-white w-full shadow-sm">
        <button 
          onClick={handleGoBack} 
          className="p-1 rounded-full cursor-pointer z-50 active:scale-95 transition-transform duration-200"
          style={{ position: 'relative', zIndex: 50 }}
        >
          <ArrowBackIosIcon className="text-xl" />
        </button>
        <h1 className="text-lg font-medium mx-auto pr-8">Offers</h1>
      </div>
      
      {/* Empty state content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-40" style={{ position: 'relative', zIndex: 10 }}>
        <div className="w-[120px] h-[120px] rounded-lg bg-white shadow-md flex items-center justify-center mb-6">
          <LocalOfferIcon 
            style={{ 
              fontSize: '48px', 
              color: '#FF583A',
              transform: 'rotate(5deg)'
            }} 
          />
        </div>
        <h2 className="text-xl font-semibold text-center text-[#1A1A1A]">Offers Coming Soon!</h2>
      </div>
    </div>
  );
};

export default Offers;
