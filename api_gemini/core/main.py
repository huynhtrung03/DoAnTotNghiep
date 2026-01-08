import sys
import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import logging

# Config logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load .env from parent directory (api_gemini/.env)
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
env_path = os.path.join(parent_dir, ".env")
load_dotenv(env_path)

# Add current directory to path to support imports
if current_dir not in sys.path:
    sys.path.append(current_dir)

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Import Blueprints
    try:
        from api_gemini import api_gemini_bp
        app.register_blueprint(api_gemini_bp)
        logging.info("Registered api_gemini_bp")
    except ImportError as e:
        logging.error(f"Could not import api_gemini_bp: {e}")
    
    # Import Personalized API Blueprint
    try:
        from api_gemini_personalized import api_gemini_personalized_bp
        app.register_blueprint(api_gemini_personalized_bp)
        logging.info("Registered api_gemini_personalized_bp")
    except ImportError as e:
        logging.error(f"Could not import api_gemini_personalized_bp: {e}")

    @app.route('/')
    def index():
        return jsonify({
            "status": "running", 
            "service": "Gemini API Core",
            "message": "Use /ai_chatbot or /api/health"
        })

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv("PORT", 5001))
    logging.info(f"Starting server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=True)
