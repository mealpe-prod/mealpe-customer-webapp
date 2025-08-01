import React from 'react';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { useNavigate } from 'react-router-dom';

const EmptyCart = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center p-3 bg-white w-full shadow-sm">
        <button
          onClick={() => navigate("/home")}
          className="p-1 rounded-lg cursor-pointer"
        >
          <ArrowBackIosIcon className="text-lg" />
        </button>
        <h1 className="text-lg font-medium mx-auto pr-8">My Cart</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-20 md:mt-0">
        {/* Empty Cart Icon */}
        <div className="w-[110px] h-[110px] rounded-lg bg-white shadow-md flex items-center justify-center mb-6">
          <RemoveShoppingCartIcon
            style={{ fontSize: "45px", color: "#FF583A" }}
          />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-sm text-gray">
            Add some meals to get started!
          </p>
        </div>
        <button
          onClick={() => navigate("/home")}
          className="mt-6 px-6 py-2.5 bg-[#FFF1EE] text-[#FF583A] text-base rounded-[12px] active:scale-95 transition-all duration-300 cursor-pointer"
        >
          Browse Meals
        </button>
      </div>
    </div>
  );
};

export default EmptyCart; 