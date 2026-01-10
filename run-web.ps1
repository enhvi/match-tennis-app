# Clear any existing node processes
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Set-Location $PSScriptRoot

Write-Host "Starting Expo web server..." -ForegroundColor Green
Write-Host "Please wait for the server to start..." -ForegroundColor Yellow
Write-Host ""

# Start expo in a new window so we can see output
$process = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm start" -PassThru

# Wait for server to start
Write-Host "Waiting for server to initialize (this may take 20-30 seconds)..." -ForegroundColor Cyan
Start-Sleep -Seconds 25

# Try to open web version
Write-Host ""
Write-Host "Attempting to open web version..." -ForegroundColor Green
Write-Host "If it doesn't open automatically:" -ForegroundColor Yellow
Write-Host "1. Look at the PowerShell window that opened" -ForegroundColor Yellow
Write-Host "2. Press 'w' in that window to open web version" -ForegroundColor Yellow
Write-Host "3. Or go to http://localhost:19006 in your browser" -ForegroundColor Yellow
Write-Host ""

# Try opening the browser
Start-Process "http://localhost:19006" -ErrorAction SilentlyContinue

Write-Host "Server should be running in the other window." -ForegroundColor Green
Write-Host "Press any key to exit this script (server will keep running)..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
