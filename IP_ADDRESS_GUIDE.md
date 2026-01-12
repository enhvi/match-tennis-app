# IP Address Guide for Find A Match

## Will My IP Change?

**Short answer:** It might, depending on your network setup.

### Most Common Scenario (Home Wi-Fi)
- **Dynamic IP (DHCP)**: Your router assigns an IP when you connect
- **Usually stays the same**: Most routers remember your device and give the same IP
- **Can change**: If router is reset or device is offline for a long time

### How to Check Your IP

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your Wi-Fi adapter

**Or run:** `check-ip.bat` in this folder

### Solutions

#### Option 1: Set Static IP (Recommended for Development)
1. Open Network Settings
2. Go to your Wi-Fi connection
3. Properties → IPv4 → Manual
4. Set a static IP (e.g., 192.168.1.100)
5. Your IP will never change

#### Option 2: Check IP Each Time
- Run `ipconfig` or `check-ip.bat` after restarting
- Update `config.js` if it changed

#### Option 3: Use Your Router's IP (Alternative)
- Find your router's IP: `ipconfig` → "Default Gateway"
- Use port forwarding to your PC
- More complex but more stable

#### Option 4: Use a Service (For Production)
- **ngrok**: Creates a public URL that tunnels to your local server
- **Cloud server**: Deploy to AWS, Heroku, etc.
- **Dynamic DNS**: Use a service like No-IP

### Quick Fix Script

Create a batch file that:
1. Gets your current IP
2. Updates config.js automatically

Would you like me to create this?
