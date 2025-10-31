"""
Version service - manages data versioning and audit trail.
"""

import os
import json
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime


class VersionService:
    """
    Service for managing data versions and audit trail.
    
    Features:
    - Automatic versioning on every update
    - Audit trail with user, timestamp, and changes
    - Version comparison and rollback
    - Change tracking (what changed, who changed it, when)
    """
    
    def __init__(self, storage_dir: str = 'storage'):
        """Initialize version service."""
        self.storage_dir = storage_dir
        self.versions_dir = os.path.join(storage_dir, 'versions')
        os.makedirs(self.versions_dir, exist_ok=True)
    
    def create_version(
        self,
        submission_id: str,
        data: Dict[str, Any],
        user: str = 'system',
        action: str = 'update',
        notes: str = ''
    ) -> str:
        """
        Create a new version of the data.
        
        Args:
            submission_id: Submission identifier
            data: Current data snapshot
            user: User who made the change
            action: Type of action (extract, update, fill)
            notes: Optional notes about the change
            
        Returns:
            Version ID
        """
        version_id = str(uuid.uuid4())
        
        # Create version directory for submission if doesn't exist
        submission_versions_dir = os.path.join(self.versions_dir, submission_id)
        os.makedirs(submission_versions_dir, exist_ok=True)
        
        # Get version number (auto-increment)
        version_number = self._get_next_version_number(submission_id)
        
        # Create version metadata
        version_data = {
            'version_id': version_id,
            'version_number': version_number,
            'submission_id': submission_id,
            'created_at': datetime.utcnow().isoformat(),
            'created_by': user,
            'action': action,
            'notes': notes,
            'data': data
        }
        
        # Calculate changes from previous version
        previous_version = self.get_latest_version(submission_id)
        if previous_version:
            version_data['changes'] = self._calculate_changes(
                previous_version['data'],
                data
            )
            version_data['previous_version_id'] = previous_version['version_id']
        else:
            version_data['changes'] = {
                'added': list(self._flatten_dict(data).keys()),
                'modified': [],
                'deleted': []
            }
            version_data['previous_version_id'] = None
        
        # Save version
        version_path = os.path.join(
            submission_versions_dir,
            f"v{version_number}_{version_id}.json"
        )
        
        with open(version_path, 'w') as f:
            json.dump(version_data, f, indent=2)
        
        # Update version index
        self._update_version_index(submission_id, version_data)
        
        return version_id
    
    def get_version(self, submission_id: str, version_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific version.
        
        Args:
            submission_id: Submission identifier
            version_id: Version identifier
            
        Returns:
            Version data or None if not found
        """
        submission_versions_dir = os.path.join(self.versions_dir, submission_id)
        
        if not os.path.exists(submission_versions_dir):
            return None
        
        # Find version file
        for filename in os.listdir(submission_versions_dir):
            if version_id in filename and filename.endswith('.json') and filename.startswith('v'):
                version_path = os.path.join(submission_versions_dir, filename)
                with open(version_path, 'r') as f:
                    return json.load(f)
        
        return None
    
    def get_latest_version(self, submission_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the latest version for a submission.
        
        Args:
            submission_id: Submission identifier
            
        Returns:
            Latest version data or None
        """
        versions = self.list_versions(submission_id)
        
        if not versions:
            return None
        
        # Get the version with highest number
        latest = max(versions, key=lambda v: v['version_number'])
        return self.get_version(submission_id, latest['version_id'])
    
    def list_versions(self, submission_id: str) -> List[Dict[str, Any]]:
        """
        List all versions for a submission.
        
        Args:
            submission_id: Submission identifier
            
        Returns:
            List of version summaries (without full data)
        """
        index_path = os.path.join(self.versions_dir, submission_id, 'index.json')
        
        if not os.path.exists(index_path):
            return []
        
        with open(index_path, 'r') as f:
            index = json.load(f)
        
        return index.get('versions', [])
    
    def compare_versions(
        self,
        submission_id: str,
        version_id_1: str,
        version_id_2: str
    ) -> Dict[str, Any]:
        """
        Compare two versions and return differences.
        
        Args:
            submission_id: Submission identifier
            version_id_1: First version ID (older)
            version_id_2: Second version ID (newer)
            
        Returns:
            Dictionary with changes between versions
        """
        version1 = self.get_version(submission_id, version_id_1)
        version2 = self.get_version(submission_id, version_id_2)
        
        if not version1 or not version2:
            raise ValueError("One or both versions not found")
        
        changes = self._calculate_changes(version1['data'], version2['data'])
        
        return {
            'from_version': {
                'version_id': version1['version_id'],
                'version_number': version1['version_number'],
                'created_at': version1['created_at'],
                'created_by': version1['created_by']
            },
            'to_version': {
                'version_id': version2['version_id'],
                'version_number': version2['version_number'],
                'created_at': version2['created_at'],
                'created_by': version2['created_by']
            },
            'changes': changes
        }
    
    def rollback_to_version(self, submission_id: str, version_id: str, user: str = 'system') -> str:
        """
        Rollback data to a specific version (creates new version).
        
        Args:
            submission_id: Submission identifier
            version_id: Version to rollback to
            user: User performing rollback
            
        Returns:
            New version ID created by rollback
        """
        target_version = self.get_version(submission_id, version_id)
        
        if not target_version:
            raise ValueError(f"Version {version_id} not found")
        
        # Create new version with rolled-back data
        new_version_id = self.create_version(
            submission_id=submission_id,
            data=target_version['data'],
            user=user,
            action='rollback',
            notes=f"Rolled back to version {target_version['version_number']}"
        )
        
        return new_version_id
    
    def get_audit_trail(self, submission_id: str) -> List[Dict[str, Any]]:
        """
        Get complete audit trail for a submission.
        
        Args:
            submission_id: Submission identifier
            
        Returns:
            List of audit entries (chronological)
        """
        versions = self.list_versions(submission_id)
        
        # Convert to audit trail format
        audit_trail = []
        for version in versions:
            audit_trail.append({
                'timestamp': version['created_at'],
                'user': version['created_by'],
                'action': version['action'],
                'version_number': version['version_number'],
                'version_id': version['version_id'],
                'notes': version.get('notes', ''),
                'changes_summary': {
                    'added': len(version.get('changes', {}).get('added', [])),
                    'modified': len(version.get('changes', {}).get('modified', [])),
                    'deleted': len(version.get('changes', {}).get('deleted', []))
                }
            })
        
        return sorted(audit_trail, key=lambda x: x['timestamp'])
    
    # Private helper methods
    
    def _get_next_version_number(self, submission_id: str) -> int:
        """Get next version number for submission."""
        versions = self.list_versions(submission_id)
        
        if not versions:
            return 1
        
        return max(v['version_number'] for v in versions) + 1
    
    def _update_version_index(self, submission_id: str, version_data: Dict[str, Any]):
        """Update the version index with new version summary."""
        index_path = os.path.join(self.versions_dir, submission_id, 'index.json')
        
        # Load existing index
        if os.path.exists(index_path):
            with open(index_path, 'r') as f:
                index = json.load(f)
        else:
            index = {'submission_id': submission_id, 'versions': []}
        
        # Add version summary (without full data)
        summary = {
            'version_id': version_data['version_id'],
            'version_number': version_data['version_number'],
            'created_at': version_data['created_at'],
            'created_by': version_data['created_by'],
            'action': version_data['action'],
            'notes': version_data['notes'],
            'changes': version_data.get('changes', {})
        }
        
        index['versions'].append(summary)
        
        # Save index
        with open(index_path, 'w') as f:
            json.dump(index, f, indent=2)
    
    def _calculate_changes(self, old_data: Dict[str, Any], new_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate what changed between two data snapshots."""
        old_flat = self._flatten_dict(old_data)
        new_flat = self._flatten_dict(new_data)
        
        added = []
        modified = []
        deleted = []
        
        # Find added and modified
        for key, new_value in new_flat.items():
            if key not in old_flat:
                added.append({
                    'field': key,
                    'new_value': new_value
                })
            elif old_flat[key] != new_value:
                modified.append({
                    'field': key,
                    'old_value': old_flat[key],
                    'new_value': new_value
                })
        
        # Find deleted
        for key, old_value in old_flat.items():
            if key not in new_flat:
                deleted.append({
                    'field': key,
                    'old_value': old_value
                })
        
        return {
            'added': added,
            'modified': modified,
            'deleted': deleted
        }
    
    def _flatten_dict(self, d: Dict[str, Any], parent_key: str = '', sep: str = '.') -> Dict[str, Any]:
        """Flatten nested dictionary."""
        items = []
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            if isinstance(v, dict):
                items.extend(self._flatten_dict(v, new_key, sep=sep).items())
            else:
                items.append((new_key, v))
        return dict(items)