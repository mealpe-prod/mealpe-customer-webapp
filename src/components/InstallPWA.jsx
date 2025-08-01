import { useState } from 'react';
import usePWAInstall from '../hooks/usePWAInstall';

/**
 * Generic Install PWA button component that works on both desktop and mobile
 */
const InstallPWA = ({ 
  className = '',
  desktopButtonText = 'Install App',
  mobileButtonText = 'Add to Home Screen',
  showOnlyIfInstallable = true,
  showIOSInstructions = true,
  customStyles = {} 
}) => {
  const { isInstallable, triggerInstall, isIOS, isMobile } = usePWAInstall();
  const [showInstructions, setShowInstructions] = useState(false);
  
  // If component should only show when installable and it's not installable, return null
  if (showOnlyIfInstallable && !isInstallable && !isIOS) {
    return null;
  }
  
  // Button text based on device
  const buttonText = isMobile ? mobileButtonText : desktopButtonText;
  
  // Default styles that can be overridden
  const defaultStyles = {
    container: 'flex flex-col items-center',
    button: `px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 
             transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`,
    instructions: 'mt-4 px-4 py-3 bg-gray-100 rounded-md text-sm text-gray-800',
    instructionStep: 'mb-2 flex items-start',
    stepNumber: 'mr-2 font-bold',
    closeButton: 'mt-3 text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer'
  };
  
  // Merge default styles with custom styles
  const styles = {
    ...defaultStyles,
    ...customStyles
  };
  
  // For iOS, show instructions since we can't trigger install programmatically
  const handleIOSInstall = () => {
    setShowInstructions(true);
  };
  
  // Handle installation based on device type
  const handleInstall = async () => {
    if (isIOS) {
      handleIOSInstall();
    } else {
      await triggerInstall();
    }
  };
  
  return (
    <div className={styles.container}>
      <button
        onClick={handleInstall}
        className={styles.button}
        style={customStyles.button}
      >
        {buttonText}
      </button>
      
      {/* iOS specific install instructions */}
      {isIOS && showInstructions && showIOSInstructions && (
        <div className={styles.instructions}>
          <div className={styles.instructionStep}>
            <span className={styles.stepNumber}>1.</span>
            <span>Tap the share icon <span aria-label="share icon">⎙</span> at the bottom of your screen</span>
          </div>
          <div className={styles.instructionStep}>
            <span className={styles.stepNumber}>2.</span>
            <span>Scroll down and tap "Add to Home Screen"</span>
          </div>
          <div className={styles.instructionStep}>
            <span className={styles.stepNumber}>3.</span>
            <span>Tap "Add" in the top-right corner</span>
          </div>
          <div 
            className={styles.closeButton}
            onClick={() => setShowInstructions(false)}
          >
            Close Instructions
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallPWA; 