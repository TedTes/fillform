"""
Export service - handles data export in various formats.
"""

import os
import json
import csv
import zipfile
import io
from typing import Dict, Any, List, Optional
from datetime import datetime


class ExportService:
    """
    Service for exporting submission data in various formats.
    
    Features:
    - Export to CSV
    - Export to JSON
    - Create ZIP packages with PDFs and data
    - Generate export manifests
    - API webhook notifications
    """
    
    def __init__(self, storage_dir: str = 'storage'):
        """Initialize export service."""
        self.storage_dir = storage_dir
        self.exports_dir = os.path.join(storage_dir, 'exports')
        os.makedirs(self.exports_dir, exist_ok=True)
    
    def export_to_csv(
        self,
        submissions: List[Dict[str, Any]],
        fields: Optional[List[str]] = None
    ) -> str:
        """
        Export submissions to CSV format.
        
        Args:
            submissions: List of submission data
            fields: Optional list of fields to include (exports all if None)
            
        Returns:
            Path to CSV file
        """
        if not submissions:
            raise ValueError("No submissions to export")
        
        # Generate filename
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        csv_filename = f"export_{timestamp}.csv"
        csv_path = os.path.join(self.exports_dir, csv_filename)
        
        # Determine fields to export
        if not fields:
            # Extract all unique field paths from submissions
            fields = self._extract_all_field_paths(submissions)
        
        # Write CSV
        with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fields)
            writer.writeheader()
            
            for submission in submissions:
                flat_data = self._flatten_dict(submission.get('data', {}))
                # Add metadata
                flat_data['_submission_id'] = submission.get('submission_id', '')
                flat_data['_filename'] = submission.get('filename', '')
                flat_data['_uploaded_at'] = submission.get('uploaded_at', '')
                flat_data['_confidence'] = submission.get('confidence', '')
                
                writer.writerow({field: flat_data.get(field, '') for field in fields})
        
        return csv_path
    
    def export_to_json(
        self,
        submissions: List[Dict[str, Any]],
        pretty: bool = True
    ) -> str:
        """
        Export submissions to JSON format.
        
        Args:
            submissions: List of submission data
            pretty: Whether to format JSON with indentation
            
        Returns:
            Path to JSON file
        """
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        json_filename = f"export_{timestamp}.json"
        json_path = os.path.join(self.exports_dir, json_filename)
        
        with open(json_path, 'w', encoding='utf-8') as jsonfile:
            if pretty:
                json.dump(submissions, jsonfile, indent=2)
            else:
                json.dump(submissions, jsonfile)
        
        return json_path
    
    def create_export_package(
        self,
        submissions: List[Dict[str, Any]],
        include_pdfs: bool = True,
        include_json: bool = True,
        include_csv: bool = True
    ) -> str:
        """
        Create a complete export package as ZIP.
        
        Args:
            submissions: List of submissions to export
            include_pdfs: Include filled PDF files
            include_json: Include JSON data files
            include_csv: Include CSV summary
            
        Returns:
            Path to ZIP file
        """
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        zip_filename = f"export_package_{timestamp}.zip"
        zip_path = os.path.join(self.exports_dir, zip_filename)
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Add PDFs
            if include_pdfs:
                for submission in submissions:
                    submission_id = submission.get('submission_id')
                    if submission_id:
                        pdf_path = self._get_pdf_path(submission_id)
                        if pdf_path and os.path.exists(pdf_path):
                            arcname = f"pdfs/{submission.get('filename', submission_id)}"
                            zipf.write(pdf_path, arcname)
            
            # Add individual JSON files
            if include_json:
                for submission in submissions:
                    json_data = json.dumps(submission.get('data', {}), indent=2)
                    submission_id = submission.get('submission_id')
                    arcname = f"json/{submission_id}.json"
                    zipf.writestr(arcname, json_data)
            
            # Add CSV summary
            if include_csv:
                csv_content = self._generate_csv_content(submissions)
                zipf.writestr('summary.csv', csv_content)
            
            # Add manifest
            manifest = self._generate_manifest(submissions)
            zipf.writestr('MANIFEST.json', json.dumps(manifest, indent=2))
        
        return zip_path
    
    def generate_api_payload(
        self,
        submissions: List[Dict[str, Any]],
        format: str = 'full'
    ) -> Dict[str, Any]:
        """
        Generate payload for API webhook.
        
        Args:
            submissions: List of submissions
            format: 'full', 'summary', or 'ids_only'
            
        Returns:
            API payload dictionary
        """
        payload = {
            'export_id': self._generate_export_id(),
            'export_timestamp': datetime.utcnow().isoformat(),
            'total_submissions': len(submissions),
            'format': format
        }
        
        if format == 'ids_only':
            payload['submission_ids'] = [s.get('submission_id') for s in submissions]
        
        elif format == 'summary':
            payload['submissions'] = [
                {
                    'submission_id': s.get('submission_id'),
                    'filename': s.get('filename'),
                    'uploaded_at': s.get('uploaded_at'),
                    'confidence': s.get('confidence'),
                    'status': s.get('status')
                }
                for s in submissions
            ]
        
        else:  # full
            payload['submissions'] = submissions
        
        return payload
    
    def send_webhook(
        self,
        webhook_url: str,
        payload: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Send data to webhook endpoint.
        
        Args:
            webhook_url: Target webhook URL
            payload: Data to send
            headers: Optional custom headers
            
        Returns:
            Response details
        """
        import requests
        
        default_headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'ACORD-Extractor/1.0'
        }
        
        if headers:
            default_headers.update(headers)
        
        try:
            response = requests.post(
                webhook_url,
                json=payload,
                headers=default_headers,
                timeout=30
            )
            
            return {
                'success': response.status_code in [200, 201, 202],
                'status_code': response.status_code,
                'response': response.text,
                'sent_at': datetime.utcnow().isoformat()
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'sent_at': datetime.utcnow().isoformat()
            }
    
    # Helper methods
    
    def _extract_all_field_paths(self, submissions: List[Dict[str, Any]]) -> List[str]:
        """Extract all unique field paths from submissions."""
        all_fields = set(['_submission_id', '_filename', '_uploaded_at', '_confidence'])
        
        for submission in submissions:
            flat_data = self._flatten_dict(submission.get('data', {}))
            all_fields.update(flat_data.keys())
        
        return sorted(list(all_fields))
    
    def _flatten_dict(
        self,
        d: Dict[str, Any],
        parent_key: str = '',
        sep: str = '.'
    ) -> Dict[str, Any]:
        """Flatten nested dictionary."""
        items = []
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            if isinstance(v, dict):
                items.extend(self._flatten_dict(v, new_key, sep=sep).items())
            elif isinstance(v, list):
                # Convert lists to comma-separated strings
                items.append((new_key, ', '.join(str(item) for item in v)))
            else:
                items.append((new_key, v))
        return dict(items)
    
    def _get_pdf_path(self, submission_id: str) -> Optional[str]:
        """Get path to filled PDF for submission."""
        # Check outputs directory
        output_path = os.path.join(self.storage_dir, 'outputs', f"{submission_id}.pdf")
        if os.path.exists(output_path):
            return output_path
        
        # Check uploads directory as fallback
        upload_path = os.path.join(self.storage_dir, 'uploads', f"{submission_id}.pdf")
        if os.path.exists(upload_path):
            return upload_path
        
        return None
    
    def _generate_csv_content(self, submissions: List[Dict[str, Any]]) -> str:
        """Generate CSV content as string."""
        output = io.StringIO()
        
        fields = self._extract_all_field_paths(submissions)
        writer = csv.DictWriter(output, fieldnames=fields)
        writer.writeheader()
        
        for submission in submissions:
            flat_data = self._flatten_dict(submission.get('data', {}))
            flat_data['_submission_id'] = submission.get('submission_id', '')
            flat_data['_filename'] = submission.get('filename', '')
            flat_data['_uploaded_at'] = submission.get('uploaded_at', '')
            flat_data['_confidence'] = submission.get('confidence', '')
            
            writer.writerow({field: flat_data.get(field, '') for field in fields})
        
        return output.getvalue()
    
    def _generate_manifest(self, submissions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate export manifest."""
        return {
            'export_id': self._generate_export_id(),
            'export_timestamp': datetime.utcnow().isoformat(),
            'total_submissions': len(submissions),
            'submissions': [
                {
                    'submission_id': s.get('submission_id'),
                    'filename': s.get('filename'),
                    'status': s.get('status'),
                    'confidence': s.get('confidence')
                }
                for s in submissions
            ],
            'contents': {
                'pdfs': len([s for s in submissions if self._get_pdf_path(s.get('submission_id'))]),
                'json_files': len(submissions),
                'csv_summary': True
            }
        }
    
    def _generate_export_id(self) -> str:
        """Generate unique export ID."""
        import uuid
        return str(uuid.uuid4())