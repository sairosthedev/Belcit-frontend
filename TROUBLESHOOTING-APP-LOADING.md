# Troubleshooting: App Stuck on "Connecting to server..."

## Problem
The Android app opens but gets stuck on the "Connecting to server..." screen and never loads the login page.

## Possible Causes

### 1. Frontend URL Not Accessible
The app is configured to load from `https://belcit-frontend.vercel.app`. If this URL:
- Doesn't exist
- Is not deployed
- Is blocked by firewall/network
- Has SSL certificate issues

**Solution:**
- Verify the URL is accessible: Open `https://belcit-frontend.vercel.app` in a browser on your computer
- If it doesn't work, deploy your frontend to Vercel first
- Or update `capacitor.config.ts` to use a different URL

### 2. Backend API Not Accessible
The app loads but the API call to `https://belcit-backend.onrender.com` fails.

**Solution:**
- Check if backend is running: Open `https://belcit-backend.onrender.com/api/auth/me` in a browser
- Check network connectivity on the Sunmi device
- Verify CORS settings on backend allow requests from your frontend domain

### 3. Network/Firewall Issues
The Sunmi device might not have internet access or firewall is blocking.

**Solution:**
- Check WiFi/network connection on device
- Test internet: Open browser on device and visit a website
- Check if corporate firewall is blocking Render.com or Vercel.com

### 4. Timeout Issues
The API call is taking too long and timing out.

**Solution:**
- The timeout is now set to 15 seconds (reduced from 35)
- Check backend server response time
- Consider using a faster hosting service if Render is slow

## Quick Fixes

### Option 1: Verify URLs
1. Open `https://belcit-frontend.vercel.app` in browser - should show your app
2. Open `https://belcit-backend.onrender.com/api/auth/me` - should return JSON (may be 401, that's OK)

### Option 2: Update Capacitor Config
If your frontend is deployed elsewhere, update `capacitor.config.ts`:

```typescript
server: {
  url: 'https://your-actual-frontend-url.com',
  androidScheme: 'https',
}
```

Then rebuild:
```powershell
npm run sync
.\build-apk.ps1
```

### Option 3: Test with Local Server (Development Only)
For testing, you can use ngrok to expose your local dev server:

1. Install ngrok: `npm install -g ngrok`
2. Start Next.js dev server: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Update `capacitor.config.ts` with the ngrok URL
5. Rebuild APK

### Option 4: Check Device Logs
Enable remote debugging to see console errors:

1. On Sunmi device: Settings > Developer Options > Enable USB Debugging
2. Connect device to computer via USB
3. Open Chrome: `chrome://inspect`
4. Click "inspect" on your app
5. Check Console tab for errors

## Debugging Steps

1. **Check if frontend loads:**
   - Open `https://belcit-frontend.vercel.app` in browser on device
   - If it doesn't load, the issue is with frontend deployment

2. **Check if API works:**
   - Open browser on device
   - Go to: `https://belcit-backend.onrender.com/api/auth/me`
   - Should see JSON response (even if 401)

3. **Check network:**
   - Open any website on device browser
   - If no internet, fix network connection first

4. **Check app logs:**
   - Use Chrome remote debugging (see above)
   - Look for network errors or JavaScript errors

## Expected Behavior

1. App opens → Shows splash screen (2 seconds)
2. App loads frontend from Vercel URL
3. Frontend JavaScript runs → Shows "Connecting to server..."
4. API call to backend → Should complete in < 5 seconds
5. If no user → Shows login page
6. If user exists → Redirects to dashboard

If step 3-4 takes > 15 seconds, you'll see a timeout error.

## Still Not Working?

1. Verify both URLs are accessible from device browser
2. Check backend CORS settings allow your frontend domain
3. Check device network/firewall settings
4. Try rebuilding APK with updated config
5. Check Android logs: `adb logcat | grep -i capacitor`

