import React from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const DeliveryAddressInput = ({ deliveryAddress, setDeliveryAddress }) => {
  return (
    <div className="bg-white p-4 mb-3 rounded-[12px]">
      <p className="text-sm mb-2">Delivery Address <span className="text-red-500">*</span></p>
      <div className={`border ${!deliveryAddress?.trim() ? 'border-red-300' : 'border-gray-200'} rounded-[12px] p-3 flex items-center`}>
        <LocationOnIcon className="text-[#FF583A] mr-2" fontSize="small" />
        <input 
          type="text" 
          placeholder="Enter your delivery address" 
          className="w-full outline-none text-sm"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          required
        />
      </div>
      <p className={`text-sm ${!deliveryAddress?.trim() ? 'text-red-500' : 'text-gray-500'} mt-1 ml-1`}>
        {!deliveryAddress?.trim() 
          ? "Address is required for delivery orders" 
          : "Please provide a complete address for delivery"}
      </p>
    </div>
  );
};

export default DeliveryAddressInput; 