import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Favorite, FavoriteBorder, ArrowBack } from '@mui/icons-material';
import Toast from '../../components/Toast';
import dummyImage from '../../assets/mealpe.png';
import { addToCart, increaseQuantity } from '../../redux/slices/cartSlice';

const ItemDetails = () => {
  const { outletId, itemId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const [itemDetails, setItemDetails] = useState(null);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [selectedAddons, setSelectedAddons] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    getItemDetails();
  }, [itemId]);

  // Effect to show toast when errorMessage changes
  useEffect(() => {
    if (errorMessage) {
      Toast.error(errorMessage);
    }
  }, [errorMessage]);

  const getItemDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND_BASE_URL}outlet/menu/getItem/${itemId}`
      );
      if (response.data.success) {
        const itemData = response.data.data;
        setItemDetails(itemData);
        
        // Check if the item allows variations or addons
        const allowsVariations = itemData.itemallowvariation === "1";
        const allowsAddons = itemData.itemallowaddon === "1";
        
        // If the item doesn't allow customization, add it directly to cart and go back
        if (!allowsVariations && !allowsAddons) {
          // Check if the item is already in the cart
          const matchingCartItems = cartItems.filter(
            cartItem => cartItem.id === parseInt(itemId) && cartItem.outletId === outletId
          );
          
          if (matchingCartItems.length > 0) {
            // Just increase the quantity of the existing item
            dispatch(increaseQuantity(matchingCartItems[0]));
            Toast.success("Item quantity increased");
          } else {
            // Add as a new item
            addItemToCartDirectly(itemData);
          }
          return;
        }
        
        // Filter variations that are available (status is true)
        const availableVariations = itemData.variations.filter(v => v.status === true);
        
        if (availableVariations.length > 0) {
          // Try to find the default variation that is available
          let selectedVariation = availableVariations.find(v => v.isDefault === true);
          
          // If no default variation is available, select the first available one
          if (!selectedVariation) {
            selectedVariation = availableVariations[0];
          }
          
          setSelectedVariations({
            [selectedVariation.variationId]: {
              name: selectedVariation.name,
              price: selectedVariation.price
            }
          });
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to directly add item to cart without customization
  const addItemToCartDirectly = (item) => {
    try {
      // Check if the current item is a mess item
      const isCurrentItemMessItem = item.isMessItem;
      
      // If current item is a mess item, check if there's already a mess item in cart
      if (isCurrentItemMessItem) {
        const existingMessItem = cartItems.find(cartItem => cartItem.isMessItem);
        if (existingMessItem) {
          Toast.error("You can only add one mess item at a time");
          navigate(-1);
          return;
        }
      }

      // Construct the simple item object without variations or addons
      const cartItem = {
        id: parseInt(itemId),
        name: item.itemname,
        price: item.price,
        outletId: outletId,
        restaurantId: null,
        item_image_url: item.item_image_url,
        minimumpreparationtime: item.minimumpreparationtime,
        extra: [],
        isEdit: false,
        previousItem: null,
        addons: {},
        qty: 1,
        isMessItem: item.isMessItem
      };

      dispatch(addToCart(cartItem));
      Toast.success("Item added to cart successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      Toast.error("Failed to add item to cart");
      navigate(-1);
    }
  };

  const handleVariationSelect = (variationId, name, price) => {
    // Clear error message when changing variation
    setErrorMessage('');
    
    // Clear addons when changing variation as they might be specific to a variation
    setSelectedAddons({});
    
    // Set the new selected variation
    setSelectedVariations({
      [variationId]: { name, price }
    });
  };

  const handleAddonSelect = (groupId, addonId, name, price, maxSelection) => {
    setSelectedAddons(prev => {
      const currentGroupAddons = prev[groupId] || new Map();
      const updatedGroupAddons = new Map(currentGroupAddons);
      
      if (updatedGroupAddons.has(addonId)) {
        // If already selected, remove it
        updatedGroupAddons.delete(addonId);
        // Clear error message if user is removing an item
        setErrorMessage('');
        return {
          ...prev,
          [groupId]: updatedGroupAddons
        };
      } else {
        // Check if max selection limit is reached
        if (updatedGroupAddons.size >= maxSelection) {
          // Show error message and don't add the addon
          setErrorMessage(`You can select maximum ${maxSelection} item${maxSelection > 1 ? 's' : ''} from this group`);
          return prev;
        }
        
        // Add the addon if limit not reached
        updatedGroupAddons.set(addonId, { name, price: parseFloat(price) });
        // Clear any previous error message
        setErrorMessage('');
        return {
          ...prev,
          [groupId]: updatedGroupAddons
        };
      }
    });
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Get the current selected variation ID
  const selectedVariationId = useMemo(() => {
    return Object.keys(selectedVariations)[0] || null;
  }, [selectedVariations]);

  // Filter addon groups that are applicable to the selected variation
  const applicableAddonGroups = useMemo(() => {
    if (!itemDetails) return [];
    
    return itemDetails.addonGroups.filter(group => {
      // Show all addons where variationId is null
      // Or show addons tied to the selected variation
      return group.variationId === null || group.variationId === selectedVariationId;
    });
  }, [itemDetails, selectedVariationId]);

  // Calculate total price based on base price, selected variation and addons
  const totalPrice = useMemo(() => {
    if (!itemDetails) return 0;
    
    let total = itemDetails.price;
    
    // Add variation price if any selected
    Object.values(selectedVariations).forEach(variation => {
      total = variation.price; // Replace base price with variation price
    });
    
    // Add addon prices
    Object.values(selectedAddons).forEach(addonGroup => {
      addonGroup.forEach(addon => {
        total += addon.price;
      });
    });
    
    return total;
  }, [itemDetails, selectedVariations, selectedAddons]);

  // Handle add to cart functionality
  const handleAddToCart = () => {
    try {
      if (!itemDetails) return;

      // Get the selected variation
      const variationId = selectedVariationId;
      const selectedVariation = itemDetails.variations.find(v => v.variationId === variationId);

      // Check if the current item is a mess item
      const isCurrentItemMessItem = itemDetails.isMessItem;
      
      // If current item is a mess item, check if there's already a mess item in cart
      if (isCurrentItemMessItem) {
        const existingMessItem = cartItems.find(item => item.isMessItem);
        if (existingMessItem) {
          Toast.error("You can only add one mess item at a time");
          return;
        }
      }

      // Prepare the extra array (variations)
      const extra = variationId ? [selectedVariation] : [];

      // Prepare the addons object
      const addons = {};
      
      // Transform the selectedAddons Map to the required format
      Object.entries(selectedAddons).forEach(([groupId, addonMap]) => {
        if (addonMap.size > 0) {
          const selectedAddonIndices = [];
          const selectedItemsAddonData = [];
          
          let index = 0;
          addonMap.forEach((addonData, addonId) => {
            // Find the addon group
            const addonGroup = itemDetails.addonGroups.find(group => group.id === groupId);
            if (addonGroup) {
              // Find the addon item data
              const addonItem = addonGroup.items.find(item => item.id === addonId);
              if (addonItem) {
                selectedAddonIndices.push(index);
                selectedItemsAddonData.push(addonItem);
                index++;
              }
            }
          });
          
          // Get min selection from the addon group
          const addonGroup = itemDetails.addonGroups.find(group => group.id === groupId);
          const currentMinSelection = addonGroup ? addonGroup.min_selection : 0;
          
          addons[groupId] = {
            selectedAddonIndices,
            selectedItemsAddonData,
            currentMinSelection
          };
        }
      });

      // Construct the item object
      const cartItem = {
        id: parseInt(itemId),
        name: itemDetails.itemname,
        price: itemDetails.price,
        outletId: outletId,
        restaurantId: null,
        item_image_url: itemDetails.item_image_url,
        minimumpreparationtime: itemDetails.minimumpreparationtime,
        extra,
        isEdit: false,
        previousItem: null,
        addons,
        qty: 1,
        isMessItem: itemDetails.isMessItem
      };

      dispatch(addToCart(cartItem));
      Toast.success("Item added to cart successfully!");
      navigate(-1);
      
    } catch (error) {
      console.error("Error adding item to cart:", error);
      Toast.error("Failed to add item to cart");
      navigate(-1);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-white max-w-3xl mx-auto shadow-md">
      {/* Image skeleton */}
      <div className="w-full h-52 bg-gray-200 animate-pulse relative">
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="p-4">
        <div className="h-7 w-3/4 bg-gray-200 rounded-md animate-pulse mb-3"></div>
        <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse mb-2"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded-md animate-pulse mb-6"></div>
        
        {/* Variations skeleton */}
        <div className="mt-6 mb-6">
          <div className="h-6 w-40 bg-gray-200 rounded-md animate-pulse mb-3"></div>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 rounded-[12px] animate-pulse"></div>
            ))}
          </div>
        </div>
        
        {/* Addons skeleton */}
        <div className="mt-6">
          {[1, 2].map((group) => (
            <div key={group} className="mb-5">
              <div className="h-6 w-32 bg-gray-200 rounded-md animate-pulse mb-3"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((addon) => (
                  <div key={addon} className="flex items-center justify-between">
                    <div className="h-5 w-40 bg-gray-200 rounded-md animate-pulse"></div>
                    <div className="h-5 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
    
    </div>
  );
  
  if (!itemDetails) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF1EE]">
      <div className="text-gray-600 text-xl">Item not found</div>
    </div>
  );

  // Only show customization UI if the item allows variations or addons
  const showCustomizationUI = itemDetails.itemallowvariation === "1" || itemDetails.itemallowaddon === "1";

  return (
    <div className="min-h-screen bg-white max-w-3xl mx-auto relative pb-24 shadow-md">
      {/* Item Image with overlaid buttons */}
      <div className="w-full h-46 sm:h-64 md:h-52 bg-gray-200 relative">
        <img 
          src={itemDetails.item_image_url || dummyImage} 
          alt={itemDetails.itemname}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-white p-2 rounded-full bg-black/40 hover:bg-black/60 cursor-pointer shadow-md active:scale-95 transition-transform duration-200"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Item Details */}
      <div className="p-4">
        <h1 className="text-lg sm:text-xl font-medium text-gray-800">{itemDetails.itemname}</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">{itemDetails.itemdescription}</p>
        <div className="mt-3">
          <h2 className="text-lg font-semibold">₹{totalPrice.toFixed(2)}</h2>
        </div>

        {showCustomizationUI && (
          <>
            {/* Divider */}
            <div className="w-full h-px bg-gray-200 my-4"></div>

            {/* Variations Section */}
            {itemDetails.variations && itemDetails.variations.filter(v => v.status === true).length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Customize as per your choice</h3>
                <div>
                  {itemDetails.variations.filter(v => v.status === true).map((variation) => (
                    <div 
                      key={variation.variationId} 
                      onClick={() => handleVariationSelect(variation.variationId, variation.name, variation.price)}
                      className={`flex items-center justify-between p-2 rounded-[12px] ${
                        selectedVariations[variation.variationId] ? '' : ''
                      } cursor-pointer active:scale-98 transition-transform duration-200`}
                    >
                      <span className="text-base">{variation.name}</span>
                      <div className="flex items-center">
                        <span className="mr-2 font-medium text-sm">₹{variation.price}</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedVariations[variation.variationId] ? 'border-[#FF583A] bg-[#FFF1EE]' : 'border-gray-300'
                        }`}>
                          {selectedVariations[variation.variationId] && (
                            <div className="w-2 h-2 rounded-full bg-[#FF583A]"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            {applicableAddonGroups.length > 0 && (
              <div className="w-full h-px bg-gray-200 my-2"></div>
            )}

            {/* Addon Groups Section - Only show for selected variation */}
            {applicableAddonGroups.length > 0 && applicableAddonGroups.map((group) => (
              <div key={group.id} className="mt-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">{group.name}</h3>
                <p className="text-xs text-gray-500 mb-3">
                  {group.min_selection === group.max_selection 
                    ? `Select exactly ${group.min_selection} item${group.min_selection > 1 ? 's' : ''}` 
                    : `Select ${group.min_selection} to ${group.max_selection} items`}
                </p>
                <div>
                  {group.items
                    .filter(addon => addon.active === "1") // Only show active addons
                    .map((addon) => (
                    <div 
                      key={addon.id} 
                      onClick={() => handleAddonSelect(group.id, addon.id, addon.name, addon.price, group.max_selection)}
                      className={`flex items-center justify-between p-2 rounded-[12px] ${
                        selectedAddons[group.id]?.has(addon.id) ? '' : ''
                      } cursor-pointer active:scale-98 transition-transform duration-200`}
                    >
                      <span className="text-base">{addon.name}</span>
                      <div className="flex items-center">
                        <span className="mr-2 font-medium text-sm">₹{addon.price}</span>
                        <div className={`w-4 h-4 rounded-sm flex items-center justify-center ${
                          selectedAddons[group.id]?.has(addon.id) ? 'bg-[#FF583A]' : 'border-2 border-gray-300'
                        }`}>
                          {selectedAddons[group.id]?.has(addon.id) && (
                            <svg className="w-4 h-4 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Add to Cart Button */}
      <div className="mx-auto w-full px-4 mt-4">
        <button 
          onClick={handleAddToCart}
          className="w-full bg-[#FF583A] text-white py-2.5 rounded-[12px] font-medium text-sm cursor-pointer active:scale-95 transition-transform duration-200">
          Add To Cart • ₹{totalPrice.toFixed(2)}
        </button>
      </div>
    </div>
  );
};

export default ItemDetails; 