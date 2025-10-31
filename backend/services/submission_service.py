"""
Submission service - orchestrates extraction and filling workflow.
"""

import os
import uuid
import json
from typing import Optional,Dict,Any
from datetime import datetime
from werkzeug.utils import secure_filename
from extraction.extractors import Acord126Extractor
from filling.fillers import Acord126Filler
from services.client_service import ClientService
from lib.submission_templates import get_template, TEMPLATES
from services.version_service import VersionService
from services.comparison_service import ComparisonService
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
        self.client_service = ClientService()
        # Create directories if they don't exist
        os.makedirs(self.uploads_dir, exist_ok=True)
        os.makedirs(self.outputs_dir, exist_ok=True)
        os.makedirs(self.data_dir, exist_ok=True)
        os.makedirs(self.folders_dir, exist_ok=True)
        # Initialize extractor and filler
        self.extractor = Acord126Extractor()
        self.filler = Acord126Filler()
        self.version_service = VersionService(self.storage_dir)
        self.comparison_service = ComparisonService(self.storage_dir)
    
    def upload_and_extract(self, file, folder_id: str = None, progress_callback=None):
        """
        Upload PDF and extract data with progress tracking.
        
        Args:
            file: FileStorage object from Flask request
            folder_id: Optional folder ID to store in
            progress_callback: Optional callback for progress updates
        
        Returns:
            Dictionary with submission_id, extracted data, and metadata
        """
        # Generate unique submission ID
        submission_id = str(uuid.uuid4())
        
        # Progress: 0% - Starting
        if progress_callback:
            progress_callback(submission_id, 0, 'starting', 'Initializing upload...')
        
        # Determine storage path
        if folder_id:
            # Store in folder structure
            from services.folder_service import FolderService
            folder_service = FolderService()
            upload_dir = folder_service.get_inputs_path(folder_id)
        else:
            # Store in legacy uploads directory
            upload_dir = self.uploads_dir
        
        # Progress: 10% - Saving file
        if progress_callback:
            progress_callback(submission_id, 10, 'uploading', 'Saving file...')
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        upload_path = os.path.join(upload_dir, f"{submission_id}_{filename}")
        file.save(upload_path)
        
        # Progress: 30% - File saved
        if progress_callback:
            progress_callback(submission_id, 30, 'uploaded', 'File saved successfully')
        
        # Progress: 40% - Starting extraction
        if progress_callback:
            progress_callback(submission_id, 40, 'extracting', 'Analyzing document...')
        
        # Extract data
        extraction_result = self.extractor.extract(upload_path)
        
        # Progress: 70% - Extraction complete
        if progress_callback:
            progress_callback(submission_id, 70, 'extracting', 'Processing fields...')
        
        if not extraction_result.is_successful():
            if progress_callback:
                progress_callback(submission_id, 100, 'error', f'Extraction failed: {extraction_result.error}')
            raise ValueError(f"Extraction failed: {extraction_result.error}")
        
        # Progress: 80% - Saving data
        if progress_callback:
            progress_callback(submission_id, 80, 'extracting', 'Saving extracted data...')
        
        version_id = self.version_service.create_version(
            submission_id=submission_id,
            data=extraction_result.json,
            user='system',
            action='extract',
            notes=f'Initial extraction from {filename}'
        )
        # Save extracted JSON
        data_path = os.path.join(self.data_dir, f"{submission_id}.json")
        with open(data_path, 'w') as f:
            json.dump(extraction_result.json, f, indent=2)
        
        metadata['current_version_id'] = version_id
        # Progress: 90% - Creating metadata
        if progress_callback:
            progress_callback(submission_id, 90, 'ready', 'Finalizing...')
        
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
            'warnings': extraction_result.warnings,
            'current_version_id': version_id,
            'field_confidence': extraction_result.field_confidence,
            'field_hints': extraction_result.field_hints,
            'extraction_issues': extraction_result.extraction_issues,
            'suggested_fixes': extraction_result.suggested_fixes
        }
        
        metadata_path = os.path.join(self.data_dir, f"{submission_id}_meta.json")
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        # Add to folder if folder_id provided
        if folder_id:
            from services.folder_service import FolderService
            folder_service = FolderService()
            folder_service.add_submission(folder_id, submission_id, filename)
        
        # Progress: 100% - Complete
        if progress_callback:
            progress_callback(submission_id, 100, 'ready', 'Extraction complete')
        
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
    
    def update_data(self, submission_id: str, data, user: str = 'user', notes: str = ''):
        """
        Update submission data with versioning.
        
        Args:
            submission_id: Submission identifier
            data: Updated JSON data
            user: User making the update
            notes: Optional notes about the update
        
        Returns:
            Updated submission
        """
        data_path = os.path.join(self.data_dir, f"{submission_id}.json")
        
        if not os.path.exists(data_path):
            raise ValueError("Submission not found")
        
       
        version_id = self.version_service.create_version(
            submission_id=submission_id,
            data=data,
            user=user,
            action='update',
            notes=notes or 'Manual data update'
        )
        
        # Save updated data
        with open(data_path, 'w') as f:
            json.dump(data, f, indent=2)
        
       
        metadata_path = os.path.join(self.data_dir, f"{submission_id}_meta.json")
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
            
            metadata['current_version_id'] = version_id
            metadata['updated_at'] = datetime.utcnow().isoformat()
            metadata['updated_by'] = user
            
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
        
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
    
    def create_submission(
        self, 
        client_id: str, 
        name: str, 
        template_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a submission under a client.
        
        Args:
            client_id: Client identifier
            name: Submission name (e.g., "2025 Property Renewal")
            template_type: Optional template type ('property_renewal', 'wc_quote', etc.)
            
        Returns:
            Submission metadata with template information
        """
        submission_id = str(uuid.uuid4())
        
        # Get client submissions path
        submissions_path = self.client_service.get_submissions_path(client_id)
        submission_path = os.path.join(submissions_path, submission_id)
        
        # Create submission structure
        os.makedirs(os.path.join(submission_path, 'inputs'), exist_ok=True)
        os.makedirs(os.path.join(submission_path, 'outputs'), exist_ok=True)
        
        # Get template metadata if template_type provided
        template_metadata = None
        if template_type and template_type in TEMPLATES:
            template = get_template(template_type)
            template_metadata = {
                'template_id': template.template_id,
                'name': template.name,
                'description': template.description,
                'expected_documents': template.expected_documents,
                'suggested_forms': template.suggested_forms,
                'expected_fields': template.expected_fields
            }
        
        # Create metadata
        metadata = {
            'submission_id': submission_id,
            'client_id': client_id,
            'name': name,
            'template_type': template_type,
            'template_metadata': template_metadata,  # Include full template info
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
            'status': 'created',
            'file_count': 0,
            'files': []
        }
        
        # Save metadata
        metadata_path = os.path.join(submission_path, 'metadata.json')
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        # Add to client
        self.client_service.add_submission(client_id, submission_id)
        
        return metadata

    def get_submission_path(self, client_id: str, submission_id: str) -> str:
        """Get path to submission directory."""
        return os.path.join(
            self.client_service.get_submissions_path(client_id),
            submission_id
        )


    def get_version_history(self, submission_id: str):
        """
        Get version history for a submission.
        
        Args:
            submission_id: Submission identifier
        
        Returns:
            List of versions
        """
        return self.version_service.list_versions(submission_id)

    def get_audit_trail(self, submission_id: str):
        """
        Get audit trail for a submission.
        
        Args:
            submission_id: Submission identifier
        
        Returns:
            Audit trail entries
        """
        return self.version_service.get_audit_trail(submission_id)


    def compare_with_original(self, submission_id: str) -> Dict[str, Any]:
        """
        Compare current data with original extracted data.
        
        Args:
            submission_id: Submission identifier
            
        Returns:
            Comparison result
        """
        # Get current data
        current_submission = self.get_submission(submission_id)
        if not current_submission:
            raise ValueError("Submission not found")
        
        current_data = current_submission['data']
        
        # Get original extraction (version 1)
        version_1 = self.version_service.get_version(submission_id, 
                                                    self.version_service.list_versions(submission_id)[0]['version_id'])
        
        if not version_1:
            raise ValueError("Original version not found")
        
        original_data = version_1['data']
        
        # Compare
        comparison = self.comparison_service.compare_data(
            source_a=original_data,
            source_b=current_data,
            source_a_label='Original Extraction',
            source_b_label='Current Data'
        )
        
        return comparison
    