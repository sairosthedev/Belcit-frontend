# Sunmi V2 POS Setup Guide

This guide will help you deploy and run the BELCIT Trading system on your Sunmi V2 POS device.

## Prerequisites

- Sunmi V2 POS device (Android 7.1+)
- Internet connection
- Web browser installed on the device (Chrome recommended)

## Features Optimized for POS

✅ **Touch-optimized UI** - Larger buttons and touch targets (minimum 44x44px)
✅ **Responsive design** - Automatically adapts to POS screen size
✅ **Barcode scanner support** - Works with built-in scanner (keyboard input)
✅ **PWA support** - Can be installed as an app
✅ **Offline-ready** - Progressive Web App capabilities

## Deployment Options

### Option 1: Access via Web Browser (Recommended)

1. **Deploy your Next.js app** to a hosting service (Vercel, Netlify, or your own server)
2. **On your Sunmi V2 device:**
   - Open Chrome browser
   - Navigate to your deployed URL (e.g., `https://your-app.vercel.app`)
   - The app will automatically detect it's running on a POS device
   - For best experience, add to home screen:
     - Tap the menu (3 dots)
     - Select "Add to Home screen"
     - The app will launch in fullscreen mode

### Option 2: Local Network Deployment

If you want to run it on your local network:

1. **Build the production version:**
   ```bash
   npm run build
   npm start
   ```

2. **Find your computer's local IP address:**
   - Windows: `ipconfig` (look for IPv4 address)
   - Mac/Linux: `ifconfig` or `ip addr`

3. **On Sunmi V2:**
   - Connect to the same WiFi network
   - Open browser and go to `http://YOUR_IP_ADDRESS:3000`

### Option 3: Static Export (Offline-capable)

For offline use or local file serving:

1. **Update `next.config.mjs`:**
   ```javascript
   const nextConfig = {
     output: 'export',
     // ... rest of config
   }
   ```

2. **Build static files:**
   ```bash
   npm run build
   ```

3. **Transfer files to device:**
   - Copy the `out` folder to your Sunmi V2
   - Use a local web server app (available on Play Store)
   - Serve the `out` folder

## POS-Specific Optimizations

The system automatically detects POS devices and optimizes:

- **Button sizes**: Larger touch targets (40-44px minimum)
- **Spacing**: Increased padding for easier tapping
- **Layout**: Responsive grid that adapts to screen size
- **Input fields**: Larger, easier to tap
- **Barcode scanning**: Automatically focuses search input when scanner is used

## Using the Barcode Scanner

The Sunmi V2's built-in barcode scanner works automatically:

1. Navigate to the POS System (`/dashboard/sales`)
2. The search/scan input is automatically focused
3. Scan a barcode - it will be entered as keyboard input
4. The product will be automatically added to the cart

## Troubleshooting

### App not loading
- Check internet connection
- Verify the backend API URL is correct in `.env.local`
- Check browser console for errors

### Touch not working well
- The app automatically detects touch devices
- If issues persist, clear browser cache and reload

### Barcode scanner not working
- Ensure the scanner is enabled in device settings
- Check that the search input is focused
- Try manually typing a barcode to test

### Performance issues
- Close other apps on the device
- Clear browser cache
- Restart the device if needed

## Best Practices

1. **Bookmark the app** - Add to home screen for quick access
2. **Keep device updated** - Ensure Android and browser are up to date
3. **Test offline mode** - If using PWA, test offline functionality
4. **Regular backups** - Ensure your backend data is backed up

## Support

For issues or questions, check:
- Backend API is running and accessible
- Network connectivity
- Browser compatibility (Chrome recommended)

