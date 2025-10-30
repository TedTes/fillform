"""
Client service - manages client CRUD operations.

A client contains multiple submissions (formerly folders).
"""

import os
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional


class ClientService:
    """
    Service for managing clients.
    
    Each client is a top-level entity that contains submissions.
    
    Directory structure:
    storage/clients/
        {client_id}/
            metadata.json  # Client info
            submissions/
                {submission_id}/  # Individual submission folders
                    metadata.json
                    inputs/
                    outputs/
    """
    
    def __init__(self):
        """Initialize service with storage path."""
        self.storage_dir = 'storage/clients'
        os.makedirs(self.storage_dir, exist_ok=True)
    
    def create_client(self, name: str) -> Dict[str, Any]:
        """
        Create a new client.
        
        Args:
            name: Client name (e.g., "ABC Manufacturing Corp")
            
        Returns:
            Client metadata dictionary
        """
        client_id = str(uuid.uuid4())
        client_path = os.path.join(self.storage_dir, client_id)
        
        # Create client structure
        os.makedirs(os.path.join(client_path, 'submissions'), exist_ok=True)
        
        # Create metadata
        metadata = {
            'client_id': client_id,
            'name': name,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
            'submission_count': 0,
            'submissions': []  # List of submission IDs
        }
        
        # Save metadata
        metadata_path = os.path.join(client_path, 'metadata.json')
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        return metadata
    
    def get_client(self, client_id: str) -> Optional[Dict[str, Any]]:
        """
        Get client by ID.
        
        Args:
            client_id: Client identifier
            
        Returns:
            Client metadata or None if not found
        """
        metadata_path = os.path.join(self.storage_dir, client_id, 'metadata.json')
        
        if not os.path.exists(metadata_path):
            return None
        
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        return metadata
    
    def list_clients(self) -> List[Dict[str, Any]]:
        """
        List all clients.
        
        Returns:
            List of client metadata dictionaries
        """
        clients = []
        
        if not os.path.exists(self.storage_dir):
            return clients
        
        for client_name in os.listdir(self.storage_dir):
            client_path = os.path.join(self.storage_dir, client_name)
            
            if not os.path.isdir(client_path):
                continue
            
            metadata_path = os.path.join(client_path, 'metadata.json')
            
            if not os.path.exists(metadata_path):
                continue
            
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
            
            clients.append(metadata)
        
        # Sort by name ascending
        clients.sort(key=lambda x: x.get('name', '').lower())
        
        return clients
    
    def update_client(self, client_id: str, name: str) -> Optional[Dict[str, Any]]:
        """
        Update client name.
        
        Args:
            client_id: Client identifier
            name: New client name
            
        Returns:
            Updated client metadata or None if not found
        """
        metadata_path = os.path.join(self.storage_dir, client_id, 'metadata.json')
        
        if not os.path.exists(metadata_path):
            return None
        
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        metadata['name'] = name
        metadata['updated_at'] = datetime.utcnow().isoformat()
        
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        return metadata
    
    def delete_client(self, client_id: str) -> bool:
        """
        Delete a client and all its submissions.
        
        Args:
            client_id: Client identifier
            
        Returns:
            True if deleted, False if not found
        """
        client_path = os.path.join(self.storage_dir, client_id)
        
        if not os.path.exists(client_path):
            return False
        
        # Delete client and all contents (including all submissions)
        import shutil
        shutil.rmtree(client_path)
        
        return True
    
    def add_submission(self, client_id: str, submission_id: str) -> bool:
        """
        Add a submission ID to client's submissions list.
        
        Args:
            client_id: Client identifier
            submission_id: Submission identifier
            
        Returns:
            True if added, False if client not found
        """
        metadata_path = os.path.join(self.storage_dir, client_id, 'metadata.json')
        
        if not os.path.exists(metadata_path):
            return False
        
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        # Add submission ID if not already present
        if submission_id not in metadata['submissions']:
            metadata['submissions'].append(submission_id)
            metadata['submission_count'] = len(metadata['submissions'])
            metadata['updated_at'] = datetime.utcnow().isoformat()
            
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
        
        return True
    
    def remove_submission(self, client_id: str, submission_id: str) -> bool:
        """
        Remove a submission ID from client's submissions list.
        
        Args:
            client_id: Client identifier
            submission_id: Submission identifier
            
        Returns:
            True if removed, False if client not found
        """
        metadata_path = os.path.join(self.storage_dir, client_id, 'metadata.json')
        
        if not os.path.exists(metadata_path):
            return False
        
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        # Remove submission ID if present
        if submission_id in metadata['submissions']:
            metadata['submissions'].remove(submission_id)
            metadata['submission_count'] = len(metadata['submissions'])
            metadata['updated_at'] = datetime.utcnow().isoformat()
            
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
        
        return True
    
    def get_submissions_path(self, client_id: str) -> str:
        """
        Get path to client's submissions directory.
        
        Args:
            client_id: Client identifier
            
        Returns:
            Path to submissions directory
        """
        return os.path.join(self.storage_dir, client_id, 'submissions')
    
    def get_client_path(self, client_id: str) -> str:
        """
        Get client directory path.
        
        Args:
            client_id: Client identifier
            
        Returns:
            Absolute path to client directory
        """
        return os.path.join(self.storage_dir, client_id)