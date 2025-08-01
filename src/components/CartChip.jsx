import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import dummyRestaurant from '../assets/1.png';

const CartChip = ({liveOrders}) => {
  const navigate = useNavigate();
  const cartItemsCount = useSelector((state) => state.cart.items);

  if (!cartItemsCount || cartItemsCount.length === 0) {
    return null;
  }


  return (
    <div 
      onClick={() => navigate('/cart')}
      className={`fixed left-1/2 transform -translate-x-1/2 ${liveOrders?.length > 0 ? 'md:bottom-24 bottom-40' : 'md:bottom-6 bottom-28'} bg-[#FF583A] text-white rounded-full px-4 md:px-4 py-2 md:py-1 flex items-center shadow-lg cursor-pointer hover:bg-[#ff4122] active:scale-95 transition-all duration-200 z-20 ${cartItemsCount?.length <= 2 ? 'w-[50%]' : cartItemsCount?.length <= 4 ? 'w-[70%]' : 'w-[80%]'} md:w-auto`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="mr-2 md:mr-3 flex -space-x-2">
          {cartItemsCount?.slice(0, 2)?.map((item, index) => (
            <img 
              key={index}
              src={item?.item_image_url || dummyRestaurant} 
              alt="Food" 
              className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-white"
              style={{ zIndex: 3 - index }}
            />
          ))}
          {cartItemsCount?.length > 2 && (
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-700" style={{ zIndex: 0 }}>
              +{cartItemsCount?.length - 2}
            </div>
          )}
        </div>
        <div className="flex flex-col items-center">
          <div className="font-medium text-sm md:text-base mr-2 md:mr-4">View Cart</div>
          {/* <div className="rounded-full py-0.5 md:py-1 text-xs md:text-xs font-bold mr-1 md:mr-2">
            {cartItemsCount?.length} {cartItemsCount?.length === 1 ? 'ITEM' : 'ITEMS'}
          </div> */}
        </div>
        <ChevronRightIcon className="text-white w-5 h-5 md:w-6 md:h-6" />
      </div>
    </div>
  );
};

export default CartChip; 