/**
 * Version and audit trail types for B8
 */

export interface Version {
    version_id: string
    version_number: number
    submission_id: string
    created_at: string
    created_by: string
    action: 'extract' | 'update' | 'rollback' | 'fill'
    notes: string
    data: Record<string, unknown>
    changes: {
      added: Array<{ field: string; new_value: unknown }>
      modified: Array<{ field: string; old_value: unknown; new_value: unknown }>
      deleted: Array<{ field: string; old_value: unknown }>
    }
    previous_version_id?: string
  }
  
  export interface VersionSummary {
    version_id: string
    version_number: number
    created_at: string
    created_by: string
    action: 'extract' | 'update' | 'rollback' | 'fill'
    notes: string
    changes: {
      added: Array<{ field: string; new_value: unknown }>
      modified: Array<{ field: string; old_value: unknown; new_value: unknown }>
      deleted: Array<{ field: string; old_value: unknown }>
    }
  }
  
  export interface AuditTrailEntry {
    timestamp: string
    user: string
    action: 'extract' | 'update' | 'rollback' | 'fill'
    version_number: number
    version_id: string
    notes: string
    changes_summary: {
      added: number
      modified: number
      deleted: number
    }
  }
  
  export interface VersionComparison {
    from_version: {
      version_id: string
      version_number: number
      created_at: string
      created_by: string
    }
    to_version: {
      version_id: string
      version_number: number
      created_at: string
      created_by: string
    }
    changes: {
      added: Array<{ field: string; new_value: unknown }>
      modified: Array<{ field: string; old_value: unknown; new_value: unknown }>
      deleted: Array<{ field: string; old_value: unknown }>
    }
  }
  
  export interface VersionHistoryResponse {
    success: boolean
    submission_id: string
    versions: VersionSummary[]
    total_versions: number
  }
  
  export interface AuditTrailResponse {
    success: boolean
    submission_id: string
    audit_trail: AuditTrailEntry[]
    total_entries: number
  }