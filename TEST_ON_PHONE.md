# Testing on Your Phone

## Quick Start (Easiest Method)

### Step 1: Install Expo Go
- **iPhone**: Download "Expo Go" from the App Store
- **Android**: Download "Expo Go" from Google Play Store

### Step 2: Connect to Same Wi-Fi
- Make sure your phone and computer are on the **same Wi-Fi network**

### Step 3: Start the Server
In your PowerShell window, run:
```powershell
npm start
```

### Step 4: Scan QR Code
- **iPhone**: Open Camera app and point at the QR code, then tap the notification
- **Android**: Open Expo Go app and tap "Scan QR code"

---

## If QR Code Doesn't Work (Tunnel Mode)

If you can't scan the QR code or your phone can't connect:

1. **Stop the current server** (Ctrl+C in PowerShell)

2. **Start with tunnel mode**:
   ```powershell
   npm start -- --tunnel
   ```

3. This creates a public URL that works from anywhere (even different Wi-Fi)

4. Scan the new QR code that appears

---

## Alternative: Manual Connection

If you see a URL like `exp://192.168.x.x:8081` in the terminal:

1. Open Expo Go app on your phone
2. Tap "Enter URL manually"
3. Type the URL you see in the terminal
4. Tap "Connect"

---

## Troubleshooting

**"Unable to connect" error:**
- Make sure both devices are on the same Wi-Fi
- Try tunnel mode: `npm start -- --tunnel`
- Check if your firewall is blocking the connection

**QR code not showing:**
- Make sure the terminal window is large enough
- Try pressing `r` to reload
- Check if port 8081 is available

**App loads but shows errors:**
- Make sure all dependencies are installed: `npm install`
- Check the terminal for error messages
