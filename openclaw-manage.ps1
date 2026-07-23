# OpenClaw Management Script
# =========================

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "restart", "status", "logs", "config", "help")]
    [string]$Action = "help"
)

$OpenClawDir = "$env:USERPROFILE\.openclaw"

switch ($Action) {
    "start" {
        Write-Host "Starting OpenClaw..." -ForegroundColor Green
        pm2 start "$OpenClawDir\ecosystem.config.js"
        pm2 save
        Write-Host "OpenClaw started!" -ForegroundColor Green
    }
    "stop" {
        Write-Host "Stopping OpenClaw..." -ForegroundColor Yellow
        pm2 stop openclaw
        Write-Host "OpenClaw stopped!" -ForegroundColor Yellow
    }
    "restart" {
        Write-Host "Restarting OpenClaw..." -ForegroundColor Cyan
        pm2 restart openclaw
        Write-Host "OpenClaw restarted!" -ForegroundColor Cyan
    }
    "status" {
        pm2 status
    }
    "logs" {
        pm2 logs openclaw --lines 50
    }
    "config" {
        Write-Host "Opening configuration..." -ForegroundColor Magenta
        Start-Process notepad "$OpenClawDir\config.json"
    }
    "help" {
        Write-Host @"

OpenClaw Management Script
==========================

Usage: .\openclaw-manage.ps1 [action]

Actions:
  start    - Start OpenClaw service
  stop     - Stop OpenClaw service
  restart  - Restart OpenClaw service
  status   - Show service status
  logs     - Show recent logs
  config   - Open configuration file
  help     - Show this help message

"@ -ForegroundColor White
    }
}
