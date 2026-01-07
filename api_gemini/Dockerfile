# Base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies nếu cần
RUN apt-get update && apt-get install -y \
    --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt trước để tận dụng Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ source code
COPY . .

# Create images directory
RUN mkdir -p api_gemini/images

# Expose port Flask
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5001/health')" || exit 1

# Run with Gunicorn (Production WSGI server)
# --bind 0.0.0.0:5001 → Bind to all interfaces
# --workers 2 → Number of worker processes (CPU cores x 2)
# --timeout 120 → Worker timeout (120s for long-running AI requests)
# --access-logfile - → Log to stdout
# --error-logfile - → Error log to stdout
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "2", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-", "core.main:create_app()"]