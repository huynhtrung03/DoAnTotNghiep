# Docker Management Script cho API Gemini
# Sử dụng: .\docker-manage.ps1 [command]

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host "
╔══════════════════════════════════════════════════════════╗
║         API Gemini - Docker Management Script           ║
╚══════════════════════════════════════════════════════════╝

Cách sử dụng: .\docker-manage.ps1 [command]

📋 Commands:

  build       - Build Docker image
  start       - Start container
  stop        - Stop container
  restart     - Restart container
  logs        - Xem logs (real-time)
  status      - Kiểm tra status
  health      - Kiểm tra health endpoint
  rebuild     - Rebuild image (no cache) và restart
  clean       - Stop và xóa container + images
  shell       - Exec vào container
  test        - Test các API endpoints

Ví dụ:
  .\docker-manage.ps1 build
  .\docker-manage.ps1 start
  .\docker-manage.ps1 logs
" -ForegroundColor Cyan
}

function Build-Image {
    Write-Host "`n🔨 Building Docker image..." -ForegroundColor Yellow
    docker-compose build
    Write-Host "✅ Build completed!" -ForegroundColor Green
}

function Start-Container {
    Write-Host "`n🚀 Starting container..." -ForegroundColor Yellow
    docker-compose up -d
    Write-Host "✅ Container started!" -ForegroundColor Green
    Start-Sleep -Seconds 2
    Get-Status
}

function Stop-Container {
    Write-Host "`n🛑 Stopping container..." -ForegroundColor Yellow
    docker-compose stop
    Write-Host "✅ Container stopped!" -ForegroundColor Green
}

function Restart-Container {
    Write-Host "`n🔄 Restarting container..." -ForegroundColor Yellow
    docker-compose restart
    Write-Host "✅ Container restarted!" -ForegroundColor Green
    Start-Sleep -Seconds 2
    Get-Status
}

function Show-Logs {
    Write-Host "`n📋 Showing logs (Ctrl+C to exit)..." -ForegroundColor Yellow
    docker-compose logs -f api_gemini
}

function Get-Status {
    Write-Host "`n📊 Container Status:" -ForegroundColor Yellow
    docker-compose ps
    Write-Host ""
    docker stats api_gemini --no-stream
}

function Test-Health {
    Write-Host "`n🏥 Testing health endpoint..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get
        Write-Host "✅ Health Check: HEALTHY" -ForegroundColor Green
        Write-Host "Service: $($response.service)"
        Write-Host "Timestamp: $($response.timestamp)"
    } catch {
        Write-Host "❌ Health Check: FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
    }
}

function Rebuild-Image {
    Write-Host "`n🔨 Rebuilding image (no cache)..." -ForegroundColor Yellow
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    Write-Host "✅ Rebuild completed!" -ForegroundColor Green
    Start-Sleep -Seconds 3
    Get-Status
}

function Clean-Docker {
    Write-Host "`n🧹 Cleaning up Docker resources..." -ForegroundColor Yellow
    docker-compose down -v
    Write-Host "Removing images..."
    docker rmi api_gemini-api_gemini -f
    Write-Host "✅ Cleanup completed!" -ForegroundColor Green
}

function Enter-Shell {
    Write-Host "`n🐚 Entering container shell..." -ForegroundColor Yellow
    docker-compose exec api_gemini bash
}

function Test-APIs {
    Write-Host "`n🧪 Testing API endpoints..." -ForegroundColor Yellow
    
    # Test health
    Write-Host "`n1️⃣ Testing /health endpoint..." -ForegroundColor Cyan
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get
        Write-Host "✅ Health: $($health.status)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test chatbot
    Write-Host "`n2️⃣ Testing /ai_chatbot endpoint..." -ForegroundColor Cyan
    try {
        $body = @{
            history = @(
                @{
                    role = "user"
                    text = "Hello"
                }
            )
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:5000/ai_chatbot" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 30
        Write-Host "✅ Chatbot response received!" -ForegroundColor Green
        Write-Host "Reply preview: $($response.reply.Substring(0, [Math]::Min(100, $response.reply.Length)))..."
    } catch {
        Write-Host "❌ Chatbot test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "`n✅ API tests completed!" -ForegroundColor Green
}

# Main script logic
switch ($Command.ToLower()) {
    "build" { Build-Image }
    "start" { Start-Container }
    "stop" { Stop-Container }
    "restart" { Restart-Container }
    "logs" { Show-Logs }
    "status" { Get-Status }
    "health" { Test-Health }
    "rebuild" { Rebuild-Image }
    "clean" { Clean-Docker }
    "shell" { Enter-Shell }
    "test" { Test-APIs }
    "help" { Show-Help }
    default {
        Write-Host "❌ Unknown command: $Command" -ForegroundColor Red
        Show-Help
    }
}
