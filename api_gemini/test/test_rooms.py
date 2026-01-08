import requests
import json

BASE_URL = "http://localhost:5000"

def test_rooms():
    print(f"Testing Get Rooms API...")
    url = f"{BASE_URL}/api/test-rooms"
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Status: {data.get('status')}")
            print(f"Count: {data.get('count')}")
            if data.get('data') and len(data['data']) > 0:
                print("First room sample:")
                print(json.dumps(data['data'][0], indent=2, ensure_ascii=False))
            print("✅ Test Rooms Passed")
        else:
            print("Response:", response.text)
            print("❌ Test Rooms Failed")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_rooms()
