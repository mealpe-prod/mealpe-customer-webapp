import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';

// Load persisted state from localStorage
const loadState = () => {
  try {
    const serializedUser = localStorage.getItem('user');
    const userToken = localStorage.getItem('userToken');
    const serializedCart = localStorage.getItem('cart');
    
    let preloadedState = {};
    
    // Load auth state
    if (serializedUser !== null || userToken !== null) {
      let user = null;
      if (serializedUser) {
        try {
          user = JSON.parse(serializedUser);
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
      
      // If we have a token but no user object, create a minimal user object with the token
      if (!user && userToken) {
        user = { token: userToken };
      }
      
      preloadedState.auth = {
        user: user,
        loading: false,
        error: null
      };
    }
    
    // Load cart state
    if (serializedCart !== null) {
      try {
        const parsedCart = JSON.parse(serializedCart);
        preloadedState.cart = parsedCart;
      } catch (e) {
        console.error('Error parsing cart from localStorage:', e);
        preloadedState.cart = { items: [], loading: false, error: null };
      }
    } else {
      // Initialize with empty cart if not found in localStorage
      preloadedState.cart = { items: [], loading: false, error: null };
    }
    
    return Object.keys(preloadedState).length > 0 ? preloadedState : undefined;
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return undefined;
  }
};

// Create store with persisted state
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
  preloadedState: loadState()
});

// Subscribe to store changes to save to localStorage
store.subscribe(() => {
  const state = store.getState();
  try {
    // Save auth state
    const user = state.auth.user;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      // Also store token separately for backward compatibility
      if (user.token) {
        localStorage.setItem('userToken', user.token);
      }
    } else {
      // Clear auth storage when user is null
      localStorage.removeItem('user');
      localStorage.removeItem('userToken');
    }
    
    // Save cart state - ensure we're always saving the cart state
    localStorage.setItem('cart', JSON.stringify(state.cart));
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
});

export default store; 