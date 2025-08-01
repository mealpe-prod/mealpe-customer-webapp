import React from 'react';
import PropTypes from 'prop-types';

const CategoryButton = ({ category, isSelected, onClick }) => {
  const isShowAll = category.name === "Show All";
  
  return (
    <button 
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${isSelected ? "bg-[#FFF1EE] text-[#FF583A] border border-[#FF583A] border-opacity-50" : "bg-white text-black border border-gray-200"}`}
      onClick={onClick}
    >
      <img 
        src={category.imageUrl} 
        alt={category.name} 
        className="w-6 h-6 rounded-lg object-cover flex-shrink-0"
      />
      <span className="font-medium text-sm">{category.name}</span>
    </button>
  );
};

CategoryButton.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};

export default CategoryButton; 