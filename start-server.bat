@echo off
echo ========================================
echo   Starting Tennis App Backend Server
echo ========================================
echo.
cd /d "%~dp0server"
echo Installing server dependencies...
call npm install
echo.
echo Starting server...
echo.
echo The server will run on http://localhost:3000
echo.
echo To test with a friend:
echo 1. Find your IP address: Run 'ipconfig' in PowerShell
echo 2. Look for "IPv4 Address" (e.g., 192.168.1.100)
echo 3. Update config.js in the app with: http://YOUR_IP:3000
echo.
call npm start
pause
