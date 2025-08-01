import "./App.css";
import { Provider } from "react-redux";
import store from "./redux/store";
import { BrowserRouter } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "./redux/slices/authSlice";
import { hydrateCart } from "./redux/slices/cartSlice";
import AppRouter from "./routes";
import { Toaster } from "react-hot-toast";
import PWAPromotionBanner from "./components/PWAPromotionBanner";
import { isInstalledPWA } from "./registerSW";
import OfflineScreen from "./components/OfflineScreen";
import ScrollToTop from "./components/ScrollToTop";
import { generateToken, messaging, setupForegroundMessageListener } from "./firebaseconfig/firebase";
import { onMessage } from "firebase/messaging";
// import { GoogleOAuthProvider } from '@react-oauth/google';

// Wrapper component to use Redux hooks
const AppContent = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart.items);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    generateToken();
    setupForegroundMessageListener();
  }, [currentUser]);

  useEffect(() => {
    // Only attempt to restore user if not already set in Redux
    if (!currentUser) {
      try {
        // Try to get user from localStorage
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          // If we have a stored user object, use that
          const parsedUser = JSON.parse(storedUser);
          dispatch(setUser(parsedUser));
        } else {
          // No user data found
          dispatch(setUser(null));
        }
      } catch (error) {
        console.error("Error restoring user from localStorage:", error);
        dispatch(setUser(null));
      }
    }
  }, [dispatch, currentUser]);

  // Load cart from localStorage if needed
  useEffect(() => {
    // Only load cart if it's empty and we have data in localStorage
    if (cartItems.length === 0) {
      try {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          if (parsedCart && parsedCart.items && parsedCart.items.length > 0) {
            dispatch(hydrateCart(parsedCart));
          }
        }
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }
  }, [dispatch, cartItems.length]);

  // Show install modal after user has interacted with the site
  useEffect(() => {
    // Don't show if already installed as PWA
    if (isInstalledPWA()) {
      return;
    }

    // Check if user has already dismissed the modal
    const hasSeenModal = localStorage.getItem("pwa-modal-seen");
    if (hasSeenModal) {
      return;
    }

    // Add a click event listener to detect user interaction
    const handleUserInteraction = () => {
      // Wait a bit before showing the modal (let the user browse first)
      setTimeout(() => {
        setShowInstallModal(true);
        // Mark that we've shown the modal
        localStorage.setItem("pwa-modal-seen", "true");
      }, 60000); // Wait 1 minute after user interaction

      // Remove the event listener after it's been triggered
      document.removeEventListener("click", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
    };
  }, []);

  return (
    <>
      <AppRouter />
      <OfflineScreen />
      <Toaster position="top-center" />

      {/* PWA Install UI */}
      {!isInstalledPWA() && (
        <PWAPromotionBanner onInstallClick={() => setShowInstallModal(true)} />
      )}
      {/* <PWAInstallModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} /> */}
    </>
  );
};

// Main component with Redux Provider
function App() {
  return (
    <Provider store={store}>
      {/* <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}> */}
        <BrowserRouter>
          <ScrollToTop />
          <AppContent />
        </BrowserRouter>
      {/* </GoogleOAuthProvider> */}
    </Provider>
  );
}

export default App;
