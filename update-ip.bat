@echo off
echo Updating config.js with your current IP address...
echo.
powershell -ExecutionPolicy Bypass -File "update-ip.ps1"
echo.
pause
