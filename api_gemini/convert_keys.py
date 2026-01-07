"""
Script chuyển đổi file txt chứa API keys sang định dạng api.json

Format file txt đầu vào (list_api.txt):
-----------------------------------------
mail1@gmail.com Account Name 1
AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX1
AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX2
AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX3
AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX4
AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX5
mail2@gmail.com Account Name 2
AIzaSyYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY1
...

Cách sử dụng:
1. Đặt file list_api.txt vào thư mục api_gemini/
2. Chạy: python api_gemini/convert_keys.py
"""

import json
import os
from datetime import date

def is_valid_api_key(key: str) -> bool:
    """
    Kiểm tra xem chuỗi có phải là API key hợp lệ không.
    Gemini API key bắt đầu bằng 'AIza' và có độ dài khoảng 39 ký tự.
    """
    if not key:
        return False
    key = key.strip()
    # Phải bắt đầu bằng AIza
    if not key.startswith("AIza"):
        return False
    # Độ dài hợp lệ (thường là 39 ký tự)
    if len(key) < 35 or len(key) > 45:
        return False
    # Chỉ chứa ký tự alphanumeric và một số ký tự đặc biệt
    valid_chars = set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_")
    if not all(c in valid_chars for c in key):
        return False
    return True

def parse_txt_to_json(txt_file_path, json_file_path):
    """
    Đọc file txt và chuyển sang định dạng api.json.
    CHỈ thêm các API key thực sự hợp lệ.
    """
    
    accounts = []
    
    try:
        with open(txt_file_path, 'r', encoding='utf-8') as f:
            lines = [line.strip() for line in f if line.strip()]
            
        current_account_header = None
        current_keys = []
        
        for line in lines:
            # Kiểm tra xem dòng có phải là API key hợp lệ không
            if is_valid_api_key(line):
                # Đây là API key thực sự
                current_keys.append(line)
            else:
                # Đây là header (email + tên account)
                # Lưu account trước đó nếu có VÀ có ít nhất 1 key hợp lệ
                if current_account_header is not None and len(current_keys) > 0:
                    accounts.append({
                        "header": current_account_header,
                        "keys": current_keys
                    })
                    current_keys = []
                elif current_account_header is not None:
                    print(f"⚠️  Bỏ qua account '{current_account_header[:30]}...' vì không có key hợp lệ")
                    current_keys = []
                
                current_account_header = line
                     
        # Lưu account cuối cùng nếu có keys hợp lệ
        if current_account_header is not None and len(current_keys) > 0:
            accounts.append({
                "header": current_account_header,
                "keys": current_keys
            })
            
    except Exception as e:
        print(f"❌ Lỗi đọc file txt: {e}")
        return

    if len(accounts) == 0:
        print("❌ Không tìm thấy account nào có API key hợp lệ!")
        print("   API key hợp lệ phải bắt đầu bằng 'AIza' và có độ dài ~39 ký tự")
        return

    print(f"📋 Đã tìm thấy {len(accounts)} accounts với keys hợp lệ:")
    for i, acc in enumerate(accounts):
        print(f"   Account {i+1}: {acc['header'][:40]}... ({len(acc['keys'])} keys)")

    # Tạo cấu trúc JSON đích
    target_data = {
        "settings": {
            "global_cooldown_seconds": 65,
            "default_rpm_limit": 15,
            "max_rpd_limit": 1500,
            "rotation_strategy": "horizontal_sweep",
            "retry_exhausted_after_hours": 24,
            "delay_between_requests_ms": 1000
        },
        "rotation_state": {
            "current_project_index": 0,
            "current_account_index": 0,
            "total_requests_sent": 0,
            "rotation_round": 1,
            "last_daily_reset": str(date.today())
        },
        "accounts": []
    }
    
    # Xử lý từng account
    formatted_accounts = []
    for idx, acc in enumerate(accounts):
        header = acc["header"]
        keys = acc["keys"]
        
        # Tách email từ header
        parts = header.split()
        email = ""
        for part in parts:
            if "@" in part:
                email = part
                break
        
        account_id = f"acc_{idx+1:02d}"
        
        # Tạo projects CHỈ từ các keys hợp lệ
        projects = []
        for p_idx, key in enumerate(keys):
            # Double check key validity
            if not is_valid_api_key(key):
                continue
                
            projects.append({
                "project_index": p_idx,
                "project_name": f"Project-{p_idx+1}",
                "api_key": key,
                "status": "available",
                "stats": {
                    "total_requests_today": 0,
                    "success_count": 0,
                    "error_count": 0,
                    "last_success_timestamp": None,
                    "last_error_message": None
                },
                "limit_tracking": {
                    "last_used_timestamp": None,
                    "minute_request_count": 0,
                    "rate_limit_reset_at": None,
                    "daily_limit_reset_at": None
                }
            })
        
        # Chỉ thêm account nếu có ít nhất 1 project với key hợp lệ
        if len(projects) > 0:
            formatted_accounts.append({
                "account_id": account_id,
                "email": email,
                "account_name": header,
                "account_status": "active",
                "projects": projects
            })
        
    target_data["accounts"] = formatted_accounts
    
    if len(formatted_accounts) == 0:
        print("❌ Không có account nào có key hợp lệ để ghi!")
        return
    
    # Ghi ra file JSON
    try:
        with open(json_file_path, 'w', encoding='utf-8') as f:
            json.dump(target_data, f, indent=4, ensure_ascii=False)
        
        total_keys = sum(len(acc["projects"]) for acc in formatted_accounts)
        print(f"\n✅ Đã chuyển đổi thành công!")
        print(f"   - Số accounts: {len(formatted_accounts)}")
        print(f"   - Tổng số keys hợp lệ: {total_keys}")
        print(f"   - File output: {json_file_path}")
        
    except Exception as e:
        print(f"❌ Lỗi ghi file JSON: {e}")


if __name__ == "__main__":
    # Đường dẫn file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    txt_path = os.path.join(script_dir, "list_api.txt")
    json_path = os.path.join(script_dir, "api.json")
    
    print("="*50)
    print("🔄 CONVERT API KEYS TXT -> JSON")
    print("="*50)
    print(f"📂 Input:  {txt_path}")
    print(f"📂 Output: {json_path}")
    print()
    
    if not os.path.exists(txt_path):
        print(f"❌ File {txt_path} không tồn tại!")
        print(f"📝 Vui lòng tạo file list_api.txt và paste API keys vào.")
        print(f"\nFormat yêu cầu:")
        print("   email@gmail.com Account Name")
        print("   AIzaSy...key1")
        print("   AIzaSy...key2")
        print("   ...")
    else:
        parse_txt_to_json(txt_path, json_path)
