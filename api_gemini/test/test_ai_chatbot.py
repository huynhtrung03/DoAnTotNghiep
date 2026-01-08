import requests
import json

BASE_URL = "http://localhost:5001"

def test_chatbot():
    print(f"Testing AI Chatbot API...")
    url = f"{BASE_URL}/ai_chatbot"
    
    payload = {
        "history": [],
        "message": "Chào bạn, tôi đang tìm phòng trọ giá khoảng 3 triệu ở quận 1"
    }
    
    try:
        print("Sending message:", payload["message"])
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("Response:")
            print(data.get("reply"))
            print("✅ Test Chatbot Passed")
        else:
            print("Response:", response.text)
            print("❌ Test Chatbot Failed")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_chatbot()
