import { CapacitorConfig } from '@capacitor/cli';

// IMPORTANT: Replace 'https://your-app.vercel.app' with your actual Vercel deployment URL
// You can also set this via environment variable: NEXT_PUBLIC_DEPLOYED_URL
const DEPLOYED_URL = process.env.NEXT_PUBLIC_DEPLOYED_URL || 'https://belcit-frontend.vercel.app';

const config: CapacitorConfig = {
  appId: 'com.belcit.trading',
  appName: 'BELCIT Trading',
  webDir: 'public', // Not used in server mode, but required by Capacitor
  // Server mode: Loads your Next.js app from deployed URL
  // This allows all Next.js features to work while providing native app experience
  // The app will automatically load updates when you deploy to Vercel
  server: {
    url: DEPLOYED_URL,
    androidScheme: 'https',
    cleartext: false, // Set to true only if using http://
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

