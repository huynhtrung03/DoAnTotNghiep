import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_health():
    print(f"Testing Health Check API...")
    url = f"{BASE_URL}/api/health"
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        print("Response:")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        
        if response.status_code == 200:
            print("✅ Health Check Test Passed")
        else:
            print("❌ Health Check Test Failed")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_health()
