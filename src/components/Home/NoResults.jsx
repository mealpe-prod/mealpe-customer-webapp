import React from "react";

const NoResults = ({ searchQuery }) => {
  return (
    <div className="flex flex-col items-center justify-center py-25">
      <div className="w-[100px] h-[100px] rounded-[12px] bg-white shadow-md flex items-center justify-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-[#FF583A]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h2 className="text-lg font-semibold mb-2">No Results Found</h2>
      <p className="text-xs text-gray-500 text-center max-w-sm">
        {searchQuery
          ? "Try adjusting your search or filters to find what you're looking for."
          : "We couldn't find any outlets in your area. Please try changing your location or check back later."}
      </p>
    </div>
  );
};

export default NoResults; 