import { useEffect } from 'react';
import { AndroidBridge } from '../lib/androidBridge';

export function useAppProtection(status: string) {
  // Prevent App Closure when VPN is Active
  useEffect(() => {
    const isConnected = status === 'connected' || status === 'connecting';
    
    // Notify Android Host
    AndroidBridge.setVpnActive(isConnected);

    // Web Fallback: Warn user before closing tab
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isConnected) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [status]);
}
