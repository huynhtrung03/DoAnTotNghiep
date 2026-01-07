import requests
import json

BASE_URL = "http://localhost:5000"

def test_approval():
    print(f"Testing AI Approval API...")
    url = f"{BASE_URL}/ai_approval"
    
    # Mock data
    room_data = {
        "id": "test_room_01",
        "title": "Phòng trọ cao cấp full nội thất",
        "description": "Phòng đẹp, thoáng mát, có ban công, đầy đủ tiện nghi: máy lạnh, tủ lạnh, máy giặt...",
        "priceMonth": 4500000,
        "fullAddress": "123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM",
        "convenients": ["Wifi", "Máy lạnh", "Chỗ để xe", "An ninh"],
        "images": [
            "https://decocor.vn/wp-content/uploads/2023/05/phong-tro-gac-lung-dep-lung-linh.jpg",
            "https://cdn.pgs-hcm.com/attachments/10-kieu-trang-tri-phong-tro-sieu-dep-sieu-tiet-kiem-chi-phi-1-jpg.9172/"
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
