# Makefile cho API Gemini Docker Management
# Sử dụng: make [target]

.PHONY: help build start stop restart logs status health rebuild clean shell test

# Default target
help:
	@echo "╔══════════════════════════════════════════════════════════╗"
	@echo "║         API Gemini - Docker Management                  ║"
	@echo "╚══════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "Available targets:"
	@echo "  make build      - Build Docker image"
	@echo "  make start      - Start container"
	@echo "  make stop       - Stop container"
	@echo "  make restart    - Restart container"
	@echo "  make logs       - View logs (real-time)"
	@echo "  make status     - Check container status"
	@echo "  make health     - Check health endpoint"
	@echo "  make rebuild    - Rebuild image (no cache)"
	@echo "  make clean      - Stop and remove containers"
	@echo "  make shell      - Enter container shell"
	@echo "  make test       - Test API endpoints"
	@echo ""

build:
	@echo "🔨 Building Docker image..."
	docker-compose build
	@echo "✅ Build completed!"

start:
	@echo "🚀 Starting container..."
	docker-compose up -d
	@echo "✅ Container started!"
	@sleep 2
	@make status

stop:
	@echo "🛑 Stopping container..."
	docker-compose stop
	@echo "✅ Container stopped!"

restart:
	@echo "🔄 Restarting container..."
	docker-compose restart
	@echo "✅ Container restarted!"

logs:
	@echo "📋 Showing logs (Ctrl+C to exit)..."
	docker-compose logs -f api_gemini

status:
	@echo "📊 Container Status:"
	docker-compose ps
	@docker stats api_gemini --no-stream

health:
	@echo "🏥 Testing health endpoint..."
	@curl -s http://localhost:5001/health | python -m json.tool || echo "❌ Health check failed"

rebuild:
	@echo "🔨 Rebuilding image (no cache)..."
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d
	@echo "✅ Rebuild completed!"

clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker-compose down -v
	@echo "✅ Cleanup completed!"

shell:
	@echo "🐚 Entering container shell..."
	docker-compose exec api_gemini bash

test:
	@echo "🧪 Testing API endpoints..."
	@echo "\n1️⃣ Testing /health..."
	@curl -s http://localhost:5001/health | python -m json.tool
	@echo "\n2️⃣ Testing /ai_chatbot..."
	@curl -s -X POST http://localhost:5001/ai_chatbot \
		-H "Content-Type: application/json" \
		-d '{"history":[{"role":"user","text":"Hello"}]}' | python -m json.tool
	@echo "\n✅ Tests completed!"
