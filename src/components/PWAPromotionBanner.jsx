import { useState, useEffect } from 'react';
import usePWAInstall from '../hooks/usePWAInstall';
import { isInstalledPWA } from '../registerSW';

/**
 * A promotional banner that encourages users to install the PWA
 */
const PWAPromotionBanner = ({ 
  delay = 3000, // Delay in ms before showing the banner
  storageKey = 'pwa-banner-dismissed', // Local storage key to remember dismissal
  dismissFor = 7, // Days to dismiss the banner for after closing
  desktopText = 'Install our app for a better experience',
  mobileText = 'Add to home screen for a better experience',
  iosText = 'Add to home screen for app-like experience'
}) => {
  const [visible, setVisible] = useState(true);
  const { isInstallable, triggerInstall, isIOS, isMobile } = usePWAInstall();
  
  // Show the banner after a delay and only if appropriate
  useEffect(() => {
    // Don't show if already installed as PWA
    if (isInstalledPWA()) {
      return;
    }
    
    // Check if the banner was previously dismissed
    const lastDismissed = localStorage.getItem(storageKey);
    if (lastDismissed) {
      const dismissedDate = new Date(parseInt(lastDismissed, 10));
      const dismissedForDays = dismissFor * 24 * 60 * 60 * 1000; // Convert days to ms
      
      // If the dismissal period hasn't passed, don't show the banner
      if (Date.now() - dismissedDate.getTime() < dismissedForDays) {
        return;
      }
    }
    
    // If we passed all checks, show the banner after delay
    const timer = setTimeout(() => {
      if (isInstallable || isIOS) {
        setVisible(true);
      }
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay, dismissFor, isInstallable, isIOS, storageKey]);
  
  // Handle banner dismissal
  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(storageKey, Date.now().toString());
  };
  
  // Handle installation
  const handleInstall = async () => {
    if (isIOS) {
      // Show iOS instructions (in this case we'll just redirect to a help page)
      // You could also trigger an iOS-specific modal here
      alert('To install: tap the share icon, then "Add to Home Screen"');
    } else {
      try {
        await triggerInstall();
        // After installation handled, dismiss the banner
        handleDismiss();
      } catch (error) {
        console.error('Installation failed:', error);
      }
    }
  };
  
  // If the banner is not visible, don't render anything
  if (!visible) {
    return null;
  }
  
  // Determine the appropriate text based on device
  let bannerText = desktopText;
  if (isIOS) {
    bannerText = iosText;
  } else if (isMobile) {
    bannerText = mobileText;
  }
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#FF583A] to-[#FF7A54] text-white p-3 flex justify-between items-center z-50 shadow-md transition-all duration-300 ease-in-out border-b border-white/10">
      <div className="flex-1 md:text-md text-sm font-medium pl-2">
        <p className="tracking-wide">{bannerText}</p>
      </div>
      <div className="flex items-center space-x-3">
        <button 
          className="md:px-5 px-3 py-2 bg-white text-[#FF583A] rounded-lg font-semibold hover:bg-gray-100 active:scale-95 transition-all duration-200 md:text-md text-sm cursor-pointer shadow-sm hover:shadow-md"
          onClick={handleInstall}
        >
          Install Now
        </button>
        <button 
          className="p-2 text-white hover:text-gray-200 cursor-pointer md:pr-5 active:scale-95 transition-all duration-200 rounded-full hover:bg-white/10"
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default PWAPromotionBanner; 