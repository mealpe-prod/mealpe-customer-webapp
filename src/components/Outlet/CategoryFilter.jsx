import React from 'react';
import dummyImage from '../../assets/mealpe.png';

const CategoryFilter = ({ categories, activeCategory, setActiveCategory, hasMess }) => {
  return (
    <div className="px-2 mb-3 mt-5">
      {!hasMess && (
        <h2 className="text-md font-bold ml-2 text-gray-800">Categories</h2>
      )}
      <div className="w-full flex items-center justify-start overflow-x-auto bg-white rounded-xl py-2 px-2 hide-scrollbar">
        {!hasMess && (
          <button
            onClick={() => setActiveCategory("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-[12px] cursor-pointer flex-shrink-0 whitespace-nowrap mr-2 transition-all duration-300 active:scale-95 ${
              activeCategory === "all" 
                ? "text-white bg-[#FF583A] transform scale-105" 
                : "bg-white border border-gray-200 hover:border-[#FF583A]/50 hover:bg-[#FFF1EE]"
            }`}
          >
            <span className="text-sm font-medium">All</span>  
          </button> 
        )}
        
        {categories?.filter((category) => category.status === true)?.map((category) => (
          <button
            key={category.categoryid}
            onClick={() => setActiveCategory(category.categoryid)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[12px] cursor-pointer flex-shrink-0 whitespace-nowrap mr-2 transition-all duration-300 active:scale-95 ${
              activeCategory === category.categoryid
                ? "text-white bg-[#FF583A] transform scale-105"
                : "bg-white border border-gray-200 hover:border-[#FF583A]/50 hover:bg-[#FFF1EE]"
            }`}
          >
            {!!category.category_image_url && (
              <img
                className="w-6 h-6 rounded-full object-cover flex-shrink-0 border border-gray-100"
                src={category.category_image_url || dummyImage}
                alt={category.categoryname}
                loading="lazy"
              />
            )}
            <span className="text-sm font-medium">{category.categoryname}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter; 