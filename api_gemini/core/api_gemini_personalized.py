"""
Gemini API Module - PHIÊN BẢN CÁ NHÂN HÓA
Quản lý và cung cấp API Gemini cho ứng dụng với prompt cá nhân hóa
"""
from flask import Blueprint, request, jsonify
from flask_cors import CORS
import os
import requests
import json
import logging
from datetime import datetime
import time

# Import helper functions
from personalized_prompt_helpers import (
    build_personalized_prompt,
    validate_personalized_response,
    format_amenities
)

# Import API manager
try:
    from .api_manager import get_api_manager, reload_api_manager
except ImportError:
    try:
        from core.api_manager import get_api_manager, reload_api_manager
    except ImportError:
        from api_manager import get_api_manager, reload_api_manager

# Tạo Blueprint
api_gemini_personalized_bp = Blueprint('api_gemini_personalized', __name__)

# URL base của Gemini API
GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"

# Config logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)


def load_personalized_prompt_config():
    """
    Load cấu hình prompt cá nhân hóa từ file JSON
    
    Returns:
        dict: Config hoặc None nếu lỗi
    """
    try:
        # Thử các đường dẫn có thể
        current_dir = os.path.dirname(os.path.abspath(__file__))
        app_dir = os.path.dirname(current_dir)
        
        possible_paths = [
            os.path.join(app_dir, "promt", "personalizedroomcomparisonprompt.json")
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                with open(path, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                    logging.info(f"✅ Đã load personalized prompt config từ: {path}")
                    return config
        
        logging.error("❌ Không tìm thấy file personalized_room_comparison_prompt.json")
        return None
        
    except Exception as e:
        logging.error(f"Lỗi khi load personalized prompt config: {e}")
        return None


def call_gemini_personalized_comparison(prompt, system_instruction, model):
    """
    Gọi Gemini API để so sánh phòng với prompt cá nhân hóa
    
    Args:
        prompt: Prompt đã được build
        system_instruction: System instruction
        model: Model name
    
    Returns:
        tuple: (result_dict, error_message)
    """
    manager = get_api_manager()
    api_key, key_info = manager.get_next_api_key()
    
    if not api_key:
        return None, "Không có API key nào khả dụng"
        
    logging.info(f"So sánh phòng cá nhân hóa với key: {key_info['name']} sử dụng model: {model}")
    
    # Log prompt được gửi
    # logging.info("="*80)
    # logging.info("📤 PROMPT GỬI CHO AI:")
    # logging.info("="*80)
    # logging.info(f"System Instruction:\n{system_instruction[:500]}...")
    # logging.info("-"*40)
    # logging.info(f"User Prompt:\n{prompt[:1000]}...")
    # logging.info("="*80)
    
    try:
        url = f"{GEMINI_API_BASE}/{model}:generateContent?key={api_key}"
        
        payload = {
            "system_instruction": {
                "parts": [{"text": system_instruction}]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.8,  # Tăng temperature để response tự nhiên hơn
                "topK": 32,
                "topP": 0.95,
                "maxOutputTokens": 8192,
                "responseMimeType": "application/json"
            }
        }
        
        headers = {"Content-Type": "application/json"}
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            
            if "candidates" not in result or not result["candidates"]:
                logging.error(f"Phản hồi Gemini thiếu candidates: {result}")
                return None, "Phản hồi không có candidates"
            
            text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
            
            # Log response từ AI
            # logging.info("="*80)
            # logging.info("📥 RESPONSE TỪ AI:")
            # logging.info("="*80)
            # logging.info(f"{text[:2000]}...")
            # logging.info("="*80)
            
            # Parse JSON response
            try:
                parsed = json.loads(text)
                
                # Lưu response mẫu vào file để tham khảo
                try:
                    sample_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "promt", "ai_response_sample.json")
                    with open(sample_path, 'w', encoding='utf-8') as f:
                        json.dump(parsed, f, indent=2, ensure_ascii=False)
                    logging.info(f"📁 Đã lưu response mẫu vào: {sample_path}")
                except Exception as save_err:
                    logging.warning(f"Không thể lưu response mẫu: {save_err}")
                
                # Validate response structure
                is_valid, missing_fields = validate_personalized_response(parsed)
                
                if not is_valid:
                    logging.warning(f"Response thiếu các trường: {missing_fields}")
                    # Vẫn trả về nhưng đánh dấu incomplete
                    parsed["_incomplete"] = True
                    parsed["_missing_fields"] = missing_fields
                
                manager.record_success(api_key)
                return parsed, None
                
            except json.JSONDecodeError as json_err:
                logging.warning(f"Lỗi phân tích JSON: {json_err}. Đang thử làm sạch...")
                
                # Try to extract JSON from response
                original_text = text
                
                if '```json' in text:
                    text = text.split('```json')[1].split('```')[0].strip()
                elif '```' in text:
                    text = text.split('```')[1].split('```')[0].strip()
                
                start = text.find('{')
                end = text.rfind('}') + 1
                if start >= 0 and end > start:
                    text = text[start:end]
                
                try:
                    parsed = json.loads(text)
                    
                    # Validate again
                    is_valid, missing_fields = validate_personalized_response(parsed)
                    if not is_valid:
                        parsed["_incomplete"] = True
                        parsed["_missing_fields"] = missing_fields
                    
                    return parsed, None
                    
                except json.JSONDecodeError as e:
                    logging.error(f"Không thể phân tích JSON sau khi làm sạch. Lỗi: {e}")
                    logging.error(f"Văn bản lỗi (500 ký tự đầu): {original_text[:500]}...")
                    return None, f"Lỗi phân tích JSON: {str(e)}"
        
        elif response.status_code == 429:
            manager.record_rate_limit_error(api_key)
            logging.warning(f"Rate limit khi so sánh với {model}")
            return None, f"Key bị rate limit"
        
        else:
            error_msg = f"Lỗi API {response.status_code}: {response.text[:200]}"
            manager.record_error(api_key, error_msg)
            logging.error(error_msg)
            return None, error_msg
    
    except Exception as e:
        manager.record_error(api_key, str(e))
        logging.error(f"Exception khi gọi Gemini: {e}")
        return None, str(e)


def get_basic_personalized_comparison(room1, room2, user_context):
    """
    Fallback: So sánh cơ bản với format cá nhân hóa khi AI thất bại
    
    Args:
        room1: Dict thông tin phòng 1
        room2: Dict thông tin phòng 2
        user_context: Dict bối cảnh người dùng
    
    Returns:
        dict: Kết quả so sánh theo format cá nhân hóa
    """
    price1 = room1.get("price", room1.get("priceMonth", 0))
    price2 = room2.get("price", room2.get("priceMonth", 0))
    
    area1 = room1.get("area", 0)
    area2 = room2.get("area", 0)
    
    amenities1 = room1.get("amenities", room1.get("convenients", []))
    amenities2 = room2.get("amenities", room2.get("convenients", []))
    
    if isinstance(amenities1, str):
        amenities1 = [a.strip() for a in amenities1.split(',')]
    if isinstance(amenities2, str):
        amenities2 = [a.strip() for a in amenities2.split(',')]
    
    # Calculate value scores
    score1 = (area1 + len(amenities1) * 5) / (price1 or 1) * 1000000
    score2 = (area2 + len(amenities2) * 5) / (price2 or 1) * 1000000
    
    winner = room1 if score1 > score2 else room2
    winner_id = winner.get("id", winner.get("room_id", "room_1"))
    winner_name = winner.get("name", winner.get("title", "Phòng được chọn"))
    
    # Build fallback response
    return {
        "greeting": "Chào bạn! Mình đã phân tích 2 phòng cho bạn.",
        "user_profile_summary": "Do hệ thống AI gặp sự cố, mình đang dùng phương pháp so sánh cơ bản để giúp bạn. Kết quả có thể không chi tiết bằng phân tích AI thông thường.",
        
        "room_analysis": {
            "room_1": {
                "match_score": 7 if winner == room1 else 5,
                "why_it_fits": f"Giá {price1:,} VNĐ, diện tích {area1}m², có {len(amenities1)} tiện nghi",
                "why_it_doesnt": "Cần phân tích chi tiết hơn từ AI",
                "real_monthly_cost": {
                    "base_rent": price1,
                    "hidden_costs": 300000,
                    "total": price1 + 300000,
                    "breakdown": "Ước tính điện nước và chi phí phát sinh"
                },
                "personal_note": "Đây là phân tích cơ bản, bạn nên xem xét thêm các yếu tố khác"
            },
            "room_2": {
                "match_score": 7 if winner == room2 else 5,
                "why_it_fits": f"Giá {price2:,} VNĐ, diện tích {area2}m², có {len(amenities2)} tiện nghi",
                "why_it_doesnt": "Cần phân tích chi tiết hơn từ AI",
                "real_monthly_cost": {
                    "base_rent": price2,
                    "hidden_costs": 300000,
                    "total": price2 + 300000,
                    "breakdown": "Ước tính điện nước và chi phí phát sinh"
                },
                "personal_note": "Đây là phân tích cơ bản, bạn nên xem xét thêm các yếu tố khác"
            }
        },
        
        "financial_comparison": {
            "initial_cost_difference": f"Chênh lệch giá thuê: {abs(price1 - price2):,} VNĐ",
            "long_term_analysis": f"Trong 6 tháng: {abs(price1 - price2) * 6:,} VNĐ chênh lệch",
            "value_for_money_verdict": f"Phòng {'1' if winner == room1 else '2'} có vẻ hợp lý hơn dựa trên tính toán cơ bản"
        },
        
        "my_recommendation": {
            "chosen_room": winner_name,
            "chosen_room_id": winner_id,
            "confidence_level": "Medium - Đây là phân tích cơ bản do hệ thống AI gặp sự cố",
            "personalized_reasons": [
                f"Điểm value cao hơn: {score1:.2f} vs {score2:.2f}",
                "Tổng hợp các yếu tố cơ bản về giá, diện tích và tiện nghi"
            ],
            "honest_advice": "Vì hệ thống AI đang gặp sự cố nên kết quả này chỉ mang tính tham khảo. Bạn nên xem xét kỹ thêm các yếu tố như vị trí, tiện ích xung quanh, và đi xem phòng trực tiếp nhé!",
            "action_steps": [
                "Liên hệ chủ trọ để xem phòng trực tiếp",
                "Hỏi rõ về các khoản phí phát sinh"
            ]
        },
        
        "when_to_choose_alternative": {
            "scenario": "Nếu bạn ưu tiên yếu tố khác ngoài giá trị tổng hợp",
            "explanation": "Mỗi người có nhu cầu khác nhau, hãy xem xét kỹ các yếu tố quan trọng với bạn"
        },
        
        "closing_note": "Chúc bạn tìm được phòng ưng ý! Nếu cần tư vấn thêm, hãy thử lại sau khi hệ thống AI đã hoạt động bình thường nhé! 🏠",
        
        "_fallback": True,
        "_fallback_reason": "AI system unavailable, using basic comparison"
    }


@api_gemini_personalized_bp.route('/api/ai_compare_rooms_personalized', methods=['POST'])
def ai_compare_rooms_personalized():
    """
    API so sánh 2 phòng với format CÁ NHÂN HÓA sử dụng Gemini AI.
    
    Request body:
    {
        "rooms": [room1, room2],           # 2 phòng cần so sánh
        "user_context": {                   # Bối cảnh người dùng
            "preference": "Best value for money",
            "user_location": {...},
            "user_profile": {
                "favoriteBasedProfile": {...},
                "viewHistoryBasedProfile": {...}
            }
        }
    }
    
    Response:
    {
        "success": true,
        "data": {
            "greeting": "...",
            "user_profile_summary": "...",
            "room_analysis": {...},
            "financial_comparison": {...},
            "my_recommendation": {...},
            "when_to_choose_alternative": {...},
            "closing_note": "..."
        },
        "meta": {
            "processing_time_ms": 1234,
            "ai_model": "gemini-3-flash-preview",
            "timestamp": "2025-01-07T..."
        }
    }
    """
    start_time = time.time()
    
    try:
        data = request.get_json()
        logging.info(f"📥 Nhận yêu cầu ai_compare_rooms_personalized")
        
        # 1. Validate input
        rooms = data.get("options", data.get("rooms", []))
        
        if not rooms or len(rooms) != 2:
            return jsonify({
                "success": False,
                "error": "Cần cung cấp đúng 2 phòng để so sánh"
            }), 400
        
        room1, room2 = rooms[0], rooms[1]
        user_context = data.get("user_context", {})
        
        # Log input
        logging.info(f"🏠 Phòng 1: {room1.get('name', room1.get('title', 'N/A'))}")
        logging.info(f"🏠 Phòng 2: {room2.get('name', room2.get('title', 'N/A'))}")
        logging.info(f"👤 User preference: {user_context.get('preference', 'N/A')}")
        
        # 2. Load personalized prompt config
        prompt_config = load_personalized_prompt_config()
        
        if not prompt_config:
            logging.warning("⚠️ Không load được personalized prompt config, sử dụng fallback")
            result = get_basic_personalized_comparison(room1, room2, user_context)
            
            return jsonify({
                "success": True,
                "data": result,
                "warning": "Sử dụng so sánh cơ bản do lỗi config",
                "processing_time_ms": int((time.time() - start_time) * 1000)
            })
        
        # 3. Build personalized prompt
        prompt = build_personalized_prompt(prompt_config, rooms, user_context)
        
        if not prompt:
            logging.error("❌ Không thể build personalized prompt")
            result = get_basic_personalized_comparison(room1, room2, user_context)
            
            return jsonify({
                "success": True,
                "data": result,
                "warning": "Không thể build prompt, sử dụng fallback",
                "processing_time_ms": int((time.time() - start_time) * 1000)
            })
        
        logging.info(f"📝 Personalized prompt đã được tạo (length: {len(prompt)} chars)")
        
        # 4. Model priority - Chỉ dùng model đầu tiên, chỉ đổi khi TẤT CẢ keys đều thất bại
        models = [
            "gemini-3-flash-preview",  # Model 3.0 thử trước
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite",
            "gemini-2.0-flash-lite"
        ]
        
        result = None
        last_error = None
        used_model = None
        
        # Đã đưa role/instruction vào prompt JSON, không cần gửi riêng qua system_instruction
        system_instruction = "" 
        
        # Lấy TẤT CẢ số lượng keys có sẵn
        manager = get_api_manager()
        stats = manager.get_stats() if manager else {}
        total_keys = stats.get("total_projects", 60)  # Thử TẤT CẢ keys
        
        for model in models:
            logging.info(f"🤖 Đang thử model: {model} (sẽ thử tối đa {total_keys} keys)")
            
            # Thử TẤT CẢ API keys với cùng 1 model
            for key_attempt in range(total_keys):
                logging.info(f"   📌 Attempt {key_attempt + 1}/{total_keys} với model {model}")
                
                result, error = call_gemini_personalized_comparison(
                    prompt, 
                    system_instruction, 
                    model
                )
                
                if result:
                    used_model = model
                    logging.info("="*50)
                    logging.info(f"🟢 [Thành công] Model: {model}, Attempt: {key_attempt + 1}")
                    
                    # Check if incomplete
                    if result.get("_incomplete"):
                        logging.warning(f"⚠️ Response không đầy đủ, thiếu: {result.get('_missing_fields')}")
                    
                    logging.info("="*50)
                    break
                else:
                    last_error = error
                    logging.warning(f"   ❌ Attempt {key_attempt + 1} thất bại: {error}")
            
            # Nếu đã có kết quả, thoát vòng lặp model
            if result:
                break
            else:
                logging.warning(f"⚠️ Model {model} đã thử TẤT CẢ {total_keys} keys đều thất bại, chuyển sang model tiếp theo...")
        
        # 6. Return result
        if result:
            processing_time = int((time.time() - start_time) * 1000)
            
            # Remove internal fields
            result.pop("_incomplete", None)
            result.pop("_missing_fields", None)
            
            return jsonify({
                "success": True,
                "data": result,
                "meta": {
                    "processing_time_ms": processing_time,
                    "ai_model": used_model,
                    "personalized": True,
                    "timestamp": datetime.now().isoformat()
                }
            })
        else:
            # Fallback to basic comparison
            logging.warning(f"⚠️ Tất cả model AI thất bại, sử dụng fallback. Lỗi: {last_error}")
            fallback_result = get_basic_personalized_comparison(room1, room2, user_context)
            
            return jsonify({
                "success": True,
                "data": fallback_result,
                "warning": f"Sử dụng so sánh cơ bản do lỗi AI: {last_error}",
                "meta": {
                    "processing_time_ms": int((time.time() - start_time) * 1000),
                    "fallback": True,
                    "timestamp": datetime.now().isoformat()
                }
            })
    
    except Exception as e:
        logging.error(f"❌ Lỗi So sánh phòng personalized: {e}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# Health check endpoint
@api_gemini_personalized_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Gemini Personalized Room Comparison",
        "timestamp": datetime.now().isoformat()
    })


if __name__ == "__main__":
    # Test endpoint locally
    from flask import Flask
    
    app = Flask(__name__)
    app.register_blueprint(api_gemini_personalized_bp, url_prefix='/api')
    
    logging.info("🚀 Starting Gemini Personalized API test server...")
    app.run(debug=True, port=5001)