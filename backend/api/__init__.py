"""
API layer for AutoFil application.
"""

from flask import Flask
from flask_cors import CORS


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
            "origins": ["http://localhost:3000"],  # Next.js dev server
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })
    
    # Configuration
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    app.config['UPLOAD_FOLDER'] = 'storage/uploads'
    app.config['OUTPUT_FOLDER'] = 'storage/outputs'
    app.config['TEMPLATE_FOLDER'] = 'templates'
    
    # Register blueprints
    from .routes.submission_routes import submission_bp
    from .routes.health_routes import health_bp
    from .routes.folder_routes import folder_bp
    
    app.register_blueprint(submission_bp, url_prefix='/api')
    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(folder_bp, url_prefix='/api')
    
    return app