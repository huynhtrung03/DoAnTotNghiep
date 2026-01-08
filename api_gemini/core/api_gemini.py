"""
Gemini API Module - Quản lý và cung cấp API Gemini cho ứng dụng
"""
from flask import Blueprint, request, jsonify
from flask_cors import CORS
import os
import requests
import json
import logging
from datetime import datetime
from datetime import date
import time
import mysql.connector
import mysql.connector
import uuid
import shutil
import base64
from urllib.parse import urlparse
try:
    from .api_manager import get_api_manager, reload_api_manager
except ImportError:
    try:
        from core.api_manager import get_api_manager, reload_api_manager
    except ImportError:
        import api_manager
        from api_manager import get_api_manager, reload_api_manager

# Import personalized comparison API
try:
    from .api_gemini_personalized import ai_compare_rooms_personalized as personalized_compare_handler
except ImportError:
    try:
        from core.api_gemini_personalized import ai_compare_rooms_personalized as personalized_compare_handler
    except ImportError:
        from api_gemini_personalized import ai_compare_rooms_personalized as personalized_compare_handler

# Tạo Blueprint
api_gemini_bp = Blueprint('api_gemini', __name__)

# URL base của Gemini API
GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"

# Biến cache dữ liệu phòng trọ
room_cache = {
    'result': None,
    'columns': None,
    'last_update': None
}

# Config cho Vision/Image logic
URL_IMAGE = "https://res.cloudinary.com"
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
IMAGES_DIR = os.path.join(parent_dir, "images")
if not os.path.exists(IMAGES_DIR):
    os.makedirs(IMAGES_DIR)

def download_media_file(url, filename):
    """Tải file ảnh/video từ URL về thư mục ./images/"""
    try:
        filepath = os.path.join(IMAGES_DIR, filename)
        # logging.debug(f"Đang tải {url} về {filepath}...")
        
        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            shutil.copyfileobj(response.raw, f)
            
        return filepath
    except Exception as e:
        logging.error(f"Lỗi khi tải {url}: {e}")
        return None

def cleanup_media_files(filepaths):
    """Xóa các file ảnh/video sau khi xử lý"""
    for filepath in filepaths:
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
        except Exception as e:
            logging.error(f"Lỗi khi xóa {filepath}: {e}")

# Hàm lấy dữ liệu phòng từ MySQL
def get_rooms():
    now = datetime.now()
    if room_cache['result'] and room_cache['last_update']:
        delta = now - room_cache['last_update']
        if delta.total_seconds() < 900:  # cache 15 phút
            # Check if columns is not None
            if room_cache['columns']:
                return room_cache['result'], room_cache['columns']

    host = os.getenv("DB_HOST")
    port = os.getenv("DB_PORT")
    database = os.getenv("DB_NAME")
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")

    # Fix case where port might be string
    try:
        if port:
            port = int(port)
        else:
            port = 3306
    except:
        port = 3306

    query = '''SELECT 
        r.id AS room_id,
        r.title,
        r.description,
        r.price_month,
        r.price_deposit,
        r.area,
        r.post_start_date,
        r.post_end_date,
        CONCAT(a.name_street, ', ', w.name, ', ', d.name, ', ', p.name) AS full_address,
        GROUP_CONCAT(c.name SEPARATOR ', ') AS convenients
    FROM rooms r
    JOIN addresses a ON r.address_id = a.id
    JOIN wards w ON a.ward_id = w.id
    JOIN districts d ON w.district_id = d.id
    JOIN provinces p ON d.province_id = p.id
    LEFT JOIN room_convenients rc ON r.id = rc.room_id
    LEFT JOIN convenients c ON rc.convenient_id = c.id
    WHERE r.approval=1 AND r.available=0 AND r.post_end_date > CURRENT_DATE AND r.is_removed = 0 AND hidden =0
    GROUP BY r.id;'''

    try:
        conn = mysql.connector.connect(host=host, user=user, port=port, password=password, database=database)
        cursor = conn.cursor()
        cursor.execute(query)
        result = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        cursor.close()
        conn.close()

        room_cache['result'] = result
        room_cache['columns'] = columns
        room_cache['last_update'] = now

        return result, columns
    except Exception as e:
        logging.error(f"Kết nối database thất bại: {e}")
        return [], None

def call_gemini_with_rotation(prompt_text: str, history: list = None, model="gemini-2.5-flash"):
    """
    Gọi Gemini API với cơ chế xoay vòng key thông minh từ APIKeyManager
    
    Args:
        prompt_text: Nội dung prompt cần hỏi
        history: Lịch sử chat (optional)
        model: Model Gemini cần dùng
    
    Returns:
        (success, result_text hoặc error_message)
    """
    manager = get_api_manager()
    
    # Lấy key tiếp theo theo thuật toán xoay vòng
    api_key, key_info = manager.get_next_api_key()
    
    if not api_key:
        return False, "Không có API key nào khả dụng (tất cả đều busy hoặc hết quota)"
        
    logging.info(f"Đang sử dụng API Key: {key_info['name']} (Acc: {key_info['account_index']}, Proj: {key_info['project_index']})")
    
    try:
        url = f"{GEMINI_API_BASE}/{model}:generateContent?key={api_key}"
        
        # Build payload
        contents_parts = []
        
        # Thêm history nếu có
        if history:
            for turn in history:
                role = "user" if turn.get('role') == 'user' else "model"
                contents_parts.append({
                    "role": role,
                    "parts": [{"text": turn.get('text', '')}]
                })
        
        # Thêm prompt hiện tại
        contents_parts.append({
            "role": "user",
            "parts": [{"text": prompt_text}]
        })
        
        payload = {
            "contents": contents_parts,
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 2048,
            }
        }
        
        headers = {"Content-Type": "application/json"}
        
        # Gọi API
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        # Xử lý kết quả
        if response.status_code == 200:
            result = response.json()
            if "candidates" in result and result["candidates"]:
                content = result["candidates"][0]["content"]["parts"][0]["text"]
                manager.record_success(api_key)
                return True, content
            else:
                return False, "Phản hồi không có nội dung"
                
        elif response.status_code == 429:
            manager.record_rate_limit_error(api_key)
            logging.warning(f"Key {key_info['name']} bị rate limit, đang thử key tiếp theo...")
            # Đệ quy để thử key khác (có thể giới hạn số lần retry nếu muốn)
            return call_gemini_with_rotation(prompt_text, history, model)
            
        else:
            error_msg = f"Lỗi API {response.status_code}: {response.text}"
            manager.record_error(api_key, error_msg)
            return False, error_msg
            
    except Exception as e:
        manager.record_error(api_key, str(e))
        return False, str(e)

# ======================= ROUTES =======================

def load_chatbot_prompt():
    """Load prompt từ file chatbot_promt.js"""
    try:
        # Lấy path
        current_dir = os.path.dirname(os.path.abspath(__file__))
        app_dir = os.path.dirname(current_dir)
        prompt_path = os.path.join(app_dir, "promt", "chatbot_promt.js")
        
        if os.path.exists(prompt_path):
            with open(prompt_path, "r", encoding="utf-8") as f:
                content = f.read()
                # Parse JS string: export const CHATBOT_PROMPT = `...`;
                start_quote = content.find('`')
                end_quote = content.rfind('`')
                if start_quote != -1 and end_quote != -1:
                    return content[start_quote+1:end_quote]
    except Exception as e:
        logging.error(f"Lỗi đọc file chatbot_promt.js: {e}")
    
    # Fallback return None (sẽ dùng hardcoded)
    return None

@api_gemini_bp.route('/ai_chatbot', methods=['POST'])
def ai_chatbot():
    """API Chatbot thông minh sử dụng Gemini Multi-Key Rotation + Multi-Model Fallback"""
    try:
        data = request.get_json()
        history = data.get("history", [])
        user_message = data.get("message", "")
        
        # 1. Lấy dữ liệu phòng
        result, columns = get_rooms()
        if result is None or columns is None:
             result = []
             columns = []

        # 2. Xử lý dữ liệu phòng thành text
        rooms_text = ""
        for row in result:
            if isinstance(row[0], (bytes, bytearray)) and len(row[0]) == 16:
                room_id_str = str(uuid.UUID(bytes=bytes(row[0])))
            elif isinstance(row[0], str):
                room_id_str = row[0]
            else:
                room_id_str = str(row[0])
            
            info = {col: str(val) if val not in [None, 'None'] else 'Chưa cập nhật' for col, val in zip(columns, row)}
            link = f"http://localhost:3000/detail/{room_id_str}"
            
            rooms_text += f"- Title: {info.get('title','')}\n"
            rooms_text += f"  Address: {info.get('full_address','')}\n"
            rooms_text += f"  Price: {info.get('price_month','')} VNĐ/month\n"
            rooms_text += f"  Area: {info.get('area','')} m²\n"
            rooms_text += f"  Convenients: {info.get('convenients','')}\n"
            rooms_text += f"  Link: {link}\n\n"

        # Fix: Nếu rooms_text trống, thêm thông báo
        if not rooms_text:
            rooms_text = "(Hiện tại không có phòng nào trống)"

        # 3. Chuẩn bị prompt
        if not history:
            history = []
            
        context_present = False
        if history and len(history) > 0:
            # Check kỹ hơn để tránh duplicate prompt
            if "Bạn là Ants" in str(history[0].get('text', '')) or "Chatbot Prompt" in str(history[0].get('text', '')):
                context_present = True
        
        if not context_present:
            # Load prompt từ file
            base_prompt = load_chatbot_prompt()
            
            if not base_prompt:
                # Prompt mặc định nếu lỗi file
                base_prompt = (
                    "Bạn là Ants, trợ lý ảo cho website Ants chuyên về phòng trọ cho thuê.\n"
                    "Nhiệm vụ của bạn: Giới thiệu, tư vấn phòng trọ, giải đáp thắc mắc.\n"
                    "Available room data:\n"
                )
            
            # Ghép data vào prompt (thay thế placeholder hoặc append)
            # File JS có dòng "Available room data:" ở cuối, ta append rooms_text vào
            full_prompt = base_prompt + "\n" + rooms_text
            
            history.insert(0, {'role': 'user', 'text': full_prompt})
            
            # Log prompt đầy đủ để debug
            logging.info(f"Prompt khởi tạo Chatbot (Đầy đủ): {full_prompt}")
        
        # 4. Model Rotation Strategy
        # Nếu model chính thất bại, thử các model khác
        models_to_try = [
            "gemini-3-flash-preview",       # Priority 1
            "gemini-2.5-flash",             # Priority 2
            "gemini-2.5-flash-lite",        # Priority 3
            "gemini-2.0-flash-lite",        # Priority 4
        ]
        
        last_error = None
        
        for model in models_to_try:
            logging.info(f"Chatbot đang thử với model: {model}")
            
            # Gọi API (vẫn dùng rotation key bên trong)
            success, response = call_gemini_with_rotation(
                prompt_text=user_message if user_message else "...", 
                history=history, 
                model=model
            )
            
            if success:
                return jsonify({"reply": response})
            
            # Nếu thất bại, log và thử model tiếp theo
            logging.warning(f"Model {model} thất bại: {response}. Đang thử model tiếp theo...")
            last_error = response
            
            # Optional: Nếu lỗi là do "Safety" hoặc internal error chứ ko phải network/quota, 
            # có thể model khác sẽ chạy dc.
            
        # Nếu đã thử hết model
        return jsonify({
            "reply": "Xin lỗi, hệ thống đang bận hoặc gặp sự cố kết nối. Vui lòng thử lại sau.",
            "error": f"Tất cả model đều thất bại. Lỗi cuối cùng: {last_error}"
        }), 500
            
    except Exception as e:
        logging.error(f"Lỗi Chatbot: {e}")
        return jsonify({"reply": "Đã có lỗi xảy ra.", "error": str(e)}), 500

@api_gemini_bp.route('/api/test-rooms', methods=['GET'])
def test_rooms():
    """API kiểm tra kết nối và lấy dữ liệu phòng từ Database"""
    try:
        logging.info("Đang kiểm tra lấy dữ liệu phòng...")
        
        # Check database connection variables
        password = os.getenv("DB_PASSWORD")
        db_info = {
            "host": os.getenv("DB_HOST"),
            "port": os.getenv("DB_PORT"),
            "database": os.getenv("DB_NAME"),
            "user": os.getenv("DB_USER"),
            "password_status": "SET (len=" + str(len(password)) + ")" if password else "NOT SET or EMPTY"
        }
        logging.debug(f"Cấu hình DB: {db_info}")
        
        result, columns = get_rooms()
        
        if result is None or columns is None:
            return jsonify({
                "status": "error",
                "message": "Không thể kết nối database hoặc lỗi truy vấn",
                "db_config": db_info
            }), 500
            
        # Format return data
        rooms_data = []
        
        for row in result:
            row_dict = {}
            for col, val in zip(columns, row):
                # Handle binary/bytes UUID if necessary
                if isinstance(val, (bytes, bytearray)):
                    try:
                        if len(val) == 16:
                            val = str(uuid.UUID(bytes=bytes(val)))
                        else:
                            val = val.decode('utf-8', errors='ignore')
                    except:
                        val = str(val)
                elif hasattr(val, 'isoformat'): # Handle date/datetime
                    val = val.isoformat()
                
                row_dict[col] = val
            rooms_data.append(row_dict)
            
        return jsonify({
            "status": "success",
            "count": len(rooms_data),
            "data": rooms_data
        })
        
    except Exception as e:
        logging.error(f"Kiểm tra thất bại: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@api_gemini_bp.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint: Kiểm tra DB và API Keys"""
    # 1. Check Manager/Keys
    manager = get_api_manager()
    stats = manager.get_stats()
    
    # 2. Check Database
    db_status = "unknown"
    db_message = ""
    try:
        # Test connection bằng cách lấy dữ liệu (đã có cache)
        result, _ = get_rooms()
        if result is not None:
             db_status = "connected"
             db_message = f"Số phòng có sẵn: {len(result)}"
        else:
             db_status = "disconnected"
             db_message = "Không thể lấy dữ liệu phòng"
    except Exception as e:
        db_status = "error"
        db_message = str(e)

    # 3. Determine Overall Status
    overall_status = "healthy"
    
    # Nếu DB lỗi -> degraded
    if db_status != "connected":
        overall_status = "degraded"
    
    # Nếu không có key nào available -> unhealthy (critical)
    if stats.get("available", 0) == 0:
        overall_status = "unhealthy"

    return jsonify({
        "status": overall_status,
        "service": "api_gemini_core",
        "timestamp": datetime.now().isoformat(),
        "database": {
            "status": db_status,
            "message": db_message
        },
        "key_stats": stats
    })


@api_gemini_bp.route('/api/reload', methods=['POST'])
def reload_keys():
    """Reload API keys từ api.json mà không cần restart server"""
    try:
        manager = reload_api_manager()
        stats = manager.get_stats()
        
        return jsonify({
            "status": "success",
            "message": "API keys đã được reload",
            "key_stats": stats
        })
    except Exception as e:
        logging.error(f"Reload thất bại: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


def load_approval_prompt():
    """Load prompt duyệt phòng từ file markdown"""
    try:
        # Đường dẫn: api_gemini/promt_approval.md
        current_dir = os.path.dirname(os.path.abspath(__file__)) # core/
        app_dir = os.path.dirname(current_dir) # api_gemini/
        
        # Thử nhiều vị trí để chắc chắn
        candidates = [
            os.path.join(app_dir, "promt_approval.md"),
            os.path.join(app_dir, "promt", "promt_approval.md")
        ]
        
        for path in candidates:
            if os.path.exists(path):
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Append strict JSON format instruction if needed
                    if "TRẢ VỀ JSON" not in content.upper():
                         content += """
## ⚠️ LƯU Ý QUAN TRỌNG:
Bạn PHẢI trả về kết quả duyệt theo ĐÚNG định dạng JSON sau, không thêm markdown, không thêm text khác:

**Trường hợp KHÔNG DUYỆT:**
{
  "status": 2,
  "content": [
    "Lý do cụ thể 1",
    "Lý do cụ thể 2"
  ]
}

**Trường hợp ĐƯỢC DUYỆT:**
{
  "status": 1,
  "content": [
    "Nhận xét tích cực..."
  ]
}
CHỈ trả về JSON thuần."""
                    return content
        
        logging.error("Không tìm thấy file promt_approval.md")
        return None
    except Exception as e:
        logging.error(f"Lỗi đọc file promt_approval.md: {e}")
        return None

def call_gemini_vision_payload(payload: dict, model="gemini-2.5-flash"):
    """Hàm gọi vision với payload đã build sẵn, xử lý rotation"""
    manager = get_api_manager()
    api_key, key_info = manager.get_next_api_key()
    
    if not api_key:
        return {"status": 0, "content": ["Không có API key nào khả dụng"]}
        
    logging.info(f"Duyệt phòng (Vision) với key: {key_info['name']}")
    
    try:
        url = f"{GEMINI_API_BASE}/{model}:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
            manager.record_success(api_key)
            
            # Clean json
            if '```json' in text:
                text = text.split('```json')[1].split('```')[0].strip()
            elif '```' in text:
                text = text.split('```')[1].split('```')[0].strip()
            
            # Try to find { ... }
            start = text.find('{')
            end = text.rfind('}') + 1
            if start >= 0 and end > start:
                text = text[start:end]
            
            return json.loads(text)
            
        elif response.status_code == 429:
            manager.record_rate_limit_error(api_key)
            logging.warning("Rate limit khi duyệt phòng, đang thử lại...")
            return call_gemini_vision_payload(payload, model) # Retry logic
            
        else:
            error_msg = f"Lỗi API {response.status_code}: {response.text}"
            manager.record_error(api_key, error_msg)
            return {"status": 2, "content": [f"Lỗi API: {error_msg}"]}
            
    except Exception as e:
        manager.record_error(api_key, str(e))
        return {"status": 2, "content": [f"Lỗi xử lý: {str(e)}"]}


def approve_room_with_gemini(room_data, prompt):
    """Duyệt phòng bằng AI Gemini với ảnh/video, sử dụng key rotation"""
    
    # Xử lý URL ảnh và video  
    media_urls = []
    if room_data.get('images') and isinstance(room_data['images'], list):
        media_urls = [f"{URL_IMAGE}{url}" for url in room_data['images'] if url]
    
    # Tải các file ảnh/video về ./images/
    downloaded_files = []
    for i, url in enumerate(media_urls):
        # Lấy tên file từ URL
        parsed_url = urlparse(url)
        filename = os.path.basename(parsed_url.path)
        if not filename or '.' not in filename:
            # Tạo tên file dựa trên index và loại media
            extension = '.jpg' if '/image/' in url else '.mp4' if '/video/' in url else '.jpg'
            filename = f"room_{room_data.get('id', 'unknown')}_{i+1}{extension}"
        
        filepath = download_media_file(url, filename)
        if filepath:
            downloaded_files.append(filepath)
    
    # Chuyển dữ liệu phòng thành text để gửi AI
    convenients_text = ', '.join(room_data.get('convenients', [])) if isinstance(room_data.get('convenients'), list) else str(room_data.get('convenients', ''))
    
    room_info = f"""
Thông tin phòng trọ cần duyệt:
- ID: {room_data.get('id', '')}
- Tiêu đề: {room_data.get('title', '')}
- Mô tả: {room_data.get('description', '')[:500] if room_data.get('description') else 'Không có mô tả'}
- Giá thuê: {room_data.get('priceMonth', 0):,} VNĐ/tháng
- Tiền cọc: {room_data.get('priceDeposit', 0):,} VNĐ
- Diện tích: {room_data.get('area', 0)} m²
- Kích thước: {room_data.get('length', 0)}m x {room_data.get('width', 0)}m
- Số người tối đa: {room_data.get('maxPeople', 0)}
- Giá điện: {room_data.get('elecPrice', 0):,} đ/kW
- Giá nước: {room_data.get('waterPrice', 0):,} đ/m³
- Địa chỉ: {room_data.get('fullAddress', '')}
- Tiện ích: {convenients_text}
- Số lượng ảnh/video: {len(media_urls)}

DANH SÁCH FILE ĐÃ TẢI:
{chr(10).join([f"- {os.path.basename(f)}" for f in downloaded_files])}
    """

    full_prompt = f"{prompt}\n\n{room_info}\n\nHãy duyệt phòng này dựa trên thông tin và hình ảnh/video đã tải. Trả về ĐÚNG định dạng JSON yêu cầu, không có markdown, không có text thừa."

    # Danh sách các model để thử (theo thứ tự ưu tiên) - Tất cả hỗ trợ vision
    models_to_try = [
        "gemini-2.5-flash",          # Mới nhất, tốt nhất cho vision
        "gemini-2.0-flash",          # Stable backup
        "gemini-2.0-flash-lite",     # Nhanh, nhẹ
    ]

    # Tạo payload với ảnh/video đã tải
    payload_parts = [{"text": full_prompt}]
    
    # Thêm các file ảnh vào payload
    for filepath in downloaded_files:
        if filepath.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
            try:
                with open(filepath, 'rb') as f:
                    image_data = base64.b64encode(f.read()).decode('utf-8')
                    payload_parts.append({
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": image_data
                        }
                    })
                    logging.debug(f"Đã thêm ảnh {os.path.basename(filepath)} vào payload")
            except Exception as e:
                logging.error(f"Lỗi khi thêm ảnh {filepath}: {e}")

    payload = {"contents": [{"parts": payload_parts}]}
    headers = {"Content-Type": "application/json"}
    
    # Sử dụng try-finally để đảm bảo cleanup files
    try:
        manager = get_api_manager()
        last_error = None
        
        # Thử các model theo thứ tự
        for model in models_to_try:
            api_key, key_info = manager.get_next_api_key()
            
            if not api_key:
                last_error = "Không có API key nào khả dụng"
                continue
                
            try:
                url = f"{GEMINI_API_BASE}/{model}:generateContent?key={api_key}"
                logging.info(f"Duyệt phòng với model: {model}, key: {key_info['name']} ({len(downloaded_files)} ảnh)")
                
                response = requests.post(url, headers=headers, json=payload, timeout=60)
                
                # Kiểm tra lỗi 429 (Rate Limit)
                if response.status_code == 429:
                    manager.record_rate_limit_error(api_key)
                    logging.warning(f"Rate limit exceeded for {model}, trying next...")
                    last_error = "Rate limit exceeded"
                    time.sleep(1)
                    continue
                
                # Kiểm tra lỗi 404 (Model not found)
                if response.status_code == 404:
                    logging.warning(f"Model {model} not found, trying next...")
                    last_error = f"Model {model} not available"
                    continue
                
                response.raise_for_status()
                result = response.json()
                text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
                manager.record_success(api_key)
                
                # Parse JSON response
                try:
                    # Loại bỏ markdown formatting
                    if '```json' in text:
                        text = text.split('```json')[1].split('```')[0].strip()
                    elif '```' in text:
                        text = text.split('```')[1].split('```')[0].strip()
                    
                    # Loại bỏ text thừa trước và sau JSON
                    json_start = text.find('{')
                    json_end = text.rfind('}') + 1
                    if json_start >= 0 and json_end > json_start:
                        text = text[json_start:json_end]
                    
                    approval_result = json.loads(text)
                    
                    # Validate JSON structure
                    if not isinstance(approval_result, dict):
                        raise ValueError("Response is not a dict")
                    if 'status' not in approval_result or 'content' not in approval_result:
                        raise ValueError("Missing required fields")
                    if not isinstance(approval_result['content'], list):
                        raise ValueError("Content must be a list")
                    
                    logging.info(f"Duyệt phòng thành công với {model}")
                    return approval_result
                    
                except Exception as e:
                    logging.error(f"Failed to parse response from {model}: {e}")
                    last_error = f"Parse error: {str(e)}"
                    continue
                    
            except requests.exceptions.HTTPError as e:
                manager.record_error(api_key, str(e))
                logging.error(f"HTTP Error with {model}: {e}")
                last_error = str(e)
                continue
            except Exception as e:
                if api_key:
                    manager.record_error(api_key, str(e))
                logging.error(f"Error with {model}: {e}")
                last_error = str(e)
                continue
        
        # Nếu tất cả model đều thất bại
        logging.error(f"All approval models failed. Last error: {last_error}")
        
        # Trả về status 0 nếu là rate limit, status 2 nếu lỗi khác
        if last_error and ("rate limit" in str(last_error).lower() or "429" in str(last_error)):
            return {
                "status": 0, 
                "content": ["Rate limit exceeded - Please try again in a few minutes"]
            }
        else:
            return {
                "status": 2,
                "content": [f"Lỗi duyệt phòng: {last_error}"]
            }
    
    finally:
        # Luôn cleanup files dù success hay fail
        logging.debug(f"Cleaning up {len(downloaded_files)} downloaded files...")
        cleanup_media_files(downloaded_files)


# API duyệt phòng - nhận interface và trả về JSON kết quả
@api_gemini_bp.route('/ai_approval', methods=['POST'])
def ai_approval():
    """
    API duyệt phòng trọ bằng Gemini AI
    
    Hỗ trợ 2 loại request:
    1. JSON từ Java Backend (Content-Type: application/json)
    2. Form data từ Slack (Content-Type: application/x-www-form-urlencoded)
    
    Input interface (JSON):
    {
        "id": "room_id",
        "title": "Tiêu đề phòng",
        "description": "Mô tả phòng", 
        "priceMonth": 3000000,
        "priceDeposit": 2000000,
        "area": 25,
        "length": 5,
        "width": 5,
        "maxPeople": 2,
        "elecPrice": 3500,
        "waterPrice": 20000,
        "fullAddress": "Địa chỉ đầy đủ",
        "convenients": ["Wifi", "Máy lạnh", "Tủ lạnh"],
        "images": ["/image/upload/...", "/video/upload/..."]
    }
    
    Output:
    {
        "status": 1 (duyệt) / 2 (không duyệt) / 0 (lỗi 429 rate limit),
        "content": ["Lý do 1", "Lý do 2", ...]
    }
    """
    try:
        # Kiểm tra xem là JSON hay Form data (từ Slack)
        if request.is_json:
            # Request từ Java Backend hoặc API client - JSON format
            room_data = request.get_json()
            logging.info(f"Nhận request JSON - Room ID: {room_data.get('id', 'N/A')}")
        else:
            # Request từ Slack - Form data format
            form_data = request.form.to_dict()
            logging.info(f"Nhận request Form (Slack) - Data: {form_data}")
            
            # Slack gửi: command, text, user_id, response_url, etc.
            # text chứa tham số đi kèm lệnh, ví dụ: /ai_approval <room_id>
            slack_text = form_data.get('text', '').strip()
            slack_user = form_data.get('user_name', 'unknown')
            
            # Nếu không có room_id trong text, trả về hướng dẫn
            if not slack_text:
                return jsonify({
                    "response_type": "ephemeral",
                    "text": f"👋 Xin chào {slack_user}!\n\n"
                           f"⚠️ Để duyệt phòng, vui lòng dùng cú pháp:\n"
                           f"`/ai_approval <room_id>`\n\n"
                           f"Hoặc sử dụng Admin Panel để duyệt phòng với đầy đủ thông tin và hình ảnh.\n\n"
                           f"📌 Lưu ý: API này được thiết kế để Java Backend gọi trực tiếp với đầy đủ thông tin phòng."
                }), 200
            
            # Nếu có room_id, trả về thông báo (chưa implement query DB)
            return jsonify({
                "response_type": "in_channel",
                "text": f"🔍 Đang xử lý yêu cầu duyệt phòng ID: `{slack_text}`\n\n"
                       f"⚠️ Tính năng này đang được phát triển.\n"
                       f"Hiện tại, vui lòng sử dụng Java Backend để gửi request duyệt phòng với đầy đủ thông tin.\n\n"
                       f"📞 Liên hệ: 0388953628"
            }), 200
        
        # Kiểm tra dữ liệu trống
        if not room_data:
            return jsonify({
                "status": 2,
                "content": ["Dữ liệu request trống"]
            }), 400
        
        # Validate required fields
        required_fields = ['id', 'title', 'description', 'priceMonth', 'priceDeposit', 
                          'area', 'length', 'width', 'maxPeople', 'elecPrice', 'waterPrice', 
                          'fullAddress', 'convenients', 'images']
        
        missing_fields = []
        for field in required_fields:
            if field not in room_data:
                missing_fields.append(field)
        
        if missing_fields:
            return jsonify({
                "status": 2,
                "content": [f"Thiếu các trường bắt buộc: {', '.join(missing_fields)}"]
            }), 400
        
        # Load prompt duyệt phòng
        prompt = load_approval_prompt()
        if not prompt:
            return jsonify({
                "status": 2,
                "content": ["Không thể tải file prompt duyệt phòng (promt_approval.md)"]
            }), 500
        
        logging.info(f"Bắt đầu duyệt phòng ID: {room_data.get('id')}")
        
        # Gọi Gemini để duyệt phòng
        approval_result = approve_room_with_gemini(room_data, prompt)
        
        logging.info(f"Kết quả duyệt phòng: {approval_result}")
        
        # Trả về kết quả
        return jsonify(approval_result)
        
    except Exception as e:
        logging.error(f"Lỗi trong API ai_approval: {e}")
        return jsonify({
            "status": 2,
            "content": [f"Lỗi server: {str(e)}"]
        }), 500


# ======================= ROOM COMPARISON API =======================

def load_comparison_prompt():
    """Load prompt so sánh phòng từ file JSON"""
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        app_dir = os.path.dirname(current_dir)
        prompt_path = os.path.join(app_dir, "promt", "room_comparison_prompt.json")
        
        if os.path.exists(prompt_path):
            with open(prompt_path, "r", encoding="utf-8") as f:
                return json.load(f)
        else:
            logging.error(f"File room_comparison_prompt.json không tồn tại: {prompt_path}")
            return None
    except Exception as e:
        logging.error(f"Lỗi đọc room_comparison_prompt.json: {e}")
        return None


def build_comparison_prompt(prompt_config, rooms, user_context):
    """
    Build prompt tối ưu dạng JSON có cấu trúc rõ ràng cho AI model.
    Format mới giúp model hiểu ngữ cảnh tốt hơn và trả về kết quả chính xác hơn.
    """
    
    # 1. Chuẩn hóa dữ liệu phòng
    rooms_to_compare = []
    for i, room in enumerate(rooms):
        r_id = room.get("id", room.get("room_id", f"room_{i+1}"))
        r_title = room.get("title", room.get("room_name", f"Phòng {i+1}"))
        r_price = room.get("priceMonth", room.get("price_per_night", room.get("price", 0)))
        r_addr = room.get("fullAddress", room.get("address", room.get("location", "")))
        r_area = room.get("area", room.get("size_sqm", 0))
        
        # Amenities - giữ dạng list
        r_amenities = room.get("convenients", room.get("amenities", []))
        if isinstance(r_amenities, str):
            r_amenities = [a.strip() for a in r_amenities.split(",")]
        
        # Description - cắt ngắn và làm sạch
        r_desc = room.get("description", "")
        if r_desc:
            r_desc = str(r_desc).strip()[:500].replace("\n", " ").replace("  ", " ")
        
        rooms_to_compare.append({
            "room_id": str(r_id),
            "name": r_title,
            "price": r_price,
            "address": r_addr,
            "area": r_area,
            "amenities": r_amenities,
            "description": r_desc
        })
    
    # 2. Chuẩn hóa user context
    user_profile = user_context.get("user_profile", {})
    preference = user_context.get("preference", "Best value for money")
    
    # Xử lý favorite-based profile
    fav_profile = user_profile.get("favoriteBasedProfile", {})
    view_profile = user_profile.get("viewHistoryBasedProfile", {})
    
    formatted_user_context = {
        "primary_preference": preference,
        "user_location": {
            "latitude": fav_profile.get("userLat", view_profile.get("userLat", 0)),
            "longitude": fav_profile.get("userLng", view_profile.get("userLng", 0))
        },
        "user_profile": {}
    }
    
    # Thêm favorite-based profile nếu có
    if fav_profile:
        formatted_user_context["user_profile"]["favorite_based_profile"] = {
            "description": "Dựa trên các phòng người dùng đã yêu thích (favorite)",
            "average_price": fav_profile.get("avgPrice", 0),
            "average_area": fav_profile.get("avgArea", 0),
            "average_room_dimensions": {
                "length": fav_profile.get("avgLen", 0),
                "width": fav_profile.get("avgWid", 0)
            },
            "average_capacity": fav_profile.get("avgCapacity", 0),
            "preferred_amenities": fav_profile.get("favConvenientIds", [])
        }
    
    # Thêm view history-based profile nếu có
    if view_profile:
        formatted_user_context["user_profile"]["view_history_based_profile"] = {
            "description": "Dựa trên 50 phòng mới nhất mà người dùng đã xem ít nhất 3 lần",
            "average_price": view_profile.get("avgPrice", 0),
            "average_area": view_profile.get("avgArea", 0),
            "average_room_dimensions": {
                "length": view_profile.get("avgLen", 0),
                "width": view_profile.get("avgWid", 0)
            },
            "average_capacity": view_profile.get("avgCapacity", 0),
            "preferred_amenities": view_profile.get("favConvenientIds", [])
        }
    
    # 3. Build structured prompt
    structured_prompt = {
        "task": "room_comparison",
        "instruction": "So sánh 2 phòng trọ và đưa ra gợi ý phòng tối ưu nhất dựa trên bối cảnh người dùng",
        
        "rooms_to_compare": rooms_to_compare,
        "user_context": formatted_user_context,
        
        "analysis_requirements": {
            "priority_factors": ["Giá cả (Price)", "Độ tiện nghi (Amenities)"],
            "analysis_dimensions": [
                {
                    "dimension": "price_and_area",
                    "requirements": [
                        "So sánh giá thuê tuyệt đối",
                        "So sánh diện tích",
                        "Tính giá trên mỗi m2",
                        "Đánh giá tương quan giá/diện tích",
                        "Cho điểm từ 0-10"
                    ]
                },
                {
                    "dimension": "amenities_comparison",
                    "requirements": [
                        "Liệt kê tiện nghi của mỗi phòng",
                        "Đếm số tiện nghi khớp với sở thích người dùng",
                        "Ưu tiên tiện nghi xuất hiện trong cả 2 profile",
                        "Phân tích mức độ đáp ứng nhu cầu",
                        "Cho điểm từ 0-10"
                    ]
                },
                {
                    "dimension": "location_and_utility",
                    "requirements": [
                        "Đánh giá vị trí địa lý",
                        "Phân tích tiện ích xung quanh",
                        "So sánh khả năng tiếp cận dịch vụ",
                        "Cho điểm từ 0-10"
                    ]
                },
                {
                    "dimension": "total_cost_estimate",
                    "requirements": [
                        "Tính tổng chi phí thực tế hàng tháng",
                        "Bao gồm tiền thuê + phí phụ ước tính (điện, nước, internet)",
                        "Tính chi phí tiềm ẩn (mua nội thất, giặt ủi ngoài...)",
                        "So sánh tổng chi phí 2 phòng"
                    ]
                }
            ],
            "output_requirements": [
                "Phân tích ưu/nhược điểm rõ ràng của từng phòng",
                "Đưa ra gợi ý phòng tối ưu với lý do cụ thể",
                "Tính điểm tổng thể (overall_score) từ 0-10",
                "Nêu trường hợp nên chọn phòng còn lại"
            ]
        },
        
        "output_format": {
            "comparison_analysis": {
                "price_and_area": {
                    "room_1": {"price": "number", "area": "number", "price_per_m2": "number", "score": "0-10"},
                    "room_2": {"price": "number", "area": "number", "price_per_m2": "number", "score": "0-10"},
                    "analysis": "string"
                },
                "amenities_comparison": {
                    "room_1": {"items": ["array"], "match_count": "number", "score": "0-10"},
                    "room_2": {"items": ["array"], "match_count": "number", "score": "0-10"},
                    "analysis": "string"
                },
                "location_and_utility": {
                    "room_1": {"location": "string", "convenience": "string", "score": "0-10"},
                    "room_2": {"location": "string", "convenience": "string", "score": "0-10"},
                    "analysis": "string"
                }
            },
            "total_cost_estimate": {
                "room_1": {"base_rent": "number", "estimated_extra_costs": "number", "total_monthly": "number", "note": "string"},
                "room_2": {"base_rent": "number", "estimated_extra_costs": "number", "total_monthly": "number", "note": "string"}
            },
            "pros_cons": {
                "room_1": {"pros": ["array"], "cons": ["array"]},
                "room_2": {"pros": ["array"], "cons": ["array"]}
            },
            "optimal_choice": {
                "room_id": "string",
                "room_name": "string", 
                "reason": "string",
                "overall_score": "0-10"
            },
            "alternative_scenario": "string"
        },
        
        "guidelines": [
            "Phân tích khách quan dựa trên dữ liệu thực tế",
            "Ưu tiên các tiện nghi xuất hiện trong cả favorite và view history profile",
            "Cân nhắc tổng chi phí thực tế, không chỉ giá thuê",
            "Đưa ra lời khuyên thực tế và hữu ích",
            "Trả về kết quả dưới dạng JSON hợp lệ theo đúng output_format"
        ]
    }
    
    # Convert to JSON string
    return json.dumps(structured_prompt, indent=2, ensure_ascii=False)


def call_gemini_comparison(prompt_text: str, system_instruction: str, model="gemini-2.5-flash"):
    """Gọi Gemini API cho so sánh phòng với JSON response"""
    manager = get_api_manager()
    api_key, key_info = manager.get_next_api_key()
    
    if not api_key:
        return None, "Không có API key nào khả dụng"
        
    logging.info(f"So sánh phòng với key: {key_info['name']} sử dụng model: {model}")
    
    try:
        url = f"{GEMINI_API_BASE}/{model}:generateContent?key={api_key}"
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt_text}]
            }],
            "systemInstruction": {
                "parts": [{"text": system_instruction}]
            },
            "generationConfig": {
                "temperature": 0.4,
                "topK": 32,
                "topP": 1,
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
            manager.record_success(api_key)
            
            # Logging raw response for debugging (truncated)
            logging.info(f"Văn bản phản hồi Gemini (500 ký tự đầu): {text[:500]}...")
            
            # Parse JSON response
            try:
                parsed = json.loads(text)
                return parsed, None
            except json.JSONDecodeError as json_err:
                logging.warning(f"Lỗi phân tích JSON (Trực tiếp): {json_err}. Đang thử làm sạch...")
                
                # Try to extract JSON from response
                original_text = text # Keep original for logging
                
                if '```json' in text:
                    text = text.split('```json')[1].split('```')[0].strip()
                elif '```' in text:
                    text = text.split('```')[1].split('```')[0].strip()
                
                start = text.find('{')
                end = text.rfind('}') + 1
                if start >= 0 and end > start:
                    text = text[start:end]
                
                try:
                    return json.loads(text), None
                except json.JSONDecodeError as e:
                    logging.error(f"Không thể phân tích JSON sau khi làm sạch. Lỗi: {e}")
                    logging.error(f"Văn bản lỗi TOÀN BỘ: {original_text}")
                    return None, f"Lỗi phân tích JSON: {str(e)}"
                
        elif response.status_code == 429:
            manager.record_rate_limit_error(api_key)
            logging.warning(f"Rate limit khi so sánh với {model}")
            return None, f"Key bị rate limit, thử model khác"
            
        else:
            error_msg = f"Lỗi API {response.status_code}: {response.text[:200]}"
            manager.record_error(api_key, error_msg)
            return None, error_msg
            
    except Exception as e:
        manager.record_error(api_key, str(e))
        return None, str(e)


def get_basic_comparison(room1, room2):
    """Fallback: So sánh cơ bản khi AI thất bại"""
    # Tính điểm đơn giản
    price1 = room1.get("price_per_night", room1.get("priceMonth", 0))
    price2 = room2.get("price_per_night", room2.get("priceMonth", 0))
    
    amenities1 = len(room1.get("amenities", room1.get("convenients", [])) or [])
    amenities2 = len(room2.get("amenities", room2.get("convenients", [])) or [])
    
    area1 = room1.get("size_sqm", room1.get("area", 0)) or 0
    area2 = room2.get("size_sqm", room2.get("area", 0)) or 0
    
    # Value score = (area + amenities*5) / price
    score1 = (area1 + amenities1 * 5) / (price1 or 1) * 1000000
    score2 = (area2 + amenities2 * 5) / (price2 or 1) * 1000000
    
    winner = room1 if score1 > score2 else room2
    winner_id = winner.get("room_id", winner.get("id", "room1"))
    
    return {
        "comparison_summary": {
            "winner": winner_id,
            "confidence_score": 60,
            "key_reason": "Dựa trên tính toán cơ bản về giá, diện tích và tiện nghi"
        },
        "recommendation": {
            "recommended_room": winner_id,
            "reasons": [
                f"Giá trị tốt hơn khi xét tổng hợp các yếu tố",
                f"Điểm value: {score1:.2f} vs {score2:.2f}"
            ],
            "special_notes": "Kết quả này dựa trên so sánh cơ bản, không phải AI phân tích chi tiết"
        },
        "fallback": True
    }


@api_gemini_bp.route('/ai_compare_rooms', methods=['POST'])
def ai_compare_rooms():
    """
    API so sánh 2 phòng và đưa ra gợi ý tối ưu sử dụng Gemini AI.
    
    Request body:
    {
        "rooms": [room1, room2],           # 2 phòng cần so sánh
        "favorites": [...],                 # Optional: phòng yêu thích của user
        "user_context": {...}               # Optional: bối cảnh người dùng
    }
    """
    start_time = time.time()
    
    try:
        data = request.get_json()
        logging.info(f"Nhận yêu cầu ai_compare_rooms. Các key của payload: {list(data.keys()) if data else 'None'}")
        
        # 1. Validate input (Support both "options" and "rooms" keys)
        rooms = data.get("options", data.get("rooms", []))
        
        if not rooms or len(rooms) != 2:
            return jsonify({
                "success": False,
                "error": "Cần cung cấp đúng 2 phòng để so sánh (keys: 'options' or 'rooms')"
            }), 400
            
        room1, room2 = rooms[0], rooms[1]
        
        # Extract user context
        user_context = data.get("user_context", {})
        
        # 2. Load prompt config
        prompt_config = load_comparison_prompt()
        if not prompt_config:
            # Fallback nếu không load được config
            logging.warning("Không load được prompt config, sử dụng so sánh cơ bản")
            result = get_basic_comparison(room1, room2)
            return jsonify({
                "success": True,
                "data": result,
                "warning": "Sử dụng so sánh cơ bản do lỗi config",
                "processing_time_ms": int((time.time() - start_time) * 1000)
            })
        
        
        # 3. Build prompt
        system_instruction = prompt_config.get("system_instruction", "")
        
        # Update build_comparison_prompt call (favorites removed)
        prompt = build_comparison_prompt(prompt_config, rooms, user_context)
        logging.info(f"Prompt so sánh đã tạo (Đầy đủ): {prompt}")
        
        # 4. Try multiple models
        models = [
            "gemini-3-flash-preview",
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite",
            "gemini-2.0-flash-lite"
        ]
        
        result = None
        last_error = None
        
        for model in models:
            logging.info(f"Đang thử so sánh phòng với model: {model}")
            result, error = call_gemini_comparison(prompt, system_instruction, model)
            
            if result:
                logging.info("="*50)
                logging.info(f"🟢 [Thành công] Tên model sử dụng: {model}")
                logging.info(f"📝 Prompt gửi cho model:\n{prompt}")
                logging.info(f"✅ Câu trả lời của model trả về:\n{json.dumps(result, indent=2, ensure_ascii=False)}")
                logging.info("="*50)
                break
            else:
                last_error = error
                logging.warning(f"Model {model} thất bại: {error}")
        
        # 5. Return result
        if result:
            processing_time = int((time.time() - start_time) * 1000)
            
            return jsonify({
                "success": True,
                "data": result,
                "meta": {
                    "processing_time_ms": processing_time,
                    "ai_model": model,
                    "timestamp": datetime.now().isoformat()
                }
            })
        else:
            # Fallback to basic comparison
            logging.warning(f"Tất cả model AI đều thất bại, sử dụng so sánh cơ bản. Lỗi cuối cùng: {last_error}")
            fallback_result = get_basic_comparison(room1, room2)
            
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
        logging.error(f"Lỗi So sánh phòng: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
