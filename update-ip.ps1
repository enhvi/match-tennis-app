# PowerShell script to automatically update config.js with current IP address

$configFile = Join-Path $PSScriptRoot "config.js"

# Get current IP address (prefer non-APIPA addresses)
$allIPs = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    ($_.InterfaceAlias -like "*Wi-Fi*" -or 
     $_.InterfaceAlias -like "*Ethernet*" -or
     $_.InterfaceAlias -like "*WLAN*") -and
     $_.IPAddress -notlike "169.254.*" -and
     $_.IPAddress -notlike "127.*"
}

$ipAddress = ($allIPs | Select-Object -First 1).IPAddress

if ($ipAddress) {
    $newUrl = "http://" + $ipAddress + ":3000"
    
    Write-Host "Current IP Address: $ipAddress" -ForegroundColor Green
    Write-Host "Updating config.js with: $newUrl" -ForegroundColor Yellow
    
    # Read current config
    $content = [System.IO.File]::ReadAllText($configFile)
    
    # Replace the SERVER_URL line
    $content = $content -replace "export const SERVER_URL = '[^']+';", "export const SERVER_URL = '$newUrl';"
    
    # Write back
    [System.IO.File]::WriteAllText($configFile, $content, [System.Text.Encoding]::UTF8)
    
    Write-Host "config.js updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your server URL is now: $newUrl" -ForegroundColor Cyan
} else {
    Write-Host "Error: Could not find IP address" -ForegroundColor Red
    Write-Host "Make sure you are connected to Wi-Fi" -ForegroundColor Yellow
}
