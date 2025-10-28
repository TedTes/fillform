"""
API routes initialization.
"""

from .submission_routes import submission_bp
from .folder_routes import folder_bp
from .health_routes import health_bp

__all__ = ['submission_bp', 'folder_bp', 'health_bp']