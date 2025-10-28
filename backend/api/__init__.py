"""
API initialization and configuration.
"""

from flask import Flask
from flask_cors import CORS
import os

def create_app():
    """
    Create and configure Flask application.
    
    Returns:
        Configured Flask app
    """
    app = Flask(__name__)
    # Enable CORS for frontend
    CORS(app, resources={
        r"/api/*": {
            "origins": os.environ.get("CORS_ORIGINS","http://localhost:5000"), 
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })
    # Configuration
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
    app.config['UPLOAD_FOLDER'] = 'storage/uploads'
    app.config['OUTPUT_FOLDER'] = 'storage/outputs'
    
    # Create storage directories
    os.makedirs('storage/uploads', exist_ok=True)
    os.makedirs('storage/outputs', exist_ok=True)
    os.makedirs('storage/data', exist_ok=True)
    os.makedirs('storage/folders', exist_ok=True)
    
    # Register blueprints
    from .routes.submission_routes import submission_bp
    from .routes.folder_routes import folder_bp
    from .routes.health_routes import health_bp
    
    app.register_blueprint(submission_bp, url_prefix='/api')
    app.register_blueprint(folder_bp, url_prefix='/api')
    app.register_blueprint(health_bp, url_prefix='/api')
    
    @app.route('/')
    def index():
        return {
            'message': 'ACORD Extraction API',
            'status': 'running',
            'endpoints': {
                'health': '/api/health',
                'ready': '/api/ready',
                'submissions': '/api/submissions',
                'folders': '/api/folders'
            }
        }
    
    return app