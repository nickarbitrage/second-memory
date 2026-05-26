# Starts both servers in background, writes PIDs to file
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Kill any existing on port 8000
netstat -ano | Select-String ":8000 " | ForEach-Object {
    $tokens = $_ -split '\s+'
    $p = $tokens[-1]
    Get-Process -Id $p -ErrorAction SilentlyContinue | Stop-Process -Force
}
Start-Sleep -Seconds 2

# Start backend
$bp = Start-Process -FilePath ".venv\Scripts\python.exe" `
    -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port 8000" `
    -WorkingDirectory "$rootDir\backend" -WindowStyle Hidden -PassThru

# Start frontend
$fp = Start-Process -FilePath "node.exe" `
    -ArgumentList "node_modules\.bin\next dev" `
    -WorkingDirectory "$rootDir\frontend" -WindowStyle Hidden -PassThru

# Save PIDs
$bp.Id | Out-File "$rootDir\backend.pid"
$fp.Id | Out-File "$rootDir\frontend.pid"

Write-Host "Backend PID: $($bp.Id)"
Write-Host "Frontend PID: $($fp.Id)"
Write-Host "To stop: Get-Content backend.pid,frontend.pid | ForEach-Object { Stop-Process -Id $_ -Force }"
