import { useState } from 'react';
import usePWAInstall from '../hooks/usePWAInstall';
import { isInstalledPWA } from '../registerSW';
import PWAInstallModal from './PWAInstallModal';

/**
 * A button that can be placed in the sidebar, footer, or other UI elements
 * to provide a way for users to manually install the app
 */
const InstallAppButton = ({
  className = '',
  buttonText = 'Install App',
  iconOnly = false,
  showInPWA = false,
}) => {
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const { isInstallable, isIOS, triggerInstall } = usePWAInstall();
  
  // If not installable or already installed as PWA and we don't want to show in PWA, return null
  if ((!isInstallable && !isIOS) || (!showInPWA && isInstalledPWA())) {
    return null;
  }
  
  // Handle direct installation or show iOS instructions
  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(!showIOSInstructions); // Toggle iOS instructions
    } else {
      try {
        await triggerInstall();
      } catch (error) {
        console.error('Installation failed:', error);
      }
    }
  };
  
  return (
    <>
      <div className="flex flex-col">
        <button
          onClick={handleInstall}
          className={`flex text-md items-center justify-center ${iconOnly ? 'p-2' : 'px-4 py-2'} 
                      bg-[#FF583A] hover:bg-[#FF583A] text-white rounded-[12px] cursor-pointer 
                      transition-colors duration-200 ${className}`}
          aria-label={buttonText}
        >
          
          {!iconOnly && <span>{buttonText}</span>}
        </button>
        
        {/* iOS Instructions (only shown if iOS device and instructions toggled) */}
        {isIOS && showIOSInstructions && (
          <div className="mt-4 p-3 bg-white text-sm rounded-md">
            <h4 className="font-semibold mb-2">How to install:</h4>
            <ol className="space-y-2">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                <span>Tap the share icon at the bottom of your screen</span>
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
            <button 
              onClick={() => setShowIOSInstructions(false)}
              className="mt-2 text-xs text-[#FF583A] hover:text-[#FF583A]"
            >
              Close Instructions
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default InstallAppButton; 