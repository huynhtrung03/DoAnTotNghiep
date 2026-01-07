"""
API Configuration - Quản lý state của API keys
- API Keys: Hardcoded trong api_keys.py (bundle vào EXE)
- State (status, stats): Lưu trong AppData/AppDesktop/api_state.json
"""

import os
import sys
import json
import logging
from datetime import datetime





def get_state_file_path() -> str:
    """Lấy đường dẫn file state"""
    # Lấy đường dẫn file hiện tại (core/api_config.py)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Lấy thư mục cha (api_gemini)
    parent_dir = os.path.dirname(current_dir)
    return os.path.join(parent_dir, "api.json")


# Default settings
DEFAULT_SETTINGS = {
    "global_cooldown_seconds": 65,
    "default_rpm_limit": 15,
    "max_rpd_limit": 1500,
    "rotation_strategy": "horizontal_sweep",
    "retry_exhausted_after_hours": 24,
    "delay_between_requests_ms": 1000
}

DEFAULT_ROTATION_STATE = {
    "current_project_index": 0,
    "current_account_index": 0,
    "total_requests_sent": 0,
    "rotation_round": 1,
    "last_daily_reset": None
}


def create_default_project_state() -> dict:
    """Tạo state mặc định cho 1 project"""
    return {
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
    }


def create_default_account_state(account_id: str, num_projects: int = 5) -> dict:
    """Tạo state mặc định cho 1 account"""
    return {
        "account_id": account_id,
        "account_status": "active",
        "projects": [
            {
                "project_index": i,
                **create_default_project_state()
            }
            for i in range(num_projects)
        ]
    }



def load_embedded_keys() -> list:
    """Load API keys từ file api.json ở thư mục cha"""
    try:
        # Lấy đường dẫn file hiện tại (core/api_config.py)
        current_dir = os.path.dirname(os.path.abspath(__file__))
        # Lấy thư mục cha (api_gemini)
        parent_dir = os.path.dirname(current_dir)
        api_path = os.path.join(parent_dir, "api.json")
        
        if not os.path.exists(api_path):
            logging.error(f"File api.json không tồn tại: {api_path}")
            return []
            
        with open(api_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        # Trả về list accounts
        if "accounts" in data:
            return data["accounts"]
        elif "keys" in data:
            # Convert legacy format to accounts format if needed
            # For now, just return empty or handle legacy conversion elsewhere
            logging.warning("api.json đang ở format cũ (keys), vui lòng cập nhật sang format accounts")
            return []
            
        return []
    except Exception as e:
        logging.error(f"Lỗi đọc api.json: {e}")
        return []


def load_api_state() -> dict:
    """
    Load state từ file AppData.
    Nếu file không tồn tại, tạo mới từ embedded keys.
    """
    state_path = get_state_file_path()
    
    if os.path.exists(state_path):
        try:
            with open(state_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logging.error(f"Lỗi đọc api_state.json: {e}")
    
    # Tạo state mới từ embedded keys
    return create_fresh_state()


def create_fresh_state() -> dict:
    """Tạo state mới từ embedded keys"""
    embedded_keys = load_embedded_keys()
    
    accounts_state = []
    for i, acc in enumerate(embedded_keys):
        num_projects = len(acc.get("projects", []))
        accounts_state.append(create_default_account_state(f"acc_{i+1:02d}", num_projects))
    
    return {
        "settings": DEFAULT_SETTINGS.copy(),
        "rotation_state": DEFAULT_ROTATION_STATE.copy(),
        "accounts": accounts_state
    }


def save_api_state(state: dict) -> bool:
    """Lưu state vào file AppData"""
    state_path = get_state_file_path()
    
    try:
        with open(state_path, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=4, ensure_ascii=False)
        return True
    except Exception as e:
        logging.error(f"Lỗi lưu api_state.json: {e}")
        return False


def get_merged_config() -> dict:
    """
    Load config trực tiếp từ api.json.
    Không cần merge với AppData state nữa - api.json là nguồn duy nhất.
    """
    try:
        # Lấy đường dẫn file api.json
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(current_dir)
        api_path = os.path.join(parent_dir, "api.json")
        
        if not os.path.exists(api_path):
            logging.error(f"File api.json không tồn tại: {api_path}")
            return {
                "settings": DEFAULT_SETTINGS.copy(),
                "rotation_state": DEFAULT_ROTATION_STATE.copy(),
                "accounts": []
            }
            
        with open(api_path, "r", encoding="utf-8") as f:
            config = json.load(f)
        
        # Đảm bảo có đủ các trường cần thiết
        if "settings" not in config:
            config["settings"] = DEFAULT_SETTINGS.copy()
        if "rotation_state" not in config:
            config["rotation_state"] = DEFAULT_ROTATION_STATE.copy()
        if "accounts" not in config:
            config["accounts"] = []
            
        # Log để debug
        total_keys = sum(len(acc.get("projects", [])) for acc in config.get("accounts", []))
        available_keys = sum(
            1 for acc in config.get("accounts", []) 
            for proj in acc.get("projects", []) 
            if proj.get("api_key") and proj.get("status", "available") == "available"
        )
        logging.info(f"Loaded {len(config.get('accounts', []))} accounts, {total_keys} projects, {available_keys} available keys")
        
        return config
        
    except Exception as e:
        logging.error(f"Lỗi load api.json: {e}")
        return {
            "settings": DEFAULT_SETTINGS.copy(),
            "rotation_state": DEFAULT_ROTATION_STATE.copy(),
            "accounts": []
        }


def save_state_from_config(config: dict) -> bool:
    """
    Lưu config đầy đủ (bao gồm cả api_key) vào file api.json.
    """
    state = {
        "settings": config.get("settings", {}),
        "rotation_state": config.get("rotation_state", {}),
        "accounts": []
    }
    
    for acc in config.get("accounts", []):
        acc_state = {
            "account_id": acc.get("account_id"),
            "email": acc.get("email", ""),
            "account_name": acc.get("account_name", ""),
            "account_status": acc.get("account_status", "active"),
            "projects": []
        }
        
        for j, proj in enumerate(acc.get("projects", [])):
            proj_state = {
                "project_index": j,
                "project_name": proj.get("project_name", f"Project-{j+1}"),
                "api_key": proj.get("api_key", ""),  # QUAN TRỌNG: Giữ api_key!
                "status": proj.get("status", "available"),
                "stats": proj.get("stats", {}),
                "limit_tracking": proj.get("limit_tracking", {})
            }
            acc_state["projects"].append(proj_state)
        
        state["accounts"].append(acc_state)
    
    return save_api_state(state)

