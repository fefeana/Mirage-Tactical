declare global {
  interface Window {
    AndroidInterface?: {
      postLog: (message: string, type: string) => void;
      setVpnActive: (isActive: boolean) => void;
      minimizeApp: () => void;
    };
  }
}

export const AndroidBridge = {
  isConnected: (): boolean => {
    return typeof window !== 'undefined' && !!window.AndroidInterface;
  },
  postLog: (message: string, type: string = '#00FFCC') => {
    if (window.AndroidInterface && window.AndroidInterface.postLog) {
      window.AndroidInterface.postLog(message, type);
    }
  },
  setVpnActive: (isActive: boolean) => {
    if (window.AndroidInterface && window.AndroidInterface.setVpnActive) {
      window.AndroidInterface.setVpnActive(isActive);
    }
  },
  minimizeApp: () => {
    if (window.AndroidInterface && window.AndroidInterface.minimizeApp) {
      window.AndroidInterface.minimizeApp();
    }
  }
};
