import React from 'react';

/**
 * Container component that provides responsive layout
 * Adapts to both mobile and desktop screen sizes
 */
const MobileContainer = ({ children }) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md h-screen max-h-[900px] overflow-y-auto bg-white shadow-md relative md:rounded-2xl md:h-[85vh] lg:max-w-4xl xl:max-w-6xl desktop:flex desktop:flex-row desktop:max-w-7xl">
        {children}
      </div>
    </div>
  );
};

export default MobileContainer; 