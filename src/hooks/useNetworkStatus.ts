import { useState, useEffect } from 'react';

export type ToastType = 'online' | 'offline';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => 
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showNetworkToast, setShowNetworkToast] = useState<boolean>(false);
  const [toastType, setToastType] = useState<ToastType>('offline');

  useEffect(() => {
    let hideTimer: any;

    const handleOnline = () => {
      setIsOnline(true);
      setToastType('online');
      setShowNetworkToast(true);
      
      // Auto-hide the "Restored" toast after 4 seconds
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        setShowNetworkToast(false);
      }, 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setToastType('offline');
      setShowNetworkToast(true);
      
      // Keep offline notice visible longer
      if (hideTimer) clearTimeout(hideTimer);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  const dismissToast = () => {
    setShowNetworkToast(false);
  };

  return {
    isOnline,
    showNetworkToast,
    toastType,
    dismissToast,
  };
}
