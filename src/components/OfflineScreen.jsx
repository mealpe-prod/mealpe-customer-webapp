import React, { useEffect, useState } from 'react';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import RefreshIcon from '@mui/icons-material/Refresh';

const OfflineScreen = ({ onRetry }) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 p-6">
      <div className="flex flex-col items-center max-w-md text-center">
        <div className="bg-gray-100 rounded-lg p-6 mb-6">
          <WifiOffIcon style={{ fontSize: 60 }} className="text-gray-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-3">You're offline</h1>
        
        <p className="text-gray-600 mb-8">
          It seems you've lost your internet connection. Please check your network settings and try again.
        </p>
        
        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-2 bg-[#FF583A] text-white py-3 px-6 rounded-lg font-medium transition-colors"
        >
          <RefreshIcon />
          Retry Connection
        </button>
      </div>
    </div>
  );
};

export default OfflineScreen; 