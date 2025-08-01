// This file will register the service worker and handle the PWA installation logic
import { registerSW } from 'virtual:pwa-register';

// Register the service worker
export const registerServiceWorker = () => {
  // Check if the app is in a browser environment
  if ('serviceWorker' in navigator) {
    // This comes from the vite-plugin-pwa and provides update capability
    const updateSW = registerSW({
      onNeedRefresh() {
        // When a new version is available
        if (confirm('New content available. Reload?')) {
          updateSW(true);
        }
      },
    });
    
    return { updateSW };
  }
  
  return { updateSW: null };
};

// Function to determine if the app can be installed
export const isPWAInstallable = () => {
  return window.matchMedia('(display-mode: browser)').matches && 
         !window.navigator.standalone && 
         !window.matchMedia('(display-mode: standalone)').matches;
};

// Function to check if the app is running as an installed PWA
export const isInstalledPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone;
}; 