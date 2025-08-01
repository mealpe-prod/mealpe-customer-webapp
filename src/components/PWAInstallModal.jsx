import { useState, useEffect } from 'react';
import usePWAInstall from '../hooks/usePWAInstall';
import { isInstalledPWA } from '../registerSW';

/**
 * A modal that provides more detailed install instructions
 * and promotional content for the PWA
 */
const PWAInstallModal = ({
  isOpen = false,
  onClose,
  showAppIcon = true,
  appIconSrc = '/icons/icon-192x192.png',
  appName = 'MealPe',
  appDescription = 'Your Meal Companion',
  features = [
    'Faster loading times',
    'No app store needed',
    'Save storage space'
  ]
}) => {
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const { isInstallable, triggerInstall, isIOS } = usePWAInstall();
  
  // If the app is already installed as PWA or not installable, close the modal
  useEffect(() => {
    if (isOpen && (!isInstallable && !isIOS || isInstalledPWA())) {
      onClose?.();
    }
  }, [isInstallable, isOpen, onClose]);
  
  // Function to handle installation
  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      try {
        const installed = await triggerInstall();
        if (installed) {
          onClose?.();
        }
      } catch (error) {
        console.error('Installation failed:', error);
      }
    }
  };
  
  // If the modal is not open, don't render anything
  if (!isOpen) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Install App</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        
        {/* App Info */}
        <div className="p-6">
          <div className="flex items-center mb-4">
            {showAppIcon && (
              <img 
                src={appIconSrc} 
                alt={appName} 
                className="w-16 h-16 rounded-lg mr-4"
              />
            )}
            <div>
              <h3 className="font-bold text-lg">{appName}</h3>
              <p className="text-gray-600">{appDescription}</p>
            </div>
          </div>
          
          {/* Features */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Benefits of installing:</h4>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          {/* iOS Instructions */}
          {isIOS && showIOSInstructions ? (
            <div className="border rounded-lg p-4 bg-gray-50 mb-6">
              <h4 className="font-semibold mb-3">How to install:</h4>
              <ol className="space-y-3">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  <span>Tap the share icon <span aria-label="share icon">⎙</span> at the bottom of your screen</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  <span>Scroll down and tap "Add to Home Screen"</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  <span>Tap "Add" in the top-right corner</span>
                </li>
              </ol>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-gray-600 text-sm">
                {isIOS 
                  ? "Install this app on your device for quick access with a native app experience."
                  : "Install this web app on your device for quick access with a native app experience - no app store required."}
              </p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Not now
            </button>
            {isIOS && !showIOSInstructions ? (
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Show me how
              </button>
            ) : !isIOS && (
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Install
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallModal; 