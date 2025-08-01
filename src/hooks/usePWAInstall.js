import { useState, useEffect } from 'react';
import { isPWAInstallable } from '../registerSW';

/**
 * Hook to manage PWA installation
 * @returns {Object} - Installation state and functions
 */
const usePWAInstall = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [userChoice, setUserChoice] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check device type on component mount (won't change during session)
  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);
  
  // Save any existing beforeinstallprompt event that might have fired before our listener was registered
  useEffect(() => {
    // If there's a beforeinstallprompt event stored in window, use it
    if (window.deferredPrompt) {
      setInstallPrompt(window.deferredPrompt);
      setIsInstallable(true);
    }
  }, []);
  
  // Check if the app can be installed
  useEffect(() => {
    const checkInstallable = () => {
      const canInstall = isPWAInstallable() || !!installPrompt;
      setIsInstallable(canInstall);
    };
    
    checkInstallable();
    
    // Update installable state when app is installed
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setInstallPrompt(null);
      window.deferredPrompt = null;
    };
    
    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [installPrompt]);
  
  // Listen for the beforeinstallprompt event
  useEffect(() => {
    const saveInstallPrompt = (e) => {
      // Prevent browser from showing default prompt
      e.preventDefault();
      
      // Save the event for later use
      setInstallPrompt(e);
      window.deferredPrompt = e;
      setIsInstallable(true);
      
      console.log('BeforeInstallPrompt captured successfully');
    };
    
    window.addEventListener('beforeinstallprompt', saveInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', saveInstallPrompt);
    };
  }, []);
  
  // Function to trigger installation
  const triggerInstall = async () => {
    // Get the prompt from our state or the window object
    const promptEvent = installPrompt || window.deferredPrompt;
    
    if (!promptEvent) {
      console.warn('No installation prompt available');
      return false;
    }
    
    // Show the installation prompt
    promptEvent.prompt();
    
    try {
      // Wait for the user's choice
      const choiceResult = await promptEvent.userChoice;
      setUserChoice(choiceResult.outcome);
      
      // Clear the saved prompt
      setInstallPrompt(null);
      window.deferredPrompt = null;
      
      console.log(`User ${choiceResult.outcome} the installation`);
      return choiceResult.outcome === 'accepted';
    } catch (error) {
      console.error('Error during installation:', error);
      return false;
    }
  };
  
  return {
    isInstallable,
    triggerInstall,
    installOutcome: userChoice,
    isIOS,
    isMobile
  };
};

export default usePWAInstall; 