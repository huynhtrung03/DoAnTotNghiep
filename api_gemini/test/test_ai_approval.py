import requests
import json

BASE_URL = "http://localhost:5001"

def test_approval():
    print(f"Testing AI Approval API...")
    url = f"{BASE_URL}/ai_approval"
    
    # Mock data - đầy đủ các trường bắt buộc
    room_data = {
        "id": "test_room_01",
        "title": "Phòng trọ cao cấp full nội thất",
        "description": "Phòng đẹp, thoáng mát, có ban công, đầy đủ tiện nghi: máy lạnh, tủ lạnh, máy giặt...",
        "priceMonth": 4500000,
        "priceDeposit": 2000000,
        "area": 25,
        "length": 5,
        "width": 5,
        "maxPeople": 2,
        "elecPrice": 3500,
        "waterPrice": 20000,
        "fullAddress": "123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM",
        "convenients": ["Wifi", "Máy lạnh", "Chỗ để xe", "An ninh"],
        "images": [
            "/image/upload/v1234567890/sample_room_1.jpg",
            "/image/upload/v1234567891/sample_room_2.jpg"
        ]
    }
    
    try:
        print(f"Sending room data: {room_data['title']}")
        response = requests.post(url, json=room_data)
        print(f"Status Code: {response.status_code}")
        
        print("Response:")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        
        if response.status_code == 200:
            print("✅ Test Approval Passed")
        else:
            print("❌ Test Approval Failed")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_approval()
