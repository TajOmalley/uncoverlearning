# Stop Servers Script
Write-Host "Stopping Backend Server..." -ForegroundColor Yellow

# Find and stop the backend server (uvicorn)
Get-Process | Where-Object { $_.CommandLine -like "*uvicorn*" } | ForEach-Object {
    Write-Host "Stopping backend server (PID: $($_.Id))..." -ForegroundColor Cyan
    Stop-Process -Id $_.Id -Force
}

# Find and stop the frontend server (node)
Get-Process | Where-Object { $_.CommandLine -like "*npm start*" } | ForEach-Object {
    Write-Host "Stopping frontend server (PID: $($_.Id))..." -ForegroundColor Cyan
    Stop-Process -Id $_.Id -Force
}

Write-Host "`nAll servers stopped!" -ForegroundColor Green 