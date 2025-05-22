# Start Servers Script
Write-Host "Starting Frontend Server..." -ForegroundColor Green

# Start Frontend Server
$frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\tajom\Downloads\MVP_Cursortest\frontend'; npm start" -PassThru

Write-Host "`nFrontend server started!" -ForegroundColor Green
Write-Host "Frontend running on: http://localhost:3000" -ForegroundColor Cyan 