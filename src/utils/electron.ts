// Utility to detect if running in Electron environment
export const isElectron = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check multiple indicators
  const win = window as any;
  
  // Method 1: Check for exposed electronAPI (from preload script)
  if (win.electronAPI !== undefined) return true;
  
  // Method 2: Check for global __ELECTRON__ flag
  if (win.__ELECTRON__ === true) return true;
  
  // Method 3: Check userAgent for Electron
  if (typeof navigator !== 'undefined' && navigator.userAgent.includes('Electron')) {
    return true;
  }
  
  return false;
};

// Type-safe wrapper for Electron API
export const electronAPI = {
  /** 
    Create a user in biometric device
  **/
  syncBiometric: async (params: { deviceIp: string; fullName: string; customerId: string; gymId: string; token: string; apiBaseUrl: string; autoCleanup?: boolean }): Promise<{ success: boolean; message: string; biometricUserId?: string; uid?: number }> => {
    if (!isElectron()) {
      throw new Error('Electron API is only available in desktop version');
    }
    return (window as any).electronAPI.syncBiometric(params);
  },
  /** 
    Open biometric enrollment screen for fingerprint enrollment
  **/
  enrollBiometric: async (params: { deviceIp: string; biometricUserId?: string | number; biometricUid?: string | number; fingerId?: number }): Promise<{ success: boolean; message: string }> => {
    if (!isElectron()) {
      throw new Error('Electron API is only available in desktop version');
    }
    return (window as any).electronAPI.enrollBiometric(params);
  },
  /** 
    Remove a user from biometric device
  **/
  unsyncBiometric: async (params: { deviceIp: string; biometricUid: string | number; customerId: string; gymId: string; token: string; apiBaseUrl: string; }): Promise<{ success: boolean; message: string }> => {
    if (!isElectron()) {
      throw new Error('Electron API is only available in desktop version');
    }
    
    // Check if the function exists on window.electronAPI
    const windowElectronAPI = (window as any).electronAPI;
    if (windowElectronAPI && typeof windowElectronAPI.unsyncBiometric === 'function') {
      return windowElectronAPI.unsyncBiometric(params);
    } else {
      // Fallback: Try to call it directly via ipcRenderer if available
      const { ipcRenderer } = (window as any).require?.('electron') || {};
      if (ipcRenderer) {
        return ipcRenderer.invoke('unsync-biometric', params);
      } else {
        throw new Error('Unsync biometric function not available. Please restart the application to enable this feature.');
      }
    }
  }
};

