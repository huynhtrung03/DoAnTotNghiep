import requests
import json

BASE_URL = "http://localhost:5000"

def test_compare_rooms():
    print("Testing AI Compare Rooms API...")
    url = f"{BASE_URL}/ai_compare_rooms"
    
    # Mock data - 2 phòng để so sánh
    payload = {
        "rooms": [
            {
                "room_id": "ROOM001",
                "room_name": "Phòng trọ Quận 1 - Tiện nghi cơ bản",
                "priceMonth": 3500000,
                "area": 20,
                "convenients": ["Wifi", "Điều hòa", "WC riêng"],
                "fullAddress": "123 Nguyễn Huệ, Quận 1, TP.HCM"
            },
            {
                "room_id": "ROOM002", 
                "room_name": "Phòng trọ Quận 3 - Full nội thất",
                "priceMonth": 4500000,
                "area": 25,
                "convenients": ["Wifi", "Điều hòa", "WC riêng", "Tủ lạnh", "Máy giặt", "Bếp"],
                "fullAddress": "456 Võ Văn Tần, Quận 3, TP.HCM"
            }
        ],
        "favorites": [
            {
                "room_id": "PAST001",
                "room_name": "Phòng cũ yêu thích",
                "price_per_night": 3000000,
                "amenities": ["Wifi", "Điều hòa"],
                "what_user_liked": "Giá rẻ, gần trung tâm"
            }
        ],
        "user_context": {
            "budget_range": {
                "min": 3000000,
                "max": 5000000
            },
            "trip_purpose": "leisure",
            "special_requirements": ["Cần wifi tốt để làm việc"]
        }
    }
    
    try:
        print(f"Comparing: {payload['rooms'][0]['room_name']} vs {payload['rooms'][1]['room_name']}")
        response = requests.post(url, json=payload, timeout=120)
        print(f"Status Code: {response.status_code}")
        
        result = response.json()
        
        if result.get("success"):
            print("\n✅ Comparison Successful!")
            data = result.get("data", {})
            
            # Print summary
            summary = data.get("comparison_summary", {})
            print(f"\n📊 Summary:")
            print(f"   Winner: {summary.get('winner')}")
            print(f"   Confidence: {summary.get('confidence_score')}%")
            print(f"   Key Reason: {summary.get('key_reason')}")
            
            # Print recommendation
            rec = data.get("recommendation", {})
            print(f"\n🎯 Recommendation:")
            print(f"   Room: {rec.get('recommended_room')}")
            if rec.get("reasons"):
                print(f"   Reasons:")
                for r in rec.get("reasons", [])[:3]:
                    print(f"      - {r}")
                    
            # Print meta
            meta = result.get("meta", {})
            print(f"\n⏱️ Processing time: {meta.get('processing_time_ms', 'N/A')}ms")
            print(f"   Model: {meta.get('ai_model', 'fallback')}")
            
            if result.get("warning"):
                print(f"\n⚠️ Warning: {result.get('warning')}")
                
        else:
            print(f"\n❌ Comparison Failed: {result.get('error')}")
            
        # Print full response for debugging
        print("\n--- Full Response ---")
        print(json.dumps(result, indent=2, ensure_ascii=False)[:2000])
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_compare_rooms()
