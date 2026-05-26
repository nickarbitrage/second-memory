# MeetMind AI - Local Development Launcher
# Run: .\start.ps1  (or double-click start.bat)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  MeetMind AI - Starting" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# --- Kill old processes on 8000 and 3000 ---
Write-Host "[Cleanup] Killing old servers..." -ForegroundColor DarkGray
$ports = @(":8000 ", ":3000 ")
foreach ($port in $ports) {
    netstat -ano | Select-String $port | ForEach-Object {
        $tokens = ($_ -split '\s+')[-1]
        Stop-Process -Id ([int]$tokens) -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep -Seconds 1

# --- Start Backend ---
Write-Host "[1/2] Backend (port 8000)..." -ForegroundColor Yellow
$bp = Start-Process -FilePath ".venv\Scripts\python.exe" `
    -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port 8000" `
    -WorkingDirectory "$root\backend" -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 2

$bOk = $false
for ($i = 0; $i -lt 20; $i++) {
    try { $r = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -UseBasicParsing -TimeoutSec 2
        if ($r.StatusCode -eq 200) { $bOk = $true; break } } catch {}
    Start-Sleep -Seconds 1
}
if ($bOk) { Write-Host "  -> OK (PID $($bp.Id))" -ForegroundColor Green }
else { Write-Host "  -> FAILED" -ForegroundColor Red; exit 1 }

# --- Start Frontend ---
Write-Host "[2/2] Frontend (port 3000)..." -ForegroundColor Yellow
$nodeDir = "C:\tools\nodejs\node-v20.12.2-win-x64\node.exe"
$fp = Start-Process -FilePath $nodeDir `
    -ArgumentList "node_modules\next\dist\bin\next dev" `
    -WorkingDirectory "$root\frontend" -WindowStyle Hidden -PassThru

$fOk = $false
for ($i = 0; $i -lt 40; $i++) {
    $listening = netstat -ano | Select-String ":3000 .* LISTENING"
    if ($listening) { $fOk = $true; break }
    Start-Sleep -Seconds 1
    if ($i % 10 -eq 9) { Write-Host "  Waiting... ($($i+1)s)" -ForegroundColor Gray }
}
if ($fOk) { Write-Host "  -> OK (PID $($fp.Id))" -ForegroundColor Green }
else { Write-Host "  -> TIMEOUT - check manually" -ForegroundColor Yellow }

# --- Done ---
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  MeetMind AI is RUNNING" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "  API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "  Demo Account: demo@meetmind.ai / demo1234" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Press any key to stop all servers..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "`nStopping servers..." -ForegroundColor Yellow
Stop-Process -Id $bp.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $fp.Id -Force -ErrorAction SilentlyContinue
Write-Host "Stopped." -ForegroundColor Green
