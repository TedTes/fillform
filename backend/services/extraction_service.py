"""
Extraction service - handles file upload, classification, and extraction workflow.
"""

import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from typing import Dict, List, Optional, Any

from utils.file_utils import allowed_file, get_file_extension


class ExtractionService:
    """Service for managing extraction workflow."""
    
    def __init__(self):
        """Initialize extraction service."""
        self.storage_dir = 'storage'
        self.uploads_dir = os.path.join(self.storage_dir, 'extraction_uploads')
        self.results_dir = os.path.join(self.storage_dir, 'extraction_results')
        
        # Create directories
        os.makedirs(self.uploads_dir, exist_ok=True)
        os.makedirs(self.results_dir, exist_ok=True)
        
        # In-memory storage (replace with database in production)
        self.files: Dict[str, Dict[str, Any]] = {}
        self.classifications: Dict[str, Dict[str, Any]] = {}
        self.extractions: Dict[str, Dict[str, Any]] = {}
        self.jobs: Dict[str, Dict[str, Any]] = {}
    
    def upload_file(self, file, folder_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Upload a file for extraction.
        
        Args:
            file: Werkzeug FileStorage object
            folder_id: Optional folder ID to associate with
        
        Returns:
            {
                "file_id": "uuid",
                "file_name": "document.pdf",
                "file_size": 12345,
                "mime_type": "application/pdf"
            }
        """
        # Validate file
        if not file or file.filename == '':
            raise ValueError('No file provided')
        
        if not allowed_file(file.filename):
            raise ValueError(f'File type not allowed: {file.filename}')
        
        # Generate file ID
        file_id = str(uuid.uuid4())
        
        # Secure filename
        filename = secure_filename(file.filename)
        extension = get_file_extension(filename)
        
        # Save file
        file_path = os.path.join(self.uploads_dir, f'{file_id}{extension}')
        file.save(file_path)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Store metadata
        file_metadata = {
            'file_id': file_id,
            'file_name': filename,
            'file_path': file_path,
            'file_size': file_size,
            'mime_type': file.content_type or 'application/octet-stream',
            'folder_id': folder_id,
            'uploaded_at': datetime.utcnow().isoformat(),
            'status': 'uploaded'
        }
        
        self.files[file_id] = file_metadata
        
        return {
            'file_id': file_id,
            'file_name': filename,
            'file_size': file_size,
            'mime_type': file_metadata['mime_type']
        }
    
    def classify_document(self, file_id: str) -> Dict[str, Any]:
        """
        Classify a document to detect its type.
        
        Args:
            file_id: File ID to classify
        
        Returns:
            {
                "document_type": "acord_126",
                "confidence": 0.95,
                "indicators": ["ACORD 126 header", "..."],
                "classifier_results": [...]
            }
        """
        # Get file metadata
        if file_id not in self.files:
            raise ValueError(f'File not found: {file_id}')
        
        file_meta = self.files[file_id]
        file_path = file_meta['file_path']
        filename = file_meta['file_name'].lower()
        
        # Simple classification logic (expand with real classifiers)
        document_type = 'unknown'
        confidence = 0.5
        indicators = []
        
        # Keyword-based classification
        if 'acord' in filename and '126' in filename:
            document_type = 'acord_126'
            confidence = 0.95
            indicators.append('Filename contains "acord" and "126"')
        elif 'acord' in filename and '125' in filename:
            document_type = 'acord_125'
            confidence = 0.95
            indicators.append('Filename contains "acord" and "125"')
        elif 'loss' in filename or 'claim' in filename:
            document_type = 'loss_run'
            confidence = 0.85
            indicators.append('Filename contains "loss" or "claim"')
        elif 'sov' in filename or 'schedule' in filename:
            document_type = 'sov'
            confidence = 0.80
            indicators.append('Filename contains "sov" or "schedule"')
        elif 'financial' in filename or 'statement' in filename:
            document_type = 'financial_statement'
            confidence = 0.80
            indicators.append('Filename contains "financial" or "statement"')
        
        # Store classification
        classification = {
            'document_type': document_type,
            'confidence': confidence,
            'indicators': indicators,
            'classifier_results': [
                {
                    'classifier': 'KeywordClassifier',
                    'document_type': document_type,
                    'confidence': confidence
                }
            ],
            'classified_at': datetime.utcnow().isoformat()
        }
        
        self.classifications[file_id] = classification
        self.files[file_id]['status'] = 'classified'
        
        return classification
    
    def extract_document(
        self,
        file_id: str,
        document_type: Optional[str] = None,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Extract data from a document.
        
        Args:
            file_id: File ID to extract from
            document_type: Document type (if known)
            options: Extraction options
        
        Returns:
            {
                "success": true,
                "data": {...},
                "confidence": 0.92,
                "warnings": [],
                "errors": [],
                "metadata": {...}
            }
        """
        # Get file metadata
        if file_id not in self.files:
            raise ValueError(f'File not found: {file_id}')
        
        # Get classification if not provided
        if not document_type:
            if file_id in self.classifications:
                document_type = self.classifications[file_id]['document_type']
            else:
                # Auto-classify
                classification = self.classify_document(file_id)
                document_type = classification['document_type']
        
        # Mock extraction (replace with real extractors)
        extracted_data = {
            'applicant_name': 'John Doe Insurance Company',
            'policy_number': 'POL-2025-001',
            'effective_date': '2025-01-01',
            'expiration_date': '2026-01-01',
            'premium': 15000.00,
            'coverage_type': 'Commercial General Liability',
            'limit': 1000000,
            'deductible': 5000
        }
        
        # Create result
        result = {
            'success': True,
            'data': extracted_data,
            'confidence': 0.92,
            'warnings': [],
            'errors': [],
            'metadata': {
                'extractor_used': 'MockExtractor',
                'document_type': document_type,
                'extraction_date': datetime.utcnow().isoformat(),
                'file_id': file_id
            }
        }
        
        # Store extraction
        self.extractions[file_id] = result
        self.files[file_id]['status'] = 'extracted'
        
        return result
    
    def fuse_documents(
        self,
        file_ids: List[str],
        group_id: Optional[str] = None,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Fuse data from multiple documents.
        
        Args:
            file_ids: List of file IDs to fuse
            group_id: Optional group ID
            options: Fusion options
        
        Returns:
            Fused extraction result
        """
        # Extract all files if not already extracted
        extractions = []
        for file_id in file_ids:
            if file_id not in self.extractions:
                self.extract_document(file_id)
            extractions.append(self.extractions[file_id])
        
        # Simple fusion logic (replace with real fusion)
        fused_data = {}
        for extraction in extractions:
            if extraction['success']:
                fused_data.update(extraction['data'])
        
        return {
            'success': True,
            'data': {
                'submission_id': str(uuid.uuid4()),
                'fused_data': fused_data
            },
            'confidence': 0.88,
            'warnings': [],
            'errors': []
        }
    
    def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get async job status."""
        return self.jobs.get(job_id)
    
    def get_extraction_result(self, extraction_id: str) -> Optional[Dict[str, Any]]:
        """Get extraction result."""
        return self.extractions.get(extraction_id)
    
    def delete_file(self, file_id: str) -> None:
        """Delete a file and its associated data."""
        if file_id in self.files:
            # Delete physical file
            file_path = self.files[file_id]['file_path']
            if os.path.exists(file_path):
                os.remove(file_path)
            
            # Delete metadata
            del self.files[file_id]
            
            if file_id in self.classifications:
                del self.classifications[file_id]
            
            if file_id in self.extractions:
                del self.extractions[file_id]
    
    def get_supported_formats(self) -> Dict[str, Any]:
        """Get supported file formats and capabilities."""
        return {
            'file_types': ['.pdf', '.xlsx', '.xls', '.csv', '.jpg', '.jpeg', '.png', '.tiff', '.docx'],
            'document_types': [
                {'value': 'acord_125', 'label': 'ACORD 125'},
                {'value': 'acord_126', 'label': 'ACORD 126'},
                {'value': 'acord_130', 'label': 'ACORD 130'},
                {'value': 'acord_140', 'label': 'ACORD 140'},
                {'value': 'loss_run', 'label': 'Loss Run'},
                {'value': 'sov', 'label': 'Schedule of Values'},
                {'value': 'financial_statement', 'label': 'Financial Statement'},
                {'value': 'supplemental', 'label': 'Supplemental Document'},
                {'value': 'generic', 'label': 'Generic Document'},
            ],
            'extractors': [
                {
                    'name': 'Acord126Extractor',
                    'supported_types': ['acord_126'],
                    'description': 'Extracts data from ACORD 126 forms'
                }
            ],
            'parsers': [
                {
                    'name': 'PDFParser',
                    'supported_extensions': ['.pdf'],
                    'description': 'Parses PDF documents'
                }
            ]
        }