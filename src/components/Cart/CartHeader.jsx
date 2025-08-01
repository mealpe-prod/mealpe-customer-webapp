import React from 'react';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useNavigate } from 'react-router-dom';

const CartHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center p-4 bg-white shadow-sm">
      <button
        onClick={() => navigate(-1)}
        className="p-1 rounded-[12px] hover:cursor-pointer active:scale-95 transition-all duration-300"
      >
        <ArrowBackIosIcon className="text-xl" />
      </button>
      <h1 className="text-lg font-medium mx-auto pr-8">My Cart</h1>
    </div>
  );
};

export default CartHeader; 