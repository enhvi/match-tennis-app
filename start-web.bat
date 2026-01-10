@echo off
echo Starting Expo web server...
echo.
cd /d "%~dp0"
start "" "http://localhost:19006"
npm run web
pause
