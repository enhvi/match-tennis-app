@echo off
echo ========================================
echo   Starting Expo for Phone Testing
echo ========================================
echo.
echo Make sure:
echo 1. Your phone and computer are on the same Wi-Fi
echo 2. You have Expo Go installed on your phone
echo.
echo Press any key to start with tunnel mode (works from anywhere)...
echo Or close this window and run: npm start
pause >nul

cd /d "%~dp0"
npm start -- --tunnel