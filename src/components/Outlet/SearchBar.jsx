import React from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ searchQuery, setSearchQuery, openFilterDrawer }) => {
  return (
    <div className="mb-2 px-2 mt-8">
      <div className="relative">
        <input
          type="text"
          placeholder="Search dishes, cuisines, or categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3.5 pl-12 pr-12 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF583A] focus:ring-2 focus:ring-[#FF583A]/10 transition-all duration-300 shadow-sm"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF583A]">
          <SearchIcon fontSize="small" />
        </div>
        
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors duration-200"
            aria-label="Clear search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
        
        <button 
          onClick={openFilterDrawer}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#FF583A] p-1.5 rounded-full hover:bg-[#FFF1EE] transition-all duration-200 cursor-pointer"
          aria-label="Open filters"
        >
          <FilterListIcon fontSize="small" />
        </button>
      </div>
      
      {/* Search suggestions could be added here */}
    </div>
  );
};

export default SearchBar; 