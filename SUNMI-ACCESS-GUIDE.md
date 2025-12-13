# How to Access Your System on Sunmi V2 POS

## 🎯 Quick Answer

**You can use the SAME web link!** No installation required, but you can optionally install it as an app for a better experience.

## Option 1: Access via Web Browser (Easiest) ✅

### Steps:

1. **On your Sunmi V2 device:**
   - Open Chrome browser (or any web browser)
   - Type your frontend URL in the address bar:
     - If deployed on Vercel: `https://your-app.vercel.app`
     - If deployed on Netlify: `https://your-app.netlify.app`
     - If on your own server: `https://your-domain.com`
   - Press Enter

2. **That's it!** The app will load and automatically detect it's running on a POS device

3. **Bookmark it** (optional but recommended):
   - Tap the menu (3 dots) in Chrome
   - Select "Add to Bookmarks"
   - This makes it easy to access later

### Pros:
- ✅ No installation needed
- ✅ Always gets the latest version
- ✅ Works immediately
- ✅ Easy to update (just refresh)

### Cons:
- ❌ Requires internet connection
- ❌ Shows browser address bar (takes up screen space)

---

## Option 2: Install as PWA App (Recommended) ⭐

This gives you an app-like experience with fullscreen mode and faster access.

### Steps:

1. **Open your app in Chrome** on the Sunmi device:
   - Navigate to your frontend URL (same as Option 1)

2. **Install the app:**
   - Look for the **install prompt** that appears (or)
   - Tap the **menu (3 dots)** in Chrome
   - Select **"Add to Home screen"** or **"Install app"**
   - Tap **"Install"** or **"Add"**

3. **Launch the app:**
   - You'll see a new icon on your home screen
   - Tap it to launch the app in fullscreen mode
   - It will look and feel like a native app!

### Pros:
- ✅ Fullscreen experience (no browser bar)
- ✅ Faster access (one tap from home screen)
- ✅ App-like feel
- ✅ Can work offline (with limitations)
- ✅ Better for daily use

### Cons:
- ❌ Requires one-time installation step
- ❌ May need to clear cache if app doesn't update

---

## 📱 Step-by-Step: Installing as PWA on Sunmi V2

### Method 1: Using Install Prompt

1. Open Chrome on Sunmi V2
2. Navigate to your app URL
3. Wait for the install banner to appear at the bottom
4. Tap **"Install"**

### Method 2: Using Chrome Menu

1. Open Chrome on Sunmi V2
2. Navigate to your app URL
3. Tap the **3-dot menu** (top right)
4. Look for **"Add to Home screen"** or **"Install app"**
5. Tap it
6. Confirm by tapping **"Add"** or **"Install"**

### Method 3: Using Chrome Settings

1. Open Chrome on Sunmi V2
2. Navigate to your app URL
3. Tap the **3-dot menu**
4. Go to **Settings** → **Site settings**
5. Look for your app in the list
6. Tap **"Add to Home screen"**

---

## 🔄 Updating the App

### If using Web Browser (Option 1):
- Just refresh the page (pull down or press refresh button)
- You'll always get the latest version

### If using PWA (Option 2):
- The app auto-updates when you open it
- If you want to force update:
  1. Open Chrome
  2. Go to your app URL
  3. Tap menu → **"Update"** (if available)
  4. Or uninstall and reinstall

---

## 🎨 What You'll See

### Web Browser Access:
- Browser address bar at top
- Standard web interface
- All features work normally

### PWA App Access:
- Fullscreen (no browser bar)
- Looks like a native app
- Faster startup
- Better for daily use

---

## 🚀 Recommended Setup

**For daily use on Sunmi V2:**
1. ✅ Install as PWA (Option 2) - Best experience
2. ✅ Place icon on home screen for quick access
3. ✅ Set Chrome to open the app automatically (if possible)

**For testing/development:**
- Use web browser access (Option 1) - Easier to refresh and test

---

## ❓ FAQ

### Q: Do I need to install anything special?
**A:** No! Just use Chrome browser and your web URL. Installation is optional.

### Q: Will it work offline?
**A:** Partially. The app can cache some data, but API calls require internet connection.

### Q: Can I use it on multiple Sunmi devices?
**A:** Yes! Just access the same URL on each device.

### Q: Do I need to configure anything on the device?
**A:** No special configuration needed. Just ensure:
- Chrome browser is installed
- Internet connection is working
- Device can access your backend URL

### Q: What if the install option doesn't appear?
**A:** Make sure:
- You're using Chrome browser
- The app is accessed via HTTPS (not HTTP)
- The manifest.json file is accessible
- Try clearing browser cache and reloading

---

## 🎯 Summary

**You have 2 options:**

1. **Web Browser** → Just use the URL (easiest, no setup)
2. **PWA App** → Install once, use like an app (better experience)

**Both use the SAME URL!** The installation just makes it more convenient.

---

## 📞 Quick Start

1. Open Chrome on Sunmi V2
2. Go to: `https://your-frontend-url.com`
3. Login and start using!
4. (Optional) Install as app for better experience

That's it! 🎉

