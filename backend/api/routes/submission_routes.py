"""
Submission API routes.

Endpoints for uploading, extracting, filling, and downloading ACORD forms.
"""

import os
from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
from services.submission_service import SubmissionService

submission_bp = Blueprint('submissions', __name__)
submission_service = SubmissionService()


@submission_bp.route('/submissions/upload', methods=['POST'])
def upload_pdf():
    """
    Upload PDF and extract data.
    
    Request:
        - file: PDF file (multipart/form-data)
        - folder_id: Optional folder ID (form data)
    
    Returns:
        JSON with submission_id and extracted data
    """
    # Check if file is present
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    # Check if file is selected
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Check file extension
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are allowed'}), 400
    
    # Get optional folder_id
    folder_id = request.form.get('folder_id')
    
    try:
        # Process upload and extraction
        result = submission_service.upload_and_extract(file, folder_id)
        
        return jsonify({
            'success': True,
            'submission_id': result['submission_id'],
            'extraction': {
                'confidence': result['confidence'],
                'warnings': result['warnings'],
                'data': result['data']
            }
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500


@submission_bp.route('/submissions/<submission_id>', methods=['GET'])
def get_submission(submission_id):
    """
    Get submission data.
    
    Args:
        submission_id: Submission identifier
    
    Returns:
        JSON with submission details
    """
    try:
        submission = submission_service.get_submission(submission_id)
        
        if not submission:
            return jsonify({'error': 'Submission not found'}), 404
        
        return jsonify({
            'success': True,
            'submission': submission
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@submission_bp.route('/submissions/<submission_id>', methods=['PUT'])
def update_submission(submission_id):
    """
    Update submission data.
    
    Args:
        submission_id: Submission identifier
    
    Request Body:
        JSON data to update
    
    Returns:
        JSON with updated submission
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        result = submission_service.update_data(submission_id, data)
        
        return jsonify({
            'success': True,
            'submission': result
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@submission_bp.route('/submissions/<submission_id>/fill', methods=['POST'])
def fill_pdf(submission_id):
    """
    Fill PDF with extracted data.
    
    Args:
        submission_id: Submission identifier
    
    Returns:
        JSON with fill report and download URL
    """
    try:
        result = submission_service.fill_pdf(submission_id)
        
        return jsonify({
            'success': True,
            'fill_report': {
                'written': result['written'],
                'skipped': result['skipped'],
                'warnings': result.get('notes', [])
            },
            'download_url': f'/api/submissions/{submission_id}/download'
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Fill failed: {str(e)}'}), 500


@submission_bp.route('/submissions/<submission_id>/download', methods=['GET'])
def download_pdf(submission_id):
    """
    Download filled PDF.
    
    Args:
        submission_id: Submission identifier
    
    Returns:
        PDF file
    """
    try:
        file_path = submission_service.get_output_path(submission_id)
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(
            file_path,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='ACORD_126_filled.pdf'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500