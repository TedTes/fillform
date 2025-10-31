"""
Submission API routes.

Endpoints for uploading, extracting, filling, and downloading ACORD forms.
"""

import os
import json
import shutil
from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
from services.submission_service import SubmissionService

submission_bp = Blueprint('submissions', __name__)
submission_service = SubmissionService()


@submission_bp.route('/submissions/upload', methods=['POST'])
def upload_pdf():
    """
    Upload PDF(s) and extract data.
    
    Supports both single and multiple file uploads.
    
    Request:
        - file or files[]: PDF file(s) (multipart/form-data)
        - folder_id: Optional folder ID (form data)
    
    Returns:
        JSON with submission_id(s) and extracted data
    """
    # Get optional folder_id
    folder_id = request.form.get('folder_id')
    
    # Check for single file upload (backward compatible)
    if 'file' in request.files:
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Only PDF files are allowed'}), 400
        
        try:
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
    
    # Check for multiple file upload
    files = request.files.getlist('files[]')
    
    if not files or len(files) == 0:
        return jsonify({'error': 'No files provided'}), 400
    
    # Process multiple files
    results = []
    errors = []
    
    for idx, file in enumerate(files):
        if file.filename == '':
            errors.append({
                'index': idx,
                'filename': 'unnamed',
                'error': 'No file selected'
            })
            continue
        
        if not file.filename.lower().endswith('.pdf'):
            errors.append({
                'index': idx,
                'filename': file.filename,
                'error': 'Only PDF files are allowed'
            })
            continue
        
        try:
            result = submission_service.upload_and_extract(file, folder_id)
            results.append({
                'index': idx,
                'filename': file.filename,
                'submission_id': result['submission_id'],
                'extraction': {
                    'confidence': result['confidence'],
                    'warnings': result['warnings'],
                    'data': result['data']
                }
            })
        except Exception as e:
            errors.append({
                'index': idx,
                'filename': file.filename,
                'error': str(e)
            })
    
    # Return results
    return jsonify({
        'success': len(results) > 0,
        'total': len(files),
        'successful': len(results),
        'failed': len(errors),
        'results': results,
        'errors': errors if errors else None
    }), 201 if len(results) > 0 else 400


@submission_bp.route('/submissions/batch-fill', methods=['POST'])
def batch_fill_pdfs():
    """
    Fill multiple PDFs with extracted data.
    
    Request Body:
        {
            "submission_ids": ["id1", "id2", "id3"]
        }
    
    Returns:
        JSON with fill reports for each submission
    """
    try:
        data = request.get_json()
        
        if not data or 'submission_ids' not in data:
            return jsonify({'error': 'submission_ids array is required'}), 400
        
        submission_ids = data['submission_ids']
        
        if not isinstance(submission_ids, list) or len(submission_ids) == 0:
            return jsonify({'error': 'submission_ids must be a non-empty array'}), 400
        
        results = []
        errors = []
        
        for submission_id in submission_ids:
            try:
                fill_report = submission_service.fill_pdf(submission_id)
                results.append({
                    'submission_id': submission_id,
                    'fill_report': {
                        'written': fill_report['written'],
                        'skipped': fill_report['skipped'],
                        'warnings': fill_report.get('notes', [])
                    },
                    'download_url': f'/api/submissions/{submission_id}/download'
                })
            except Exception as e:
                errors.append({
                    'submission_id': submission_id,
                    'error': str(e)
                })
        
        return jsonify({
            'success': len(results) > 0,
            'total': len(submission_ids),
            'successful': len(results),
            'failed': len(errors),
            'results': results,
            'errors': errors if errors else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@submission_bp.route('/submissions/<submission_id>', methods=['GET'])
def get_submission(submission_id):
    """
    Get submission data with field-level confidence and guidance.
    """
    try:
        submission = submission_service.get_submission(submission_id)
        
        if not submission:
            return jsonify({'error': 'Submission not found'}), 404
        
        # Load field confidence and guidance
        metadata_path = os.path.join('storage/data', f"{submission_id}_meta.json")
        
        field_confidence = {}
        field_hints = {}
        extraction_issues = {}
        suggested_fixes = {}
        
        if os.path.exists(metadata_path):
            import json
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
                field_confidence = metadata.get('field_confidence', {})
                field_hints = metadata.get('field_hints', {})
                extraction_issues = metadata.get('extraction_issues', {})
                suggested_fixes = metadata.get('suggested_fixes', {})
        
        return jsonify({
            'success': True,
            'submission': {
                **submission,
                'field_confidence': field_confidence,
                'field_hints': field_hints,
                'extraction_issues': extraction_issues,
                'suggested_fixes': suggested_fixes,
            }
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
            # Debug: print the path being checked
            print(f"File not found: {file_path}")
            print(f"Current directory: {os.getcwd()}")
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(
            file_path,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='ACORD_126_filled.pdf'
        )
        
    except Exception as e:
        print(f"Download error: {str(e)}")  # Add debug logging
        return jsonify({'error': str(e)}), 500


@submission_bp.route('/submissions/batch-download', methods=['POST'])
def batch_download_pdfs():
    """
    Download multiple filled PDFs as a ZIP file.
    
    Request Body:
        {
            "submission_ids": ["id1", "id2", "id3"]
        }
    
    Returns:
        ZIP file containing all filled PDFs
    """
    try:
        data = request.get_json()
        
        if not data or 'submission_ids' not in data:
            return jsonify({'error': 'submission_ids array is required'}), 400
        
        submission_ids = data['submission_ids']
        
        if not isinstance(submission_ids, list) or len(submission_ids) == 0:
            return jsonify({'error': 'submission_ids must be a non-empty array'}), 400
        
        import zipfile
        import io
        
        # Create ZIP in memory
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for submission_id in submission_ids:
                try:
                    file_path = submission_service.get_output_path(submission_id)
                    
                    if os.path.exists(file_path):
                        # Get submission metadata for filename
                        submission = submission_service.get_submission(submission_id)
                        filename = f"{submission['filename'].replace('.pdf', '')}_filled.pdf"
                        
                        # Add to ZIP
                        zip_file.write(file_path, filename)
                except Exception as e:
                    print(f"Error adding {submission_id} to ZIP: {e}")
                    continue
        
        zip_buffer.seek(0)
        
        return send_file(
            zip_buffer,
            mimetype='application/zip',
            as_attachment=True,
            download_name='filled_pdfs.zip'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@submission_bp.route('/submissions/<submission_id>', methods=['DELETE'])
def delete_submission(submission_id):
    """
    Delete a submission and its files.
    
    Args:
        submission_id: Submission identifier
    
    Returns:
        JSON with success status
    """
    try:
        # Get submission metadata
        metadata_path = os.path.join('storage/data', f"{submission_id}_meta.json")
        data_path = os.path.join('storage/data', f"{submission_id}.json")
        
        # if not os.path.exists(metadata_path):
        #     return jsonify({'error': 'Submission not found'}), 404
        
        # Load metadata to find file paths
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        # Delete input file
        if 'upload_path' in metadata and os.path.exists(metadata['upload_path']):
            os.remove(metadata['upload_path'])
            print(f"Deleted input: {metadata['upload_path']}")
        
        # Delete output file
        if 'output_path' in metadata and os.path.exists(metadata['output_path']):
            os.remove(metadata['output_path'])
            print(f"Deleted output: {metadata['output_path']}")
        
        # Delete metadata files
        if os.path.exists(metadata_path):
            os.remove(metadata_path)
        if os.path.exists(data_path):
            os.remove(data_path)
        
        # Update folder metadata
        folder_id = metadata.get('folder_id')
        if folder_id:
            from services.folder_service import FolderService
            folder_service = FolderService()
            folder = folder_service.get_folder(folder_id)
            
            if folder:
                # Remove submission from folder's submissions list
                folder['submissions'] = [
                    s for s in folder.get('submissions', [])
                    if s['submission_id'] != submission_id
                ]
                folder['file_count'] = len(folder['submissions'])
                
                # Save updated metadata
                folder_path = folder_service.get_folder_path(folder_id)
                metadata_file = os.path.join(folder_path, 'metadata.json')
                with open(metadata_file, 'w') as f:
                    json.dump(folder, f, indent=2)
        
        return jsonify({
            'success': True,
            'message': 'Submission deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500



@submission_bp.route('/submissions/<submission_id>/preview-input', methods=['GET'])
def preview_input_pdf(submission_id):
    """
    Preview input PDF (for iframe).
    
    Args:
        submission_id: Submission identifier
    
    Returns:
        PDF file for preview (inline, not download)
    """
    try:
        # Get backend root directory
        backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        
        # Load metadata
        metadata_path = os.path.join(backend_root, 'storage', 'data', f"{submission_id}_meta.json")
        
        if not os.path.exists(metadata_path):
            print(f"Metadata not found: {metadata_path}")
            return jsonify({'error': 'Submission not found'}), 404
        
        import json
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        file_path = metadata.get('upload_path')
        
        if not file_path:
            return jsonify({'error': 'File path not found in metadata'}), 404
        
        # Convert to absolute path if relative
        if not os.path.isabs(file_path):
            file_path = os.path.join(backend_root, file_path)
        
        print(f"Looking for file at: {file_path}")
        
        if not os.path.exists(file_path):
            return jsonify({'error': f'File not found: {file_path}'}), 404
        
        # Return PDF inline for preview
        from flask import Response
        with open(file_path, 'rb') as f:
            pdf_data = f.read()
        
        response = Response(pdf_data, mimetype='application/pdf')
        response.headers['Content-Disposition'] = 'inline'
        response.headers['Content-Type'] = 'application/pdf'
        return response
        
    except Exception as e:
        print(f"Preview error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@submission_bp.route('/submissions/<submission_id>/preview-output', methods=['GET'])
def preview_output_pdf(submission_id):
    """
    Preview output PDF (for iframe).
    
    Args:
        submission_id: Submission identifier
    
    Returns:
        PDF file for preview (inline, not download)
    """
    try:
        # Get backend root directory
        backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        
        # Get output path using service
        file_path = submission_service.get_output_path(submission_id)
        
        # Ensure absolute path
        if not os.path.isabs(file_path):
            file_path = os.path.join(backend_root, file_path)
        
        print(f"Looking for output file at: {file_path}")
        
        if not os.path.exists(file_path):
            return jsonify({'error': f'File not found: {file_path}'}), 404
        
        # Return PDF inline for preview
        from flask import Response
        with open(file_path, 'rb') as f:
            pdf_data = f.read()
        
        response = Response(pdf_data, mimetype='application/pdf')
        response.headers['Content-Disposition'] = 'inline'
        response.headers['Content-Type'] = 'application/pdf'
        return response
        
    except Exception as e:
        print(f"Preview error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500