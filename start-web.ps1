# PowerShell script to start Expo web server and open browser
Set-Location $PSScriptRoot

Write-Host "Starting Expo web server..." -ForegroundColor Green
Write-Host "This will open your app in the browser at http://localhost:19006" -ForegroundColor Yellow
Write-Host ""

# Start the server in the background
$job = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run web
}

# Wait a few seconds for server to start
Start-Sleep -Seconds 8

# Try to open the browser
Write-Host "Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:19006"

Write-Host ""
Write-Host "Server is running! Press Ctrl+C to stop." -ForegroundColor Green
Write-Host "If the browser didn't open, go to: http://localhost:19006" -ForegroundColor Yellow
Write-Host ""

# Wait for user to stop
try {
    Wait-Job $job | Out-Null
} catch {
    Stop-Job $job
    Remove-Job $job
}
