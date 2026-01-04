from dotenv import load_dotenv
import os

# Load .env
load_dotenv()

# Kiểm tra các biến
print("=== Checking Environment Variables ===")
print(f"API_KEY exists: {os.getenv('API_KEY') is not None}")
print(f"DB_HOST: {os.getenv('DB_HOST')}")
print(f"DB_PORT: {os.getenv('DB_PORT')}")
print(f"DB_NAME: {os.getenv('DB_NAME')}")
print(f"DB_USER: {os.getenv('DB_USER')}")
print(f"DB_PASSWORD exists: {os.getenv('DB_PASSWORD') is not None}")
