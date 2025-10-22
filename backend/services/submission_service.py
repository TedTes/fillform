"""
Submission service - orchestrates extraction and filling workflow.
"""

import os
import uuid
import json
from datetime import datetime
from werkzeug.utils import secure_filename
from extraction.extractors import Acord126Extractor
from filling.fillers import Acord126Filler


class SubmissionService:
    """
    Service for managing submission workflow.
    
    Coordinates:
    - File upload and storage
    - Data extraction
    - PDF filling
    - File retrieval
    """
    
    def __init__(self):
        """Initialize service with paths."""
        self.storage_dir = 'storage'
        self.uploads_dir = os.path.join(self.storage_dir, 'uploads')
        self.outputs_dir = os.path.join(self.storage_dir, 'outputs')
        self.data_dir = os.path.join(self.storage_dir, 'data')
        self.folders_dir = os.path.join(self.storage_dir, 'folders')
        self.template_path = 'templates/ACORD_126.pdf'
        
        # Create directories if they don't exist
        os.makedirs(self.uploads_dir, exist_ok=True)
        os.makedirs(self.outputs_dir, exist_ok=True)
        os.makedirs(self.data_dir, exist_ok=True)
        os.makedirs(self.folders_dir, exist_ok=True)
        # Initialize extractor and filler
        self.extractor = Acord126Extractor()
        self.filler = Acord126Filler()
    
    def upload_and_extract(self, file, folder_id: str = None):
        """
        Upload PDF and extract data.
        
        Args:
            file: FileStorage object from Flask request
            folder_id: Optional folder ID to store in
        
        Returns:
            Dictionary with submission_id, extracted data, and metadata
        """
        # Generate unique submission ID
        submission_id = str(uuid.uuid4())
        
        # Determine storage path
        if folder_id:
            # Store in folder structure
            from services.folder_service import FolderService
            folder_service = FolderService()
            upload_dir = folder_service.get_inputs_path(folder_id)
        else:
            # Store in legacy uploads directory
            upload_dir = self.uploads_dir
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        upload_path = os.path.join(upload_dir, f"{submission_id}_{filename}")
        file.save(upload_path)
        
        # Extract data
        extraction_result = self.extractor.extract(upload_path)
        
        if not extraction_result.is_successful():
            raise ValueError(f"Extraction failed: {extraction_result.error}")
        
        # Save extracted JSON
        data_path = os.path.join(self.data_dir, f"{submission_id}.json")
        with open(data_path, 'w') as f:
            json.dump(extraction_result.json, f, indent=2)
        
        # Save submission metadata
        metadata = {
            'submission_id': submission_id,
            'folder_id': folder_id,
            'filename': filename,
            'upload_path': upload_path,
            'data_path': data_path,
            'uploaded_at': datetime.utcnow().isoformat(),
            'status': 'extracted',
            'confidence': extraction_result.confidence,
            'warnings': extraction_result.warnings
        }
        
        metadata_path = os.path.join(self.data_dir, f"{submission_id}_meta.json")
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        # Add to folder if folder_id provided
        if folder_id:
            from services.folder_service import FolderService
            folder_service = FolderService()
            folder_service.add_submission(folder_id, submission_id, filename)
        
        return {
            'submission_id': submission_id,
            'confidence': extraction_result.confidence,
            'warnings': extraction_result.warnings,
            'data': extraction_result.json
        }
    
    def get_submission(self, submission_id: str):
        """
        Get submission data.
        
        Args:
            submission_id: Submission identifier
        
        Returns:
            Dictionary with submission details
        """
        metadata_path = os.path.join(self.data_dir, f"{submission_id}_meta.json")
        data_path = os.path.join(self.data_dir, f"{submission_id}.json")
        
        if not os.path.exists(metadata_path):
            return None
        
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        with open(data_path, 'r') as f:
            data = json.load(f)
        
        return {
            'submission_id': submission_id,
            'folder_id': metadata.get('folder_id'),
            'filename': metadata['filename'],
            'status': metadata['status'],
            'uploaded_at': metadata['uploaded_at'],
            'confidence': metadata.get('confidence'),
            'warnings': metadata.get('warnings', []),
            'data': data
        }
    
    def update_data(self, submission_id: str, data):
        """
        Update submission data.
        
        Args:
            submission_id: Submission identifier
            data: Updated JSON data
        
        Returns:
            Updated submission
        """
        data_path = os.path.join(self.data_dir, f"{submission_id}.json")
        
        if not os.path.exists(data_path):
            raise ValueError("Submission not found")
        
        # Save updated data
        with open(data_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        return self.get_submission(submission_id)
    
    def fill_pdf(self, submission_id: str):
        """
        Fill PDF with data.
        
        Args:
            submission_id: Submission identifier
        
        Returns:
            Fill report
        """
        # Load metadata
        metadata_path = os.path.join(self.data_dir, f"{submission_id}_meta.json")
        
        if not os.path.exists(metadata_path):
            raise ValueError("Submission not found")
        
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        # Load data
        data_path = os.path.join(self.data_dir, f"{submission_id}.json")
        
        with open(data_path, 'r') as f:
            data = json.load(f)
        
        # Check template exists
        if not os.path.exists(self.template_path):
            raise ValueError(f"Template not found: {self.template_path}")
        
        # Determine output path
        folder_id = metadata.get('folder_id')
        if folder_id:
            from services.folder_service import FolderService
            folder_service = FolderService()
            output_dir = folder_service.get_outputs_path(folder_id)
        else:
            output_dir = self.outputs_dir
        
        # Fill PDF
        output_path = os.path.join(output_dir, f"{submission_id}_filled.pdf")
        fill_report = self.filler.fill(self.template_path, data, output_path)
        
        # Update metadata
        metadata['status'] = 'filled'
        metadata['output_path'] = output_path
        metadata['filled_at'] = datetime.utcnow().isoformat()
        metadata['fill_report'] = fill_report
        
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        return fill_report
    
    def get_output_path(self, submission_id: str):
        """
        Get output PDF path.
        
        Args:
            submission_id: Submission identifier
        
        Returns:
            Path to filled PDF
        """
        # Check metadata for folder-based path
        metadata_path = os.path.join(self.data_dir, f"{submission_id}_meta.json")
        
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
            
            if 'output_path' in metadata:
                output_path =  metadata['output_path']
                if not os.path.isabs(output_path):
                    backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                    output_path = os.path.join(backend_root, output_path)
                return output_path
        # Fallback to legacy path
        output_path = os.path.join(self.outputs_dir, f"{submission_id}_filled.pdf")
        return output_path