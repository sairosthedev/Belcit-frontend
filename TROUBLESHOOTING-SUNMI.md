# Troubleshooting: App Not Loading on Sunmi V2 Pro

## Common Causes & Solutions

### 1. **Network/Connection Issues** (Most Common)

**Symptoms:**
- App shows loading spinner indefinitely
- No error messages
- Browser console shows network errors

**Solutions:**

#### Check Internet Connection
1. Open Chrome on Sunmi device
2. Try visiting `https://google.com` to verify internet works
3. If no internet, connect to WiFi or check mobile data

#### Check Backend Accessibility
1. Open Chrome on Sunmi device
2. Try visiting: `https://belcit-backend.onrender.com/api/health` (if you have a health endpoint)
3. Or try: `https://belcit-backend.onrender.com` directly
4. If it doesn't load, the backend might be down or unreachable

#### Check API URL
1. Verify your frontend is using the correct backend URL
2. Check `.env.local` file has: `NEXT_PUBLIC_API_BASE_URL=https://belcit-backend.onrender.com`
3. Restart the dev server after changing environment variables

### 2. **CORS Issues**

**Symptoms:**
- Console shows "CORS policy" errors
- Network tab shows failed requests with CORS errors

**Solutions:**
- Ensure your backend has CORS configured to allow your frontend domain
- Check backend logs for CORS errors

### 3. **Browser Cache Issues**

**Symptoms:**
- App loads but shows old version
- Some features don't work

**Solutions:**
1. Clear browser cache:
   - Open Chrome menu (3 dots)
   - Settings → Privacy → Clear browsing data
   - Select "Cached images and files"
   - Clear data
2. Hard refresh:
   - Hold refresh button
   - Select "Hard reload" or "Empty cache and hard reload"

### 4. **JavaScript Errors**

**Symptoms:**
- App partially loads but stops
- Console shows red error messages

**Solutions:**
1. Open Chrome DevTools:
   - Menu → More tools → Developer tools
   - Or press F12
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Share error messages for debugging

### 5. **Slow Network/Timeout**

**Symptoms:**
- Loading takes very long (30+ seconds)
- Eventually shows timeout error

**Solutions:**
- The app now has 30-second timeout protection
- If timeout occurs, check:
  - Internet speed on the device
  - Backend server response time
  - Network firewall blocking requests

### 6. **Authentication Issues**

**Symptoms:**
- App loads but can't log in
- Stuck on login screen

**Solutions:**
1. Check if you have a valid token:
   - Open Chrome DevTools → Application → Local Storage
   - Look for `token` key
   - If missing or expired, you need to log in
2. Try logging in again
3. Check backend authentication endpoint is working

## Debugging Steps

### Step 1: Check Browser Console
1. Open Chrome on Sunmi device
2. Open DevTools (F12 or menu → Developer tools)
3. Go to Console tab
4. Look for:
   - Red error messages
   - Network errors
   - API request failures

### Step 2: Check Network Tab
1. In DevTools, go to Network tab
2. Reload the page
3. Look for:
   - Failed requests (red)
   - Requests that are pending (spinning)
   - Check the URL being requested

### Step 3: Test API Directly
1. In Chrome, try accessing:
   ```
   https://belcit-backend.onrender.com/api/auth/me
   ```
2. If it returns JSON, backend is working
3. If it times out or errors, backend issue

### Step 4: Check Device Logs
1. On Sunmi device, check system logs if available
2. Look for network-related errors
3. Check if device has sufficient memory/storage

## Quick Fixes

### Fix 1: Force Refresh
- Close Chrome completely
- Reopen and navigate to your app URL
- Hard refresh (hold refresh button → Empty cache and hard reload)

### Fix 2: Clear All Data
1. Chrome Settings → Privacy → Clear browsing data
2. Select "All time"
3. Check all boxes
4. Clear data
5. Restart Chrome

### Fix 3: Reinstall PWA (if installed)
1. Uninstall the PWA from home screen
2. Open Chrome and go to your app URL
3. Reinstall as PWA

### Fix 4: Check Environment
1. Verify device has good internet connection
2. Check device time/date is correct (affects SSL certificates)
3. Ensure device has enough storage space

## What We've Added to Help

✅ **30-second API timeout** - Prevents infinite loading
✅ **35-second maximum auth timeout** - Ensures loading state clears
✅ **Better error messages** - Shows what went wrong
✅ **Network error detection** - Identifies connection issues
✅ **Improved loading UI** - Shows helpful messages during load

## Still Not Working?

If the app still won't load after trying these steps:

1. **Check the exact error message** in browser console
2. **Note the network status** - Are requests failing or timing out?
3. **Test on a different device** - Does it work on phone/computer?
4. **Check backend status** - Is the backend server running?

## Contact Information

If you need further help, provide:
- Screenshot of browser console errors
- Network tab showing failed requests
- Device model and Android version
- Browser version (Chrome version)

