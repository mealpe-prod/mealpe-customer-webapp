import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { removeFromCart, addToCart } from '../redux/slices/cartSlice';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import toast from 'react-hot-toast';
import axios from 'axios';
import Loader from './Loader';

const MealEditModal = ({ 
  isOpen, 
  onClose, 
  cartItem,
  user 
}) => {
  const dispatch = useDispatch();
  const [selectedItems, setSelectedItems] = useState({});
  const [categories, setCategories] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize selected items and categories when cartItem changes
  useEffect(() => {
    if (cartItem && cartItem.SetMeal_Items) {
      // Group items by category
      const mealCategories = cartItem.SetMeal_Items.filter(category => 
        category.Menu_Item && category.Menu_Item.length > 0
      );
      
      setCategories(mealCategories);
      
      // Initialize selected items with current selections
      const initialSelections = {};
      
      mealCategories.forEach(category => {
        // Use the current selections from cartItem
        initialSelections[category.categoryid] = category.Menu_Item;
      });
      
      setSelectedItems(initialSelections);
    }
  }, [cartItem]);

  // Fetch meal details from API
  useEffect(() => {
    const fetchMealDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("userToken");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await axios.get(
          `${import.meta.env.VITE_APP_BACKEND_BASE_URL}customer/cafeteriaDetails/${user.outletId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.success) {
          // Find the matching set meal from the response
          const matchingMeal = response.data.data.setMeals.find(
            meal => meal.setMealId === cartItem.setMealId
          );

          if (matchingMeal) {
            // Update categories with fresh data from API
            const mealCategories = matchingMeal.SetMeal_Items.filter(category => 
              category.Menu_Item && category.Menu_Item.length > 0
            );
            setCategories(mealCategories);
          }
        }
      } catch (error) {
        console.error("Error fetching meal details:", error);
        setError("Failed to fetch meal details. Please try again.");
        toast.error("Failed to fetch meal details");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && cartItem) {
      fetchMealDetails();
    }
  }, [isOpen, cartItem, user.outletId]);

  // Calculate total price based on base meal price and extra selected items
  const totalPrice = React.useMemo(() => {
    if (!cartItem) return 0;
    
    // Start with base meal price
    let total = cartItem.setMealPrice || 0;
    
    // Get all original items from cartItem
    const originalItems = cartItem.SetMeal_Items
      .flatMap(cat => cat.Menu_Item)
      .reduce((acc, item) => {
        acc[item.itemid] = item;
        return acc;
      }, {});
    
    // First, remove all extra prices from original non-default items
    Object.values(originalItems).forEach(item => {
      if (!item.isDefault && item.price) {
        total -= item.price;
      }
    });
    
    // Then add prices for current selections
    Object.values(selectedItems).forEach(categoryItems => {
      categoryItems.forEach(item => {
        if (!item.isDefault && item.price) {
          total += item.price;
        }
      });
    });
    
    return total;
  }, [cartItem, selectedItems]);

  // Check if all categories have at least one item selected
  const isFormValid = React.useMemo(() => {
    if (categories.length === 0) return false;
    
    return categories.every(category => 
      selectedItems[category.categoryid] && 
      selectedItems[category.categoryid].length > 0
    );
  }, [categories, selectedItems]);

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
        toast.error(errorMessage);
        
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

  // Validate selections before updating cart
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

  // Update cart with new selections
  const handleUpdateCart = () => {
    // Validate selections
    if (!validateSelections()) {
      // Show toast for the first error
      const firstErrorCategory = categories.find(
        category => !selectedItems[category.categoryid] || selectedItems[category.categoryid].length === 0
      );
      
      if (firstErrorCategory) {
        const errorMessage = `Please select at least one ${firstErrorCategory.categoryname}`;
        toast.error(errorMessage);
      }
      return;
    }
    
    // Create a copy of the meal with selected items and updated price
    const updatedMeal = {
      ...cartItem,
      setMealPrice: totalPrice,
      SetMeal_Items: categories.map(category => ({
        ...category,
        Menu_Item: selectedItems[category.categoryid] || []
      })),
      customizationId: cartItem.customizationId || Date.now().toString()
    };
    
    // Remove old item and add updated item
    dispatch(removeFromCart(cartItem.customizationId || cartItem.setMealId));
    dispatch(addToCart(updatedMeal));
    
    // Show success toast
    toast.success('Meal updated successfully!');
    
    // Close the modal
    onClose();
  };

  if (!isOpen || !cartItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
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
            <h2 className="text-lg md:text-lg mx-auto font-medium">Edit Meal</h2>
          </div>
          <div className="w-8"></div> {/* Spacer for alignment */}
        </div>
        
        {/* Loading State */}
        {isLoading && (
            <div className="md:h-[90vh] h-[60vh] flex justify-center">
           <div className="flex flex-col items-center justify-center">
             <Loader size="large" color="[#5046E5]"/>
             <p className='md:text-sm text-xs mt-4 opacity-50'>Finding Your Items...</p>
           </div>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#5046E5] text-white rounded-lg hover:bg-[#4038c7] transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        {/* All Categories */}
        {!isLoading && !error && (
          <div className="flex-1 overflow-y-auto pb-32 md:pb-20">
            {categories.map((category, index) => (
              <div key={category.categoryid} className="p-4 md:p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg md:text-base">Select {category.categoryname}</h3>
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
        )}
        
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
            onClick={handleUpdateCart}
            disabled={!isFormValid}
          >
            Update Cart
          </button>
        </div>
      </div>
    </div>
  );
};

MealEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  cartItem: PropTypes.object,
  user: PropTypes.object
};

export default MealEditModal; 