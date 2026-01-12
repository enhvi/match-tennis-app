@echo off
echo Finding your IP address...
echo.
ipconfig | findstr /i "IPv4"
echo.
echo This is your current IP address.
echo If it changes after restarting, you'll need to update config.js
pause
