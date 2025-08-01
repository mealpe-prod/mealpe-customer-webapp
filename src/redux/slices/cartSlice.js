import { createSlice } from '@reduxjs/toolkit';
import Toast from '../../components/Toast';

// Default initial state if nothing is in localStorage
const initialState = {
  items: [],
  loading: false,
  error: null
};

// Helper function to check if two items are exactly the same (same variations and addons)
const areItemsEqual = (item1, item2) => {
  // Check if item IDs match
  if (item1.id !== item2.id) return false;
  
  // Check if variations match
  const item1Variation = item1.extra && item1.extra.length > 0 ? item1.extra[0]?.variationId : null;
  const item2Variation = item2.extra && item2.extra.length > 0 ? item2.extra[0]?.variationId : null;
  if (item1Variation !== item2Variation) return false;
  
  // Check if addons match
  if (item1.addons && item2.addons) {
    // Compare addon selections
    const item1AddonKeys = Object.keys(item1.addons);
    const item2AddonKeys = Object.keys(item2.addons);
    
    if (item1AddonKeys.length !== item2AddonKeys.length) return false;
    
    // Check if all addon groups match
    for (const addonGroupId of item1AddonKeys) {
      if (!item2.addons[addonGroupId]) return false;
      
      // Get selected addon data IDs from both items
      const item1SelectedAddonIds = item1.addons[addonGroupId].selectedItemsAddonData 
        ? item1.addons[addonGroupId].selectedItemsAddonData.map(addon => addon.id)
        : [];
      
      const item2SelectedAddonIds = item2.addons[addonGroupId].selectedItemsAddonData
        ? item2.addons[addonGroupId].selectedItemsAddonData.map(addon => addon.id)
        : [];
      
      // Check if lengths match
      if (item1SelectedAddonIds.length !== item2SelectedAddonIds.length) return false;
      
      // Check if all addon IDs match (order doesn't matter)
      if (!item1SelectedAddonIds.every(id => item2SelectedAddonIds.includes(id))) {
        return false;
      }
    }
  } else if ((item1.addons && !item2.addons) || (!item1.addons && item2.addons)) {
    // One has addons and the other doesn't
    return false;
  }
  
  return true;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      try { 
        const { id, isEdit, previousItem, outletId, isMessItem, itemallowvariation, itemallowaddon } = action.payload;
        
        // Check if cart already has items from a different outlet/restaurant
        if (state.items.length > 0) {
          const firstItem = state.items[0];
          const firstItemOutletId = firstItem.outletId; 

          console.log("firstItemOutletId", firstItemOutletId);
          console.log("outletId", outletId);
                
          // Check if trying to add item from a different outlet/restaurant
          if ((outletId && firstItemOutletId && outletId !== firstItemOutletId)) {
            // Return state unchanged and show error toast
            Toast.error("You can only order from one restaurant at a time. Please clear your cart first.");
            return state;
          }
        }

        // Check if the current item is a mess item and if there's already a mess item in the cart
        if (isMessItem && !isEdit) {
          const existingMessItem = state.items.find(item => item.isMessItem);
          if (existingMessItem) {
            Toast.error("You can only add one mess item at a time");
            return state;
          }
        }
        
        // If editing an existing item, remove the previous version first
        if (isEdit && previousItem) {
          state.items = state.items.filter(item => !areItemsEqual(item, previousItem));
        }
        
        // Find if the exact same item exists in cart using our areItemsEqual helper
        const existingItemIndex = state.items.findIndex(item => areItemsEqual(item, action.payload));
        
        if (existingItemIndex !== -1) {
          // If exact same item exists, increment quantity
          state.items[existingItemIndex].qty += action.payload.qty || 1;
        } else {
          // Otherwise add new item
          state.items.push(action.payload);
        }
      } catch (error) {
        console.error("Error adding item to cart:", error);
        Toast.error("Failed to add item to cart");
      }
    },
    removeFromCart: (state, action) => {
      const itemToRemove = action.payload;
      
      // If itemToRemove is just an ID (string or number), remove all items with that ID
      if (typeof itemToRemove === 'string' || typeof itemToRemove === 'number') {
        state.items = state.items.filter(item => item.id !== itemToRemove);
      } 
      // If itemToRemove is an object with full item details, find and remove only the exact matching item
      else if (typeof itemToRemove === 'object') {
        const index = state.items.findIndex(item => areItemsEqual(item, itemToRemove));
        if (index !== -1) {
          state.items.splice(index, 1);
        }
      }
    },
    increaseQuantity: (state, action) => {
      const itemToIncrease = action.payload;
      
      // If itemToIncrease is just an ID (string or number), increase the first matching item
      if (typeof itemToIncrease === 'string' || typeof itemToIncrease === 'number') {
        const item = state.items.find(item => item.id === itemToIncrease);
        if (item) {
          // Prevent increasing quantity for mess items
          if (item.isMessItem) {
            Toast.error("You can only have one mess item at a time");
            return;
          }
          item.qty += 1;
        }
      } 
      // If itemToIncrease is an object with full item details, find and increase only the exact matching item
      else if (typeof itemToIncrease === 'object') {
        const index = state.items.findIndex(item => areItemsEqual(item, itemToIncrease));
        if (index !== -1) {
          // Prevent increasing quantity for mess items
          if (state.items[index].isMessItem) {
            Toast.error("You can only have one mess item at a time");
            return;
          }
          state.items[index].qty += 1;
        }
      }
    },
    decreaseQuantity: (state, action) => {
      const itemToDecrease = action.payload;
      
      // If itemToDecrease is just an ID (string or number), decrease the first matching item
      if (typeof itemToDecrease === 'string' || typeof itemToDecrease === 'number') {
        const index = state.items.findIndex(item => item.id === itemToDecrease);
        if (index !== -1) {
          if (state.items[index].qty > 1) {
            state.items[index].qty -= 1;
          } else {
            state.items.splice(index, 1);
          }
        }
      } 
      // If itemToDecrease is an object with full item details, find and decrease only the exact matching item
      else if (typeof itemToDecrease === 'object') {
        const index = state.items.findIndex(item => areItemsEqual(item, itemToDecrease));
        if (index !== -1) {
          if (state.items[index].qty > 1) {
            state.items[index].qty -= 1;
          } else {
            state.items.splice(index, 1);
          }
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    // Add a new action to hydrate the cart from localStorage if needed
    hydrateCart: (state, action) => {
      // This is useful if you need to manually load the cart
      return action.payload;
    }
  }
});

export const { 
  addToCart, 
  removeFromCart, 
  increaseQuantity, 
  decreaseQuantity, 
  clearCart,
  hydrateCart
} = cartSlice.actions;

// Selectors
export const selectCartItems = state => state.cart.items;
export const selectCartTotal = state => 
  state.cart.items.reduce((total, item) => {
    // Base price
    let itemPrice = item.price;
    
    // Add price from selected variation if any
    if (item.extra && item.extra.length > 0) {
      itemPrice += item.extra[0].price || 0;
    }
    
    // Add price from selected addons if any
    if (item.addons) {
      Object.values(item.addons).forEach(addonGroup => {
        if (addonGroup.selectedItemsAddonData) {
          addonGroup.selectedItemsAddonData.forEach(addon => {
            itemPrice += parseFloat(addon.price) || 0;
          });
        }
      });
    }
    
    return total + (itemPrice * item.qty);
  }, 0);
export const selectCartItemsCount = state => 
  state.cart.items.reduce((count, item) => count + item.qty, 0);

export default cartSlice.reducer; 