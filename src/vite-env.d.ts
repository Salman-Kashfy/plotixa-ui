/// <reference types="vite/client" />

// Extend Window interface to include Electron API
interface Window {
  electronAPI?: {
    syncBiometric: (params: { deviceIp: string; fullName: string; customerId: string; gymId: string; token: string; apiBaseUrl: string; autoCleanup?: boolean }) => Promise<{ success: boolean; message: string; biometricUserId?: string; uid?: number }>;
    enrollBiometric: (params: { deviceIp: string; biometricUserId?: string | number; biometricUid?: string | number; fingerId?: number }) => Promise<{ success: boolean; message: string }>;
    unsyncBiometric: (params: { deviceIp: string; biometricUid: string | number; customerId: string; gymId: string; token: string; apiBaseUrl: string }) => Promise<{ success: boolean; message: string }>;
    isElectron: boolean;
  };
  __ELECTRON__?: boolean;
}
