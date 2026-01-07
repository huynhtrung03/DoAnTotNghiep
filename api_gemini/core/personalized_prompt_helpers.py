"""
Helper functions để xây dựng prompt cá nhân hóa cho so sánh phòng trọ
"""
import json
import logging
import os

def build_personalized_prompt(prompt_config, rooms, user_context):
    """
    Xây dựng prompt cá nhân hóa bằng cách load template JSON và điền giá trị
    Sử dụng template từ personalizedroomcomparisonprompt.json
    
    Args:
        prompt_config: Config từ JSON file (có thể dùng hoặc load lại)
        rooms: List 2 phòng cần so sánh
        user_context: Thông tin về người dùng
    
    Returns:
        str: Prompt JSON đã được điền giá trị
    """
    try:
        # Load template từ file personalizedroomcomparisonprompt.json
        current_dir = os.path.dirname(os.path.abspath(__file__))
        app_dir = os.path.dirname(current_dir)
        template_path = os.path.join(app_dir, "promt", "personalizedroomcomparisonprompt.json")
        
        with open(template_path, 'r', encoding='utf-8') as f:
            template = json.load(f)
        
        room1, room2 = rooms[0], rooms[1]
        
        # Extract user context
        preference = user_context.get("preference", "Best value for money")
        user_profile = user_context.get("user_profile", {})
        user_location = user_context.get("user_location", {})
        
        # Xây dựng prompt JSON với cấu trúc đầy đủ
        prompt_json = {
            "task": template.get("task", "personalized_room_recommendation"),
            "role": template.get("role", ""),
            "instruction": template.get("instruction", ""),
            
            "input_structure": {
                # Dữ liệu phòng thực tế
                "rooms_to_compare": [
                    {
                        "room_id": room1.get("id", "room_1"),
                        "name": room1.get("name", room1.get("title", "Phòng 1")),
                        "price": room1.get("price", room1.get("priceMonth", 0)),
                        "address": room1.get("address", room1.get("fullAddress", "")),
                        "area": room1.get("area", 0),
                        "amenities": room1.get("amenities", room1.get("convenients", [])),
                        "description": room1.get("description", "")[:500]
                    },
                    {
                        "room_id": room2.get("id", "room_2"),
                        "name": room2.get("name", room2.get("title", "Phòng 2")),
                        "price": room2.get("price", room2.get("priceMonth", 0)),
                        "address": room2.get("address", room2.get("fullAddress", "")),
                        "area": room2.get("area", 0),
                        "amenities": room2.get("amenities", room2.get("convenients", [])),
                        "description": room2.get("description", "")[:500]
                    }
                ],
                
                # Thông tin người dùng thực tế
                "user_context": {
                    "primary_preference": preference,
                    "user_location": user_location,
                    "behavioral_insights": {
                        "favorite_rooms_pattern": user_profile.get("favoriteBasedProfile", {}),
                        "browsing_history_pattern": user_profile.get("viewHistoryBasedProfile", {})
                    }
                }
            },
            
            # Output format từ template (giữ nguyên)
            "required_output_format": template.get("output_format", {}),
            
            # Guidelines từ template (giữ nguyên)
            "critical_guidelines": template.get("critical_guidelines", [])
        }
        
        # Convert to JSON string
        prompt = json.dumps(prompt_json, indent=2, ensure_ascii=False)
        
        return prompt
        
    except Exception as e:
        logging.error(f"Lỗi khi build personalized prompt: {e}")
        return None


def format_amenities(amenities):
    """
    Format danh sách tiện nghi thành string dễ đọc
    
    Args:
        amenities: List hoặc string comma-separated
    
    Returns:
        str: Danh sách tiện nghi được format
    """
    if isinstance(amenities, str):
        amenities = [a.strip() for a in amenities.split(',') if a.strip()]
    
    if not amenities or len(amenities) == 0:
        return "Không có thông tin về tiện nghi"
    
    # Map amenity IDs to Vietnamese names
    amenity_map = {
        "furnished": "Sẵn nội thất",
        "washing_machine": "Máy giặt",
        "no_curfew": "Không giờ giấc",
        "mezzanine": "Gác lửng",
        "fridge": "Tủ lạnh",
        "kitchen_shelf": "Kệ bếp",
        "aircon": "Điều hòa",
        "private_entry": "Lối đi riêng",
        "garage": "Chỗ để xe",
        "security_24h": "Bảo vệ 24/7",
        "wifi_free": "Wifi miễn phí"
    }
    
    formatted = []
    for amenity in amenities:
        amenity_clean = amenity.strip()
        formatted.append(amenity_map.get(amenity_clean, amenity_clean))
    
    return ", ".join(formatted)


def build_favorite_insights(favorite_profile):
    """
    Xây dựng insights từ favorite pattern
    
    Args:
        favorite_profile: Dict chứa thông tin favorite pattern
    
    Returns:
        str: Insights được format
    """
    if not favorite_profile:
        return "Chưa có dữ liệu về phòng yêu thích"
    
    avg_price = favorite_profile.get("avgPrice", favorite_profile.get("average_budget", 0))
    avg_area = favorite_profile.get("avgArea", favorite_profile.get("preferred_area", 0))
    amenities = favorite_profile.get("favConvenientIds", favorite_profile.get("must_have_amenities", []))
    
    insights = f"""- Ngân sách lý tưởng: {avg_price:,} VNĐ/tháng
- Diện tích ưa thích: {avg_area} m²
- Tiện nghi must-have: {format_amenities(amenities)}
- Insight: Người dùng có xu hướng yêu thích các phòng đầy đủ tiện nghi với ngân sách cao hơn, cho thấy họ sẵn sàng trả nhiều hơn cho sự tiện lợi"""
    
    return insights


def build_history_insights(history_profile):
    """
    Xây dựng insights từ view history pattern
    
    Args:
        history_profile: Dict chứa thông tin view history pattern
    
    Returns:
        str: Insights được format
    """
    if not history_profile:
        return "Chưa có dữ liệu về lịch sử xem"
    
    avg_price = history_profile.get("avgPrice", history_profile.get("realistic_budget", 0))
    avg_area = history_profile.get("avgArea", history_profile.get("preferred_area", 0))
    amenities = history_profile.get("favConvenientIds", history_profile.get("frequently_viewed_amenities", []))
    
    insights = f"""- Ngân sách thực tế đang tìm: {avg_price:,} VNĐ/tháng
- Diện tích thường xem: {avg_area} m²
- Tiện nghi thường xem: {format_amenities(amenities)}
- Insight: Người dùng thực tế đang tìm kiếm trong mức giá thấp hơn nhiều so với phòng yêu thích, nhưng vẫn ưu tiên các tiện nghi cơ bản"""
    
    return insights


def build_key_observations(user_profile):
    """
    Xây dựng key observations từ cả 2 patterns
    
    Args:
        user_profile: Dict chứa cả favorite và history patterns
    
    Returns:
        str: Key observations được format
    """
    favorite = user_profile.get("favoriteBasedProfile", user_profile.get("favorite_rooms_pattern", {}))
    history = user_profile.get("viewHistoryBasedProfile", user_profile.get("browsing_history_pattern", {}))
    
    observations = []
    
    # Compare budgets
    fav_price = favorite.get("avgPrice", favorite.get("average_budget", 0))
    hist_price = history.get("avgPrice", history.get("realistic_budget", 0))
    
    if fav_price and hist_price and fav_price > hist_price:
        diff = fav_price - hist_price
        observations.append(f"✓ Có sự khác biệt lớn giữa ngân sách lý tưởng ({fav_price:,} VNĐ) và ngân sách thực tế đang xem ({hist_price:,} VNĐ) - chênh lệch {diff:,} VNĐ")
    
    # Common amenities
    fav_amenities = set(favorite.get("favConvenientIds", favorite.get("must_have_amenities", [])))
    hist_amenities = set(history.get("favConvenientIds", history.get("frequently_viewed_amenities", [])))
    
    common = fav_amenities & hist_amenities
    if common:
        observations.append(f"✓ Tiện nghi xuất hiện trong CẢ 2 pattern (must-have): {format_amenities(list(common))}")
    
    # Private entry
    if "private_entry" in hist_amenities:
        observations.append("✓ Người dùng quan tâm đến 'Lối đi riêng' - có thể coi trọng sự riêng tư")
    
    # Area comparison
    fav_area = favorite.get("avgArea", favorite.get("preferred_area", 0))
    hist_area = history.get("avgArea", history.get("preferred_area", 0))
    
    if hist_area > fav_area:
        observations.append(f"✓ Diện tích trung bình người dùng xem ({hist_area} m²) lớn hơn diện tích yêu thích ({fav_area} m²) - có thể muốn không gian rộng rãi hơn")
    
    if not observations:
        observations.append("✓ Người dùng có xu hướng ổn định trong việc tìm kiếm phòng trọ")
    
    return "\n".join(observations)


def validate_personalized_response(response):
    """
    Validate response có đủ các trường cần thiết của format cá nhân hóa
    
    Args:
        response: Dict response từ AI
    
    Returns:
        tuple: (is_valid, missing_fields)
    """
    required_fields = [
        "greeting",
        "user_profile_summary",
        "room_analysis",
        "financial_comparison",
        "my_recommendation",
        "when_to_choose_alternative",
        "closing_note"
    ]
    
    missing = []
    for field in required_fields:
        if field not in response:
            missing.append(field)
    
    # Validate room_analysis structure
    if "room_analysis" in response:
        room_analysis = response["room_analysis"]
        for room_key in ["room_1", "room_2"]:
            if room_key not in room_analysis:
                missing.append(f"room_analysis.{room_key}")
            else:
                room = room_analysis[room_key]
                required_room_fields = ["match_score", "why_it_fits", "why_it_doesnt", "real_monthly_cost", "personal_note"]
                for field in required_room_fields:
                    if field not in room:
                        missing.append(f"room_analysis.{room_key}.{field}")
    
    # Validate my_recommendation structure
    if "my_recommendation" in response:
        rec = response["my_recommendation"]
        required_rec_fields = ["chosen_room", "confidence_level", "personalized_reasons", "honest_advice", "action_steps"]
        for field in required_rec_fields:
            if field not in rec:
                missing.append(f"my_recommendation.{field}")
    
    return len(missing) == 0, missing