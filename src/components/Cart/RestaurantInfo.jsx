import React from 'react';

const RestaurantInfo = ({ outletDetails, isOutletOpen }) => {
  return (
    <div className="bg-white p-4 flex items-center justify-between gap-3 mb-3 rounded-[12px] mt-2">
      <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
        {outletDetails?.outdetails?.logo ? (
          <img 
            src={outletDetails.outdetails.logo} 
            alt={outletDetails.outdetails.outletName} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm font-bold">MP</span>
        )}
        </div>
        <div>
        <h2 className="text-base font-medium">{outletDetails?.outdetails?.outletName || 'MealPe'}</h2>
        <p className="text-sm text-gray-500">{outletDetails?.outdetails?.address || 'Pune'}</p>
       
      </div>
      </div>
   
      <div className='flex items-center gap-2'> {isOutletOpen ? (
          <span className="text-sm text-green-500">Open now</span>
        ) : (
          <span className="text-sm text-[#FF583A]">Closed now</span>
        )}</div>
    </div>
  );
};

export default RestaurantInfo; 