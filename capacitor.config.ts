import { CapacitorConfig } from '@capacitor/cli';

// For production: Use your deployed Vercel URL
// For testing: You can temporarily use a local server or ngrok
const DEPLOYED_URL = process.env.NEXT_PUBLIC_DEPLOYED_URL || 'https://belcit-frontend.vercel.app';

const config: CapacitorConfig = {
  appId: 'com.belcit.trading',
  appName: 'BELCIT Trading',
  webDir: 'public', // Required by Capacitor
  // Server mode: App loads from remote URL
  // Make sure this URL is accessible from your device
  server: {
    url: DEPLOYED_URL,
    androidScheme: 'https',
    cleartext: false,
  },
  android: {
    allowMixedContent: true,
    captureInput: true, // Important for barcode scanner
    webContentsDebuggingEnabled: true, // Enable for debugging
    backgroundColor: '#ffffff',
    // Optimize for POS devices
    hardwareAccelerated: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#2563eb",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
};

export default config;

