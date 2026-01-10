# Testing with a Friend - Setup Guide

## Step 1: Start the Backend Server

1. **Double-click `start-server.bat`** in the project folder
   - OR open PowerShell in the `server` folder and run: `npm install` then `npm start`
   
2. The server will start on `http://localhost:3000`
   - You'll see a message with your IP address

## Step 2: Find Your Computer's IP Address

1. Open PowerShell
2. Run: `ipconfig`
3. Look for **"IPv4 Address"** under your Wi-Fi adapter
   - Example: `192.168.1.100`

## Step 3: Update Config on Both Phones

1. Open `config.js` in the project
2. Replace `localhost` with your IP address:
   ```javascript
   export const SERVER_URL = 'http://192.168.1.100:3000';
   ```
   (Use YOUR actual IP, not this example)

3. **Do this on BOTH phones** - yours and your friend's

## Step 4: Make Sure Both Phones Are on Same Wi-Fi

- Both phones must be connected to the **same Wi-Fi network** as your computer

## Step 5: Start the App on Both Phones

1. **On your phone:**
   - Select **"You (User 1)"** when the app starts
   - Restart Expo server if needed: `npm start`

2. **On your friend's phone:**
   - Select **"Friend 1 (User 2)"** when the app starts
   - Make sure they're connected to the same Wi-Fi

## Step 6: Test the Flow

1. **On your phone (User 1):**
   - Tap the + button
   - Create a request with date, time, and select "Friend 1"
   - Send the request

2. **On your friend's phone (User 2):**
   - They should see the new request appear automatically!
   - Tap on it to view details
   - Tap "Accept Time" and choose a time
   - The acceptance will appear on your phone instantly

3. **Back on your phone (User 1):**
   - Open the request details
   - You'll see "Friend 1" has accepted a time
   - Tap "Confirm Match" to finalize

## Troubleshooting

**"Cannot connect to server" error:**
- Make sure the server is running (`start-server.bat`)
- Check that both phones have the correct IP in `config.js`
- Verify both phones are on the same Wi-Fi

**Requests not appearing:**
- Check the server console for connection messages
- Make sure both users selected different user IDs
- Try restarting both apps

**Server won't start:**
- Make sure Node.js is installed
- Run `npm install` in the `server` folder first
