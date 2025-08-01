import React, { useState, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import toast from 'react-hot-toast';

const MealCustomizationModal = ({ 
  isOpen, 
  onClose, 
  meal 
}) => {
  const dispatch = useDispatch();
  const [selectedItems, setSelectedItems] = useState({});
  const [categories, setCategories] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  // Add a ref to track if a toast is currently showing
  const toastShowing = useRef(false);
  // Add a ref to track the last error message shown
  const lastErrorMessage = useRef('');
  // Add a ref to track when the last toast was shown
  const lastToastTime = useRef(0);

  // Initialize selected items and categories when meal changes
  useEffect(() => {
    if (meal && meal.SetMeal_Items) {
      // console.log("Meal data for customization:", meal);
      
      // Group items by category
      const mealCategories = meal.SetMeal_Items.filter(category => 
        category.Menu_Item && category.Menu_Item.length > 0
      );
      
      setCategories(mealCategories);
      
      // Initialize selected items with default selections
      const initialSelections = {};
      
      mealCategories.forEach(category => {
        // Find default items for this category
        const defaultItems = category.Menu_Item.filter(item => item.isDefault === true);
        
        // If there are default items, select them
        if (defaultItems.length > 0) {
          initialSelections[category.categoryid] = defaultItems.map(item => ({
            itemid: item.itemid,
            itemname: item.itemname,
            price: item.price || 0,
            quantity: item.quantity || 1,
            item_image_url: item.item_image_url,
            isDefault: true
          }));
        } else {
          // If no default items, initialize with empty array (don't select any)
          initialSelections[category.categoryid] = [];
        }
      });
      
      // console.log("Initial selections:", initialSelections);
      setSelectedItems(initialSelections);
    }
  }, [meal]);

  // Calculate total price based on base meal price and extra selected items
  const totalPrice = useMemo(() => {
    if (!meal) return 0;
    
    // Start with base meal price
    let total = meal.setMealPrice || 0;
    
    // Add price of extra (non-default) selected items
    Object.values(selectedItems).forEach(categoryItems => {
      categoryItems.forEach(item => {
        if (!item.isDefault && item.price) {
          total += item.price;
        }
      });
    });
    
    return total;
  }, [meal, selectedItems]);

  // Check if all categories have at least one item selected
  const isFormValid = useMemo(() => {
    if (categories.length === 0) return false;
    
    return categories.every(category => 
      selectedItems[category.categoryid] && 
      selectedItems[category.categoryid].length > 0
    );
  }, [categories, selectedItems]);

  // Helper function to show toast error with debounce
  const showToastError = (message) => {
    const now = Date.now();
    // Only show toast if it's been at least 2 seconds since the last one
    // and if the message is different from the last one shown
    if (now - lastToastTime.current > 2000 || message !== lastErrorMessage.current) {
      lastToastTime.current = now;
      lastErrorMessage.current = message;
      toast.error(message, {
        id: 'validation-error' // Use an ID to prevent duplicate toasts
      });
    }
  };

  // Handle item selection
  const handleItemSelect = (item, categoryId) => {
    setSelectedItems(prev => {
      const existingItemIndex = prev[categoryId]?.findIndex(i => i.itemid === item.itemid);
      
      // Create a new array with only the selected item
      const newCategoryItems = [{
        itemid: item.itemid,
        itemname: item.itemname,
        price: item.price || 0,
        quantity: item.quantity || 1,
        item_image_url: item.item_image_url,
        isDefault: item.isDefault || false
      }];
      
      // If the item is already selected and it's the only item, don't allow deselection
      if (existingItemIndex >= 0 && prev[categoryId].length === 1) {
        // Show toast notification that at least one item must be selected
        const errorMessage = `At least one ${categories.find(c => c.categoryid === categoryId)?.categoryname} must be selected`;
        showToastError(errorMessage);
        
        // Return the previous state unchanged
        return prev;
      }
      
      // Clear validation error if any
      setValidationErrors(prev => ({
        ...prev,
        [categoryId]: null
      }));
      
      return {
        ...prev,
        [categoryId]: newCategoryItems
      };
    });
  };

  // Check if an item is selected
  const isItemSelected = (itemId, categoryId) => {
    return selectedItems[categoryId]?.some(item => item.itemid === itemId) || false;
  };

  // Validate selections before adding to cart
  const validateSelections = () => {
    const errors = {};
    let isValid = true;
    
    categories.forEach(category => {
      if (!selectedItems[category.categoryid] || selectedItems[category.categoryid].length === 0) {
        errors[category.categoryid] = `Please select at least one ${category.categoryname}`;
        isValid = false;
      }
    });
    
    setValidationErrors(errors);
    return isValid;
  };

  // Add customized meal to cart
  const handleAddToCart = () => {
    try {
      // Validate selections
      if (!validateSelections()) {
        // Show toast for the first error
        const firstErrorCategory = categories.find(
          category => !selectedItems[category.categoryid] || selectedItems[category.categoryid].length === 0
        );
        
        if (firstErrorCategory) {
          const errorMessage = `Please select at least one ${firstErrorCategory.categoryname}`;
          showToastError(errorMessage);
        }
        return;
      }
      
      // Create a copy of the meal with selected items and updated price
      const customizedMeal = {
        ...meal,
        setMealPrice: totalPrice, // Use calculated total price
        SetMeal_Items: categories.map(category => ({
          ...category,
          Menu_Item: selectedItems[category.categoryid] || []
        })),
        // Preserve customizationId if it exists (for items being re-customized)
        // or create a new one if this is a new customization of an existing item
        customizationId: meal.customizationId || Date.now().toString()
      };
      
      // Dispatch action to add to cart
      dispatch(addToCart(customizedMeal));
      
      // Show success toast
      toast.success(`${meal.setMealName} added to cart!`, {
        id: 'success-toast' // Use an ID to prevent duplicate toasts
      });
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  if (!isOpen || !meal) return null;

  return (
    <div className="fixed inset-0 z-1001 flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 backdrop-blur-sm bg-opacity-40" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative bg-white w-full h-full md:h-auto md:max-h-[90vh] md:w-[600px] lg:w-[900px] xl:w-[1100px] md:rounded-2xl overflow-hidden flex flex-col shadow-2xl transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="bg-white p-3 md:p-4 flex items-center border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <button 
            className="p-1.5 rounded-lg hover:bg-gray-100 mr-3 transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Close modal"
          >
            <ArrowBackIosIcon fontSize="small" />
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-lg md:text-lg mx-auto font-medium">Customize Order</h2>
            {/* <p className="text-sm text-gray-500 mt-0.5">Remember Order</p> */}
          </div>
          <div className="w-8"></div> {/* Spacer for alignment */}
        </div>
        
        {/* Meal Info */}
        <div className="bg-gray-50 p-4 md:p-4 flex items-center space-x-4 sticky top-[72px] z-10 shadow-sm">
          <div className="w-16 h-16 md:w-16 md:h-16 rounded-lg overflow-hidden shadow-md">
            <img 
              src={meal.setMealImage} 
              alt={meal.setMealName} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg md:text-base">{meal.setMealName}</h3>
            <div className="flex items-center mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star} 
                    className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-500 text-sm ml-2">Customizable</span>
            </div>
          </div>
        </div>
        
        {/* All Categories */}
        <div className="flex-1 overflow-y-auto pb-32 md:pb-20">
          {categories.map((category, index) => (
            <div key={category.categoryid} className="p-4 md:p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg md:text-base">Select {category.categoryname}</h3>
                {/* <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                  {index + 1} of {categories.length}
                </div> */}
              </div>
              
              {/* Category description */}
              <p className="text-sm text-gray-500 mb-2">
                {category.quantity > 0 && `${category.quantity} x ${category.categoryname}`}
              </p>
              
              {/* Validation error message */}
              {validationErrors[category.categoryid] && (
                <p className="text-red-500 text-sm mb-2 font-medium">
                  {validationErrors[category.categoryid]}
                </p>
              )}
              
              {/* Selection status */}
              {(!selectedItems[category.categoryid] || selectedItems[category.categoryid].length === 0) && (
                <p className="text-amber-500 text-sm mb-2 font-medium">
                  Please select at least one item
                </p>
              )}
              
              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {category.Menu_Item.map(item => (
                  <div 
                    key={item.itemid}
                    className={`border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isItemSelected(item.itemid, category.categoryid) 
                        ? 'border-[#5046E5] bg-[#EEEDFD] shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleItemSelect(item, category.categoryid)}
                  >
                    <div className="p-2 md:p-2 flex items-center">
                      <div className="w-12 h-12 md:w-12 md:h-12 rounded-lg overflow-hidden mr-2 shadow-sm">
                        <img 
                          src={item.item_image_url || 'https://via.placeholder.com/80'} 
                          alt={item.itemname} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.quantity} x {item.itemname}</p>
                        {!item.isDefault && item.price > 0 && (
                          <p className="text-xs text-gray-500 mt-0.5">+₹{item.price}</p>
                        )}
                        {item.isDefault && (
                          <span className="text-xs text-[#5046E5] bg-[#EEEDFD] px-1.5 py-0.5 rounded-lg mt-0.5 inline-block">Default</span>
                        )}
                      </div>
                      {isItemSelected(item.itemid, category.categoryid) && (
                        <div className="w-5 h-5 bg-[#5046E5] rounded-lg flex items-center justify-center shadow-md ml-1 flex-shrink-0">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="bg-white p-4 md:p-4 border-t border-gray-200 fixed bottom-0 left-0 right-0 md:static shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-medium text-base md:text-sm">Total Amount</span>
            <span className="text-[#5046E5] font-bold text-xl md:text-lg">₹{totalPrice}</span>
          </div>
          <button 
            className={`w-full cursor-pointer py-3 md:py-2.5 font-medium text-base md:text-sm rounded-lg transition-all duration-300 shadow-md hover:shadow-lg ${
              isFormValid 
                ? 'bg-[#5046E5] text-white hover:bg-[#4038C7] transform hover:-translate-y-0.5' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleAddToCart}
            disabled={!isFormValid}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

MealCustomizationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  meal: PropTypes.object
};

export default MealCustomizationModal; 