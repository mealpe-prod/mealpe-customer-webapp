import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increaseQuantity, decreaseQuantity, removeFromCart } from '../../redux/slices/cartSlice';
import dummyImage from '../../assets/mealpe.png';

const UnifiedItemModal = ({
  show,
  onClose,
  item,
  modalType,
  onRepeatItem,
  onChooseCustomization,
  matchingCartItems,
  onRemoveItem,
  getItemDescription,
  totalPrice
}) => {
  const dispatch = useDispatch();
  const [selectedCartItem, setSelectedCartItem] = useState(null);
  const cartItems = useSelector(state => state.cart.items);
  
  // Find matching cart items (items with same id but different variations)
  const getMatchingItems = () => {
    if (!item?.itemid) return [];
    return cartItems.filter(cartItem => cartItem.id === item.itemid);
  };
  
  // Get current matching items from Redux state
  const reduxMatchingItems = getMatchingItems();
  
  // Use provided matchingCartItems or get from Redux
  const itemsToDisplay = matchingCartItems || reduxMatchingItems;
  
  // Set the first matching item as selected by default
  useEffect(() => {
    if (itemsToDisplay && itemsToDisplay.length > 0) {
      setSelectedCartItem(itemsToDisplay[0]);
    }
  }, [show, itemsToDisplay]);
  
  if (!show) return null;
  
  // Handle increment quantity
  const handleIncrement = () => {
    if (selectedCartItem) {
      dispatch(increaseQuantity(selectedCartItem));
    }
  };
  
  // Handle decrement quantity
  const handleDecrement = () => {
    if (selectedCartItem) {
      if (selectedCartItem.qty > 1) {
        dispatch(decreaseQuantity(selectedCartItem));
      } else {
        dispatch(removeFromCart(selectedCartItem));
        onClose();
      }
    }
  };
  
  // Calculate the item price including addons and variations
  const calculateItemPrice = (cartItem) => {
    if (!cartItem) return 0;
    
    let itemPrice = 0;
    
    // If there's a variation, use only the variation price
    if (cartItem.extra && cartItem.extra.length > 0) {
      itemPrice = cartItem.extra[0].price || 0;
    } else {
      // If no variation, use the base item price
      itemPrice = cartItem.price || 0;
    }
    
    // Add price from selected addons if any
    if (cartItem.addons) {
      Object.values(cartItem.addons).forEach(addonGroup => {
        if (addonGroup.selectedItemsAddonData) {
          addonGroup.selectedItemsAddonData.forEach(addon => {
            itemPrice += parseFloat(addon.price) || 0;
          });
        }
      });
    }
    
    return itemPrice;
  };
  
  // Calculate the current total price
  const getCurrentTotalPrice = (cartItem) => {
    if (!cartItem) return totalPrice || (item?.price || 0);
    const itemPrice = calculateItemPrice(cartItem);
    return itemPrice * cartItem.qty;
  };
  
  // Format variations and addons into a readable string
  const formatItemVariations = (cartItem) => {
    if (!cartItem) return '';
    
    let variations = [];
    
    // Add variation info if any
    if (cartItem.extra && cartItem.extra.length > 0) {
      variations.push(`${cartItem.extra[0].name}`);
    }
    
    return variations.join(', ');
  };

  // Format addons into a readable string
  const formatItemAddons = (cartItem) => {
    if (!cartItem || !cartItem.addons) return '';
    
    let addonsList = [];
    
    Object.values(cartItem.addons).forEach(addonGroup => {
      if (addonGroup.selectedItemsAddonData && addonGroup.selectedItemsAddonData.length > 0) {
        const addonNames = addonGroup.selectedItemsAddonData.map(addon => 
          `${addon.name} (+₹${parseFloat(addon.price).toFixed(2)})`
        );
        addonsList.push(...addonNames);
      }
    });
    
    return addonsList.join(', ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
      <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold">{item?.itemname}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {itemsToDisplay.length > 0 ? (
          <>
            {/* Display each item as a separate entity */}
            {itemsToDisplay.map((cartItem, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between mb-2">
                  <h3 className="text-base font-medium">₹{calculateItemPrice(cartItem).toFixed(2)}</h3>
                  <h3 className="text-base font-medium">Total: ₹{getCurrentTotalPrice(cartItem).toFixed(2)}</h3>
                </div>
                
                <div className="border-t border-gray-200 my-2"></div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-14 h-14 mr-3">
                    <img 
                      src={cartItem.item_image_url || item?.item_image_url || dummyImage} 
                      alt={cartItem.name || item?.itemname} 
                      className="w-full h-full object-cover rounded" 
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm font-medium">{cartItem.name || item?.itemname}</h4>
                    <p className="text-gray-600 text-xs">Price: ₹{calculateItemPrice(cartItem).toFixed(2)} * {cartItem.qty}</p>
                    {formatItemVariations(cartItem) && (
                      <p className="text-xs text-gray-500">
                        Variation: {formatItemVariations(cartItem)}
                        {cartItem.extra && cartItem.extra.length > 0 && cartItem.extra[0].price > 0 && 
                          ` (+₹${parseFloat(cartItem.extra[0].price).toFixed(2)})`
                        }
                      </p>
                    )}
                    {formatItemAddons(cartItem) && (
                      <p className="text-xs text-gray-500">
                        Addons: {formatItemAddons(cartItem)}
                      </p>
                    )}
                    {/* {getItemDescription && (
                      <p className="text-xs text-gray-500">
                        {getItemDescription(cartItem)}
                      </p>
                    )} */}
                    {/* {modalType === 'add' && (
                      <button 
                        onClick={() => {
                          setSelectedCartItem(cartItem);
                          onChooseCustomization();
                        }}
                        className="text-[#FF583A] text-sm flex items-center"
                      >
                        Edit
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )} */}
                  </div>
                  <div className="flex items-center">
                    <button 
                      onClick={() => {
                        setSelectedCartItem(cartItem);
                        if (modalType === 'remove') {
                          onRemoveItem(cartItem);
                        } else {
                          if (cartItem.qty > 1) {
                            dispatch(decreaseQuantity(cartItem));
                          } else {
                            dispatch(removeFromCart(cartItem));
                          }
                        }
                      }}
                      className="w-7 h-7 rounded-full bg-white border border-[#FF583A] text-[#FF583A] flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <span className="mx-2 text-sm font-medium">{cartItem.qty}</span>
                    {modalType === 'add' && (
                      <button 
                        onClick={() => {
                          setSelectedCartItem(cartItem);
                          dispatch(increaseQuantity(cartItem));
                        }}
                        className="w-7 h-7 rounded-full bg-[#FF583A] text-white flex items-center justify-center cursor-pointer active:scale-95"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="flex justify-between mb-2">
            <h3 className="text-base font-semibold">₹{item?.price}</h3>
            <h3 className="text-base font-semibold">Total Price: ₹{item?.price}</h3>
          </div>
        )}
        
        {modalType === 'add' ? (
          <button 
            onClick={onChooseCustomization}
            className="w-full py-2 px-4 bg-[#FFF1EE] text-[#FF583A] text-sm rounded-[12px] font-medium hover:font-semibold transition-all duration-300 mb-3 cursor-pointer active:scale-95"
          >
            Add New Customisation
          </button>
        ) : (
          <button 
            onClick={onClose}
            className="w-full py-2 bg-gray-200 text-gray-700 text-sm rounded-[12px] font-medium hover:bg-gray-300 transition-all active:scale-95 duration-300 cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default UnifiedItemModal; 