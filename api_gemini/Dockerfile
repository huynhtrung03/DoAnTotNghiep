FROM python:3.11-slim

WORKDIR /app

# Copy code và requirements
COPY . /app
# KHÔNG copy .env vào image (bảo mật)
# .env sẽ được inject qua docker-compose

# Cài đặt các package cần thiết
RUN pip install --upgrade pip && \
    pip install flask flask-cors requests python-dotenv mysql-connector-python

# Expose port Flask
EXPOSE 5000

# Chạy Flask app
CMD ["python", "api_gemini.py"]