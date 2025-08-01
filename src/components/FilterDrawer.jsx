import { useState, useEffect, useRef } from "react";
import CategoryButton from "./CategoryButton";
import DummyImage from "../assets/mealpe.png";

const FilterDrawer = ({ 
  isOpen, 
  onClose, 
  categories, 
  selectedCategory, 
  onSelectCategory,
  minPrice = 0,
  maxPrice = 2000,
  onApplyFilters
}) => {
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);
  const drawerRef = useRef(null);
  const sliderRef = useRef(null);
  const [activeThumb, setActiveThumb] = useState(null); // Track which thumb is being dragged (0 for min, 1 for max)

  // Reset price range when props change or drawer opens
  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice, isOpen]);

  // Handle click outside to close drawer
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle price range calculations
  const calculateValueFromPosition = (clientX) => {
    if (!sliderRef.current) return 0;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = position / rect.width;
    const value = Math.round(minPrice + percentage * (maxPrice - minPrice));
    
    return value;
  };

  // Handle mouse down on thumbs
  const handleThumbMouseDown = (e, index) => {
    e.stopPropagation();
    setActiveThumb(index);
  };

  // Handle touch start on thumbs
  const handleThumbTouchStart = (e, index) => {
    e.stopPropagation();
    setActiveThumb(index);
  };

  // Handle slider track click
  const handleTrackClick = (e) => {
    const value = calculateValueFromPosition(e.clientX);
    const [min, max] = priceRange;
    const minGap = Math.max(1, Math.floor((maxPrice - minPrice) * 0.01)); // At least 1 unit or 1% of range
    
    // Determine which thumb to move based on where user clicked
    if (Math.abs(value - min) <= Math.abs(value - max)) {
      // Moving the min thumb
      setPriceRange([Math.min(Math.max(minPrice, value), max - minGap), max]);
    } else {
      // Moving the max thumb
      setPriceRange([min, Math.min(Math.max(min + minGap, value), maxPrice)]);
    }
  };

  // Handle slider track touch
  const handleTrackTouch = (e) => {
    const touch = e.touches[0];
    const value = calculateValueFromPosition(touch.clientX);
    const [min, max] = priceRange;
    const minGap = Math.max(1, Math.floor((maxPrice - minPrice) * 0.01)); // At least 1 unit or 1% of range
    
    // Determine which thumb to move based on where user touched
    if (Math.abs(value - min) <= Math.abs(value - max)) {
      // Moving the min thumb
      setPriceRange([Math.min(Math.max(minPrice, value), max - minGap), max]);
    } else {
      // Moving the max thumb
      setPriceRange([min, Math.min(Math.max(min + minGap, value), maxPrice)]);
    }
  };

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (activeThumb === null) return;
      
      const value = calculateValueFromPosition(e.clientX);
      const newRange = [...priceRange];
      
      if (activeThumb === 0) {
        // Min thumb - value can't exceed max minus a minimum gap (5% of range)
        const minGap = Math.max(1, Math.floor((maxPrice - minPrice) * 0.01)); // At least 1 unit or 1% of range
        newRange[0] = Math.min(Math.max(minPrice, value), priceRange[1] - minGap);
      } else {
        // Max thumb - value can't be less than min plus minimum gap
        const minGap = Math.max(1, Math.floor((maxPrice - minPrice) * 0.01)); // At least 1 unit or 1% of range
        newRange[1] = Math.min(Math.max(priceRange[0] + minGap, value), maxPrice);
      }
      
      setPriceRange(newRange);
    };
    
    const handleTouchMove = (e) => {
      if (activeThumb === null) return;
      
      const touch = e.touches[0];
      const value = calculateValueFromPosition(touch.clientX);
      const newRange = [...priceRange];
      
      if (activeThumb === 0) {
        // Min thumb - value can't exceed max minus a minimum gap
        const minGap = Math.max(1, Math.floor((maxPrice - minPrice) * 0.01)); // At least 1 unit or 1% of range
        newRange[0] = Math.min(Math.max(minPrice, value), priceRange[1] - minGap);
      } else {
        // Max thumb - value can't be less than min plus minimum gap
        const minGap = Math.max(1, Math.floor((maxPrice - minPrice) * 0.01)); // At least 1 unit or 1% of range
        newRange[1] = Math.min(Math.max(priceRange[0] + minGap, value), maxPrice);
      }
      
      setPriceRange(newRange);
      e.preventDefault(); // Prevent page scrolling while dragging
    };
    
    const handleMouseUp = () => {
      setActiveThumb(null);
    };
    
    const handleTouchEnd = () => {
      setActiveThumb(null);
    };
    
    if (activeThumb !== null) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);
      document.addEventListener("touchcancel", handleTouchEnd);
    }
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [activeThumb, priceRange]);

  // Handle apply filters
  const handleApply = () => {
    onApplyFilters({
      category: selectedCategory,
      priceRange: priceRange
    });
    onClose();
  };

  // Handle reset filters
  const handleReset = () => {
    onSelectCategory("all");
    setPriceRange([minPrice, maxPrice]);
  };

  // Calculate percentage positions for UI elements
  const getLeftThumbPosition = () => {
    return ((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100;
  };
  
  const getRightThumbPosition = () => {
    return ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100;
  };
  
  const getRangeWidth = () => {
    return getRightThumbPosition() - getLeftThumbPosition();
  };

  // Calculate label positioning to prevent screen overflow
  const getLeftLabelPosition = () => {
    const pos = getLeftThumbPosition();
    // Adjust if too close to left edge
    return pos < 10 ? 'left-0 -translate-x-0' : 'left-1/2 -translate-x-1/2';
  };

  const getRightLabelPosition = () => {
    const pos = getRightThumbPosition();
    // Adjust if too close to right edge
    return pos > 90 ? 'right-0 translate-x-0 left-auto' : 'left-1/2 -translate-x-1/2';
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 sidebar-overlay ${
            isOpen ? "opacity-60" : "opacity-0 pointer-events-none"
          }`}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        ref={drawerRef}
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Select Filters</h2>
          <div className="flex items-center space-x-4">
            <button 
              className="text-[#FF583A] font-medium cursor-pointer"
              onClick={handleReset}
            >
              Reset
            </button>
            <button onClick={onClose} className="cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              <div className="mb-2">
                <CategoryButton 
                  category={{ 
                    id: "all", 
                    name: "Show All", 
                    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80" 
                  }}
                  isSelected={selectedCategory === "all"}
                  onClick={() => onSelectCategory("all")}
                />
              </div>
              
              {categories.map(category => (
                <div key={category.categoryid} className="mb-2">
                  <CategoryButton 
                    category={{ 
                      id: category.categoryid, 
                      name: category.categoryname, 
                      imageUrl: category.category_image_url || DummyImage 
                    }}
                    isSelected={selectedCategory === category.categoryid}
                    onClick={() => onSelectCategory(category.categoryid)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Price Range</h3>
            <div className="flex justify-between mb-2">
              <span className="text-[#FF583A] font-medium">₹0</span>
              <span className="text-[#FF583A] font-medium">₹2000</span>
            </div>
            
            {/* Custom dual range slider */}
            <div 
              ref={sliderRef}
              className="relative h-2 bg-gray-200 rounded-lg mt-4 mb-8 cursor-pointer touch-none"
              onClick={handleTrackClick}
              onTouchStart={handleTrackTouch}
            >
              {/* Colored range track */}
              <div 
                className="absolute h-full bg-[#FF583A] rounded-lg" 
                style={{
                  left: `${getLeftThumbPosition()}%`,
                  width: `${getRangeWidth()}%`
                }}
              />
              
              {/* Min thumb */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-[#FF583A] rounded-full shadow cursor-grab active:cursor-grabbing"
                style={{ left: `calc(${getLeftThumbPosition()}% - 8px)` }}
                onMouseDown={(e) => handleThumbMouseDown(e, 0)}
                onTouchStart={(e) => handleThumbTouchStart(e, 0)}
              >
                <div className={`absolute top-6 ${getLeftLabelPosition()} bg-[#FF583A] text-white text-xs px-2 py-1 rounded whitespace-nowrap`}>
                  ₹{priceRange[0]}
                </div>
              </div>
              
              {/* Max thumb */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-[#FF583A] rounded-full shadow cursor-grab active:cursor-grabbing"
                style={{ left: `calc(${getRightThumbPosition()}% - 9px)` }}
                onMouseDown={(e) => handleThumbMouseDown(e, 1)}
                onTouchStart={(e) => handleThumbTouchStart(e, 1)}
              >
                <div className={`absolute top-6 ${getRightLabelPosition()} bg-[#FF583A] text-white text-xs px-2 py-1 rounded whitespace-nowrap`}>
                  ₹{priceRange[1]}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="p-4">
          <button
            className="w-full py-3 px-4 bg-[#FF583A] text-white font-medium rounded-lg hover:bg-[#FF583A] transition-colors cursor-pointer"
            onClick={handleApply}
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterDrawer; 