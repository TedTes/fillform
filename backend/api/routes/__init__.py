"""
API route blueprints.
"""

from .submission_routes import submission_bp
from .health_routes import health_bp

__all__ = ['submission_bp', 'health_bp']