import React from 'react';

const OutletDetailsSkeleton = () => {
  return (
    <div className="w-full mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="relative h-48 overflow-hidden mb-4 bg-gray-200">
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-[12px] bg-gray-300 mr-3"></div>
            <div>
              <div className="h-6 w-40 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 w-24 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="mb-6 px-3">
        <div className="h-10 bg-gray-200 rounded-[12px]"></div>
      </div>

      {/* Category Filter Skeleton */}
      <div className="w-full flex items-center justify-start overflow-x-auto px-3 mb-8 hide-scrollbar">
        <div className="flex gap-2 hide-scrollbar">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-9 w-24 bg-gray-200 rounded-[12px] flex-shrink-0"
            ></div>
          ))}
        </div>
      </div>

      {/* Menu Items Skeleton */}
      <div className="px-3">
        {/* Recommended Section Skeleton */}
        <div className="mb-4 border border-gray-200 rounded-[12px] overflow-hidden">
          <div className="p-3 bg-white border-b border-gray-200">
            <div className="h-6 w-40 bg-gray-200 rounded"></div>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-[12px] border border-gray-200 p-2"
                >
                  <div className="w-full h-32 bg-gray-200 rounded-[12px] mb-2"></div>
                  <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="h-5 w-16 bg-gray-200 rounded"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Regular Categories Skeleton */}
        {[1, 2].map((section) => (
          <div
            key={section}
            className="mb-3 border border-gray-200 rounded-[12px] overflow-hidden"
          >
            <div className="p-3 bg-white border-b border-gray-200">
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="bg-white rounded-[12px] border border-gray-200 p-2"
                  >
                    <div className="w-full h-32 bg-gray-200 rounded-[12px] mb-2"></div>
                    <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="h-5 w-16 bg-gray-200 rounded"></div>
                      <div className="h-8 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutletDetailsSkeleton; 