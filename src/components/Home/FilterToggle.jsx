import React from "react";

const FilterToggle = ({ hasMess, restaurantsCount, filter, setFilter }) => {
  if (!hasMess || restaurantsCount <= 1) return null;
  
  return (
    <div className="w-full flex justify-end mb-2 -mt-4">
      <div className="w-fit flex items-center bg-gray-100 rounded-full p-1 text-[12px] font-medium">
        <button
          onClick={() => setFilter("mess")}
          className={`px-2 py-1 rounded-full transition-all duration-300 cursor-pointer active:scale-95 ${
            filter === "mess"
              ? "bg-[#FF583A] text-white shadow-sm"
              : "text-gray-500"
          }`}
        >
          Mess
        </button>
        <button
          onClick={() => setFilter("outlet")}
          className={`px-2 py-1 rounded-full transition-all duration-300 cursor-pointer active:scale-95 ${
            filter === "outlet"
              ? "bg-[#FF583A] text-white shadow-sm"
              : "text-gray-500"
          }`}
        >
          Outlet
        </button>
      </div>
    </div>
  );
};

export default FilterToggle; 