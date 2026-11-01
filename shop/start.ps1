# Mini Shop one-click launcher
# - starts MySQL if 3306 is not listening
# - injects DB password into the process environment only (never written to disk)
# - starts backend on port 3003 in a separate window

param([string]$Password)

$root = $PSScriptRoot
$backend = Join-Path $root "backend"
$envFile = Join-Path $backend ".env"
$mysqlBin = "C:\Program Files\MySQL\MySQL Server 8.4\bin"

Write-Host "=== Mini Shop launcher ===" -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js not found. Install it first: https://nodejs.org" -ForegroundColor Red
  exit 1
}

$listening = Get-NetTCPConnection -State Listen -LocalPort 3306 -ErrorAction SilentlyContinue
if (-not $listening) {
  $mysqld = Join-Path $mysqlBin "mysqld.exe"
  if (Test-Path $mysqld) {
    Write-Host "MySQL is not running, starting mysqld..." -ForegroundColor Yellow
    $cmdLine = "`"$mysqld`" --datadir=`"C:\ProgramData\MySQL\MySQL Server 8.4\Data`" --console"
    Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $cmdLine } | Out-Null
    Start-Sleep -Seconds 8
  } else {
    Write-Host "mysqld not found at $mysqld - start MySQL manually." -ForegroundColor Red
  }
}

$frontend = Join-Path $root "frontend"
if (-not (Test-Path (Join-Path $backend "node_modules"))) {
  Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
  npm --prefix $backend install
}
if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
  Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
  npm --prefix $frontend install
}
# Vite 8 needs node_modules/.vite to exist before dep optimization
New-Item -ItemType Directory -Force -Path (Join-Path $frontend "node_modules\.vite") | Out-Null

if (-not $env:DB_PASSWORD -and $Password) { $env:DB_PASSWORD = $Password }
if (-not $env:DB_PASSWORD) {
  $line = (Get-Content $envFile | Where-Object { $_ -like "DB_PASSWORD=*" })
  if ($line -and ($line -like "*<*")) {
    Write-Host "DB_PASSWORD in backend\.env is still a placeholder." -ForegroundColor Yellow
  }
  $secure = Read-Host "Enter MySQL password (hidden, not saved)" -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { $env:DB_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}

Write-Host "Starting backend on http://127.0.0.1:3003 ..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" `
  -ArgumentList "-NoProfile", "-Command", "`$Host.UI.RawUI.WindowTitle='mini-shop backend'; cd '$backend'; npm run dev" `
  -WorkingDirectory $backend

Write-Host "Starting frontend on http://localhost:5175 ..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" `
  -ArgumentList "-NoProfile", "-Command", "`$Host.UI.RawUI.WindowTitle='mini-shop frontend'; cd '$frontend'; npx vite --port 5175 --strictPort --configLoader native" `
  -WorkingDirectory $frontend

Start-Sleep -Seconds 8
try {
  $h = Invoke-RestMethod "http://127.0.0.1:3003/api/health" -TimeoutSec 10
  Write-Host "Backend OK: $($h.msg) (db=$($h.data.db))" -ForegroundColor Green
} catch {
  Write-Host "Backend not responding yet, check the backend window for errors." -ForegroundColor Yellow
}
try {
  $v = Invoke-WebRequest "http://localhost:5175" -UseBasicParsing -TimeoutSec 10
  Write-Host "Frontend OK: $($v.StatusCode) -> http://localhost:5175" -ForegroundColor Green
} catch {
  Write-Host "Frontend not responding yet, check the frontend window for errors." -ForegroundColor Yellow
}
