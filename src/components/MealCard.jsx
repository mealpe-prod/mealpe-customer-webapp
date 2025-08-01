import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { increaseQuantity, decreaseQuantity } from '../redux/slices/cartSlice';
import DummyImage from '../assets/mealpe.png';
import RepeatOrderModal from './RepeatOrderModal';

const MealCard = ({ meal, onAddToCart, onToggleFavorite, isFavorite, isLoading }) => {
  const [showAllItems, setShowAllItems] = useState(false);
  const [isRepeatModalOpen, setIsRepeatModalOpen] = useState(false);
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);
  
  // Check if this meal is in the cart
  const cartItem = cartItems.find(item => item.setMealId === meal.setMealId);
  const isInCart = !!cartItem;
  const quantity = cartItem ? cartItem.quantity : 0;
  
  // Get all menu items from all categories
  const allMenuItems = meal.SetMeal_Items.flatMap(category => 
    category.Menu_Item.map(item => ({
      ...item,
      categoryname: category.categoryname
    }))
  );
  
  // Determine if we need to show the "Show more" button
  const hasMoreItems = allMenuItems.length > 4;
  
  // Get items to display based on current state
  const displayedItems = showAllItems ? allMenuItems : allMenuItems.slice(0, 4);
  
  // Calculate how many items are hidden
  const hiddenItemsCount = allMenuItems.length - 4;

  // Handle quantity increase
  const handleIncreaseQuantity = (e) => {
    e.stopPropagation();
    // If already in cart, show repeat modal instead of directly incrementing
    if (isInCart) {
      setIsRepeatModalOpen(true);
    } else {
      onAddToCart(meal);
    }
  };

  // Handle quantity decrease
  const handleDecreaseQuantity = (e) => {
    e.stopPropagation();
    // Use customizationId if it exists, otherwise use setMealId
    const itemId = cartItem.customizationId || meal.setMealId;
    dispatch(decreaseQuantity(itemId));
  };

  // Handle repeat order (just increase quantity)
  const handleRepeatOrder = () => {
    // Use customizationId if it exists, otherwise use setMealId
    const itemId = cartItem.customizationId || meal.setMealId;
    dispatch(increaseQuantity(itemId));
    setIsRepeatModalOpen(false);
  };

  // Handle customize order
  const handleCustomizeOrder = () => {
    setIsRepeatModalOpen(false);
    // Create a copy of the meal to ensure it's treated as a new item
    const mealCopy = {
      ...meal,
      // Add a unique identifier to ensure it's treated as a different item
      customizationId: Date.now().toString()
    };
    onAddToCart(mealCopy); // This will open the customization modal with the copied meal
  };

  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden transition-shadow duration-300 h-full flex flex-col">
        {/* Mobile view layout */}
        <div className="flex flex-row md:hidden">
          {/* Content on the left */}
          <div className="w-2/3 p-3">
            <h2 className="text-lg font-bold text-gray-800 mb-0.5">{meal.setMealName}</h2>
            {/* <div className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
              <span className="text-xs font-medium text-indigo-600">Customizable</span>
              <svg className="w-3 h-3 ml-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
            </div> */}
            
            {/* Meal Items */}
            <div className="space-y-1 mb-2 mt-2">
              {displayedItems.map(item => (
                <p key={item.itemid} className="text-sm text-gray-500">{item.quantity} x {item.itemname}</p>
              ))}
            </div>
            
            {/* Show More Button with hidden items count */}
            {hasMoreItems && (
              <div className="flex items-center mb-2">
                <button 
                  className="text-[#5046E5] text-xs font-medium flex items-center"
                  onClick={() => setShowAllItems(!showAllItems)}
                >
                  {showAllItems ? 'Show less' : '... Show more'}
                </button>
                {!showAllItems && (
                  <span className="ml-2 bg-[#EEEDFD] text-[#5046E5] text-xs font-medium px-2 py-0.5 rounded-lg">
                    +{hiddenItemsCount}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Image on the right */}
          <div className="relative w-1/2 m-2 rounded-lg">
            <img 
              src={meal.setMealImage || DummyImage} 
              alt={meal.setMealName} 
              className="w-full h-32 object-cover rounded-lg"
            />
            {/* Favorite button with loading state and filled/unfilled heart */}
            <button 
              className="absolute top-2 right-2 bg-white p-2 rounded-lg shadow-md cursor-pointer hover:bg-gray-50"
              onClick={() => onToggleFavorite(meal.setMealId)}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-t-2 border-[#5046E5] rounded-lg animate-spin"></div>
              ) : isFavorite ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5046E5" className="w-5 h-5">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-[#5046E5]">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </button>
            
            {/* Price and Add/Quantity Button positioned at the bottom of the card */}
            <div className="absolute bottom-3 left-0 right-0 mx-auto w-11/12 bg-[#EEEDFD] rounded-lg px-3 py-1.5 flex justify-between items-center hover:bg-[#E6E4FC] transition-colors duration-200">
              <span className="text-base font-bold text-[#5046E5]">₹{meal.setMealPrice}</span>
              {isInCart ? (
                <div className="flex items-center space-x-1">
                  <button 
                    className="bg-[#5046E5] cursor-pointer text-white p-0.5 rounded-lg hover:bg-[#4038C7] transition-colors duration-200 flex items-center justify-center min-w-[20px] min-h-[20px]"
                    onClick={handleDecreaseQuantity}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-[#5046E5] font-bold text-sm px-1">{quantity}</span>
                  <button 
                    className="bg-[#5046E5] cursor-pointer text-white p-0.5 rounded-lg hover:bg-[#4038C7] transition-colors duration-200 flex items-center justify-center min-w-[20px] min-h-[20px]"
                    onClick={handleIncreaseQuantity}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button 
                  className="bg-[#5046E5] text-white cursor-pointer p-1 rounded-lg hover:bg-[#4038C7] transition-colors duration-200 flex items-center justify-center min-w-[24px] min-h-[24px]"
                  onClick={handleIncreaseQuantity}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop view layout */}
        <div className="hidden md:flex md:flex-col md:h-full">
          {/* Image at the top */}
          <div className="relative w-full h-40 md:h-36 lg:h-44">
            <img 
              src={meal.setMealImage || DummyImage} 
              alt={meal.setMealName} 
              className="w-full h-full object-cover"
            />
            {/* Favorite button */}
            <button 
              className="absolute top-2 right-2 bg-white p-2 rounded-lg shadow-md cursor-pointer hover:bg-gray-50"
              onClick={() => onToggleFavorite(meal.setMealId)}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-t-2 border-[#5046E5] rounded-lg animate-spin"></div>
              ) : isFavorite ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5046E5" className="w-5 h-5">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-[#5046E5]">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Content below the image */}
          <div className="p-3 flex-grow flex flex-col">
            <h2 className="text-base font-bold text-gray-800 mb-0.5">{meal.setMealName}</h2>
            {/* <div className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 mb-2">
              <span className="text-xs font-medium text-indigo-600">Customizable</span>
              <svg className="w-3 h-3 ml-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
            </div> */}
            
            {/* Meal Items */}
            <div className="space-y-1 mb-2 flex-grow">
              {displayedItems.map(item => (
                <p key={item.itemid} className="text-xs text-gray-500">{item.quantity} x {item.itemname}</p>
              ))}
            </div>
            
            {/* Show More Button with hidden items count */}
            {hasMoreItems && (
              <div className="flex items-center mb-2">
                <button 
                  className="text-[#5046E5] text-xs font-medium flex items-center"
                  onClick={() => setShowAllItems(!showAllItems)}
                >
                  {showAllItems ? 'Show less' : '... Show more'}
                </button>
                {!showAllItems && (
                  <span className="ml-2 bg-[#EEEDFD] text-[#5046E5] text-xs font-medium px-2 py-0.5 rounded-lg">
                    +{hiddenItemsCount}
                  </span>
                )}
              </div>
            )}
            
            {/* Price and Add/Quantity Button */}
            <div className="bg-[#EEEDFD] rounded-lg px-3 py-1.5 flex justify-between items-center hover:bg-[#E6E4FC] transition-colors duration-200 mt-auto">
              <span className="text-sm font-bold text-[#5046E5]">₹{meal.setMealPrice}</span>
              {isInCart ? (
                <div className="flex items-center space-x-1">
                  <button 
                    className="bg-[#5046E5] cursor-pointer text-white p-0.5 rounded-lg hover:bg-[#4038C7] transition-colors duration-200 flex items-center justify-center min-w-[20px] min-h-[20px]"
                    onClick={handleDecreaseQuantity}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-[#5046E5] font-bold mx-1">{quantity}</span>
                  <button 
                    className="bg-[#5046E5] cursor-pointer text-white p-0.5 rounded-lg hover:bg-[#4038C7] transition-colors duration-200 flex items-center justify-center min-w-[20px] min-h-[20px]"
                    onClick={handleIncreaseQuantity}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button 
                  className="bg-[#5046E5] cursor-pointer text-white p-1 rounded-lg hover:bg-[#4038C7] transition-colors duration-200 flex items-center justify-center min-w-[24px] min-h-[24px]"
                  onClick={handleIncreaseQuantity}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Repeat Order Modal */}
      <RepeatOrderModal 
        isOpen={isRepeatModalOpen}
        onClose={() => setIsRepeatModalOpen(false)}
        onRepeat={handleRepeatOrder}
        onCustomize={handleCustomizeOrder}
      />
    </>
  );
};

MealCard.propTypes = {
  meal: PropTypes.shape({
    setMealId: PropTypes.string.isRequired,
    setMealName: PropTypes.string.isRequired,
    setMealPrice: PropTypes.number.isRequired,
    setMealImage: PropTypes.string,
    SetMeal_Items: PropTypes.arrayOf(
      PropTypes.shape({
        categoryname: PropTypes.string.isRequired,
        Menu_Item: PropTypes.arrayOf(
          PropTypes.shape({
            itemid: PropTypes.number.isRequired,
            itemname: PropTypes.string.isRequired
          })
        ).isRequired
      })
    ).isRequired
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
  isFavorite: PropTypes.bool,
  isLoading: PropTypes.bool
};

MealCard.defaultProps = {
  isFavorite: false,
  isLoading: false
};

export default MealCard; 