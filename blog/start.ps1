# 个人博客系统 一键启动脚本（PowerShell）
# 目录：D:\portfolio\blog
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root 'blog-backend'
$frontend = Join-Path $root 'blog-frontend'

Write-Host '==========================================' -ForegroundColor Cyan
Write-Host '  个人博客系统 一键启动' -ForegroundColor Cyan
Write-Host '  后端  http://127.0.0.1:3001' -ForegroundColor Cyan
Write-Host '  前端  http://localhost:5173' -ForegroundColor Cyan
Write-Host '==========================================' -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host '[错误] 未检测到 Node.js，请先安装后重试' -ForegroundColor Red
    exit 1
}

# 检查后端 .env 是否仍是占位密码
$envFile = Join-Path $backend '.env'
if (-not (Test-Path $envFile)) {
    Write-Host '[提示] 缺少 blog-backend\.env，请按 README 创建并填写数据库密码。' -ForegroundColor Yellow
} elseif ((Get-Content $envFile -Raw) -match '你的mysql密码') {
    Write-Host '[提示] blog-backend\.env 的 DB_PASSWORD 仍是占位符，请改成你的 MySQL 密码。' -ForegroundColor Yellow
}

function Start-Service-Window {
    param($Name, $Dir)
    if (-not (Test-Path (Join-Path $Dir 'node_modules'))) {
        Write-Host "[$Name] 首次运行，安装依赖..." -ForegroundColor Yellow
        Push-Location $Dir
        npm install
        Pop-Location
    }
    Write-Host "[$Name] 启动中..." -ForegroundColor Green
    Start-Process -FilePath 'cmd.exe' -ArgumentList '/k', 'npm run dev' -WorkingDirectory $Dir
}

Start-Service-Window -Name '后端' -Dir $backend
Start-Service-Window -Name '前端' -Dir $frontend

Write-Host ''
Write-Host '已在新窗口启动，关闭对应窗口即可停止服务。' -ForegroundColor Gray
Write-Host '若后端报 ECONNREFUSED 3306：请确认 MySQL 已启动，并已执行 blog-backend\sql\init.sql' -ForegroundColor Gray
