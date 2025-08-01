import React from 'react';

const SkeletonLoader = ({ type = 'city' }) => {
  return (
    <div className="animate-pulse">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="p-4 mb-2 rounded-lg bg-gray-100">
          <div className="flex items-center justify-between">
            <div className="w-full">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              {type === 'campus' && (
                <div className="mt-2">
                  <div className="h-4 bg-gray-200 rounded-full w-1/5 inline-block"></div>
                </div>
              )}
            </div>
            {type === 'city' && (
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export const MealItemSkeleton = () => {
  return (
    <div className="border-b py-2 border-gray-100 rounded-lg animate-pulse">
      <div className="flex justify-between">
        <div className="w-full">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4 mb-3"></div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="h-10 w-16 bg-gray-200 rounded-[12px]"></div>
          <div className="h-10 w-16 bg-gray-200 rounded-[12px]"></div>
        </div>
      </div>
    </div>
  );
};

export const MessDaySkeleton = () => {
  return (
    <div className="mb-6 bg-white rounded-lg p-2">
      <div className="flex justify-between items-center mb-3">
        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/5"></div>
        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
      </div>
      {[1, 2, 3].map((item) => (
        <MealItemSkeleton key={item} />
      ))}
    </div>
  );
};

export const MessProfileSkeleton = () => {
  return (
    <div className="flex flex-col p-1 bg-white rounded-lg animate-pulse">
      <div className="flex items-center self-start">
        <div className="w-10 h-10 bg-gray-200 rounded-full mr-4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      </div>
      <div className="flex justify-center w-full mt-4 md:mt-0">
        <div className="h-12 bg-gray-200 rounded-[12px] w-40"></div>
      </div>
    </div>
  );
};

// Original SkeletonLoader is already exported as default above
export { SkeletonLoader }; 