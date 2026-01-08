"""
Test Script cho API So Sánh Phòng Cá Nhân Hóa
"""
import requests
import json
import time

# API endpoint
BASE_URL = "http://localhost:5001/api"

# Test data
test_payload = {
    "rooms": [
        {
            "id": "room_1",
            "name": "Cho thuê phòng trọ giá rẻ khu vực ngay chợ Non Nước",
            "price": 1800000,
            "address": "K35/3 Đường Nam Thành, Phường Hoà Hải, Quận Ngũ Hành Sơn",
            "area": 20,
            "amenities": ["mezzanine", "kitchen_shelf", "security_24h", "garage"],
            "description": "Cho thuê nhà ngay chợ Non Nước, gần nhiều trường đại học cao đẳng cho các bạn sinh viên như Đại học công nghệ thông tin và truyền thông Việt - Hàn, Trường ĐH FPT Đà Nẵng. Có lối để xe rộng rãi. An ninh tốt. Phòng ở thoáng mát sạch sẽ có wifi free."
        },
        {
            "id": "room_2",
            "name": "Cho thuê phòng trọ, có 2 phòng liền kề, trung tâm thành phố, gần chợ và trường học",
            "price": 2000000,
            "address": "Đường Thanh Sơn, Phường Hoà Hải, Quận Ngũ Hành Sơn",
            "area": 22.5,
            "amenities": ["furnished", "washing_machine", "mezzanine", "private_entry", "garage"],
            "description": "Cho thuê phòng trọ, có 2 phòng liền kề, trung tâm thành phố. Hướng Tây. Gần trường đại học Sư Phạm Công Nghệ, chợ Đống Đa. DT 30m2. Giá cho thuê: 2 triệu/tháng."
        }
    ],
    "user_context": {
        "preference": "Best value for money",
        "user_location": {
            "latitude": 15.9743855,
            "longitude": 108.2514503
        },
        "user_profile": {
            "favoriteBasedProfile": {
                "avgPrice": 3500000,
                "avgArea": 20,
                "avgLen": 4,
                "avgWid": 5,
                "avgCapacity": 2,
                "favConvenientIds": [
                    "furnished",
                    "washing_machine",
                    "no_curfew",
                    "mezzanine",
                    "fridge",
                    "kitchen_shelf",
                    "aircon"
                ]
            },
            "viewHistoryBasedProfile": {
                "avgPrice": 1500000,
                "avgArea": 22.5,
                "avgLen": 4.5,
                "avgWid": 5,
                "avgCapacity": 2,
                "favConvenientIds": [
                    "furnished",
                    "washing_machine",
                    "no_curfew",
                    "mezzanine",
                    "fridge",
                    "kitchen_shelf",
                    "aircon",
                    "private_entry"
                ]
            }
        }
    }
}


def test_health_check():
    """Test health check endpoint"""
    print("\n" + "="*60)
    print("🏥 Testing Health Check Endpoint")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_personalized_comparison():
    """Test personalized room comparison endpoint"""
    print("\n" + "="*60)
    print("🏠 Testing Personalized Room Comparison")
    print("="*60)
    
    try:
        start_time = time.time()
        
        response = requests.post(
            f"{BASE_URL}/ai_compare_rooms_personalized",
            json=test_payload,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        
        elapsed = time.time() - start_time
        
        print(f"⏱️  Request Time: {elapsed:.2f}s")
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            print("\n" + "-"*60)
            print("✅ SUCCESS - Response Structure:")
            print("-"*60)
            
            if data.get("success"):
                result = data.get("data", {})
                
                # Print key sections
                print(f"\n👋 Greeting:")
                print(f"   {result.get('greeting', 'N/A')}")
                
                print(f"\n📝 User Profile Summary:")
                print(f"   {result.get('user_profile_summary', 'N/A')}")
                
                print(f"\n🏠 Room Analysis:")
                room_analysis = result.get('room_analysis', {})
                for room_key in ['room_1', 'room_2']:
                    if room_key in room_analysis:
                        room = room_analysis[room_key]
                        print(f"\n   {room_key.upper()}:")
                        print(f"   - Match Score: {room.get('match_score', 'N/A')}/10")
                        print(f"   - Why Fits: {room.get('why_it_fits', 'N/A')[:100]}...")
                        print(f"   - Total Cost: {room.get('real_monthly_cost', {}).get('total', 'N/A'):,} VNĐ")
                
                print(f"\n💡 My Recommendation:")
                rec = result.get('my_recommendation', {})
                print(f"   - Chosen Room: {rec.get('chosen_room', 'N/A')}")
                print(f"   - Confidence: {rec.get('confidence_level', 'N/A')}")
                print(f"   - Honest Advice: {rec.get('honest_advice', 'N/A')[:150]}...")
                
                print(f"\n💬 Closing Note:")
                print(f"   {result.get('closing_note', 'N/A')}")
                
                # Check for warnings
                if data.get("warning"):
                    print(f"\n⚠️  Warning: {data.get('warning')}")
                
                # Meta info
                meta = data.get('meta', {})
                print(f"\n📈 Meta:")
                print(f"   - Processing Time: {meta.get('processing_time_ms', 'N/A')}ms")
                print(f"   - AI Model: {meta.get('ai_model', 'N/A')}")
                print(f"   - Personalized: {meta.get('personalized', False)}")
                
                # Save full response
                with open('test_response.json', 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                print(f"\n💾 Full response saved to: test_response.json")
                
                return True
            else:
                print(f"❌ API returned success=false")
                print(f"Error: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text[:500]}")
            return False
            
    except requests.Timeout:
        print(f"❌ Request timeout (>60s)")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def compare_with_basic():
    """So sánh kết quả giữa API cá nhân hóa và basic (nếu có)"""
    print("\n" + "="*60)
    print("🔄 Comparing Personalized vs Basic (if available)")
    print("="*60)
    
    # Test basic API nếu có
    try:
        response = requests.post(
            f"{BASE_URL}/ai_compare_rooms",
            json=test_payload,
            timeout=30
        )
        
        if response.status_code == 200:
            print("✅ Basic API also working")
            print("📊 You can compare outputs between:")
            print("   - /ai_compare_rooms (basic)")
            print("   - /ai_compare_rooms_personalized (new)")
        else:
            print("ℹ️  Basic API not available or different endpoint")
    except:
        print("ℹ️  Basic API endpoint not found - OK")


def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("🚀 GEMINI PERSONALIZED API TEST SUITE")
    print("="*80)
    print(f"📍 Base URL: {BASE_URL}")
    print(f"⏰ Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test 1: Health Check
    health_ok = test_health_check()
    
    if not health_ok:
        print("\n❌ Health check failed - API may not be running")
        print("💡 Make sure to run: python api_gemini_personalized.py")
        return
    
    # Test 2: Personalized Comparison
    comparison_ok = test_personalized_comparison()
    
    # Test 3: Compare with basic (optional)
    compare_with_basic()
    
    # Summary
    print("\n" + "="*80)
    print("📊 TEST SUMMARY")
    print("="*80)
    print(f"✅ Health Check: {'PASS' if health_ok else 'FAIL'}")
    print(f"✅ Personalized Comparison: {'PASS' if comparison_ok else 'FAIL'}")
    
    if health_ok and comparison_ok:
        print("\n🎉 All tests passed! API is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check logs above for details.")
    
    print("="*80 + "\n")


if __name__ == "__main__":
    main()