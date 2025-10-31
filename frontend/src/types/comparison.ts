/**
 * Comparison and conflict resolution types for B9
 */

export interface Conflict {
    field: string
    value_a: unknown
    value_b: unknown
    source_a: string
    source_b: string
    conflict_type: 'value_mismatch' | 'type_mismatch' | 'missing'
    severity: 'high' | 'medium' | 'low'
  }
  
  export interface FieldDifference {
    field: string
    value: unknown
    source: string
  }
  
  export interface ComparisonResult {
    comparison_id: string
    compared_at: string
    source_a_label: string
    source_b_label: string
    summary: {
      conflicts: number
      only_in_a: number
      only_in_b: number
      matching: number
      total_fields: number
    }
    conflicts: Conflict[]
    only_in_a: FieldDifference[]
    only_in_b: FieldDifference[]
    matching: Array<{ field: string; value: unknown }>
  }
  
  export interface ResolutionSuggestion {
    field: string
    recommended_action: 'use_a' | 'use_b' | 'manual_review' | 'average' | 'merge'
    recommended_value: unknown
    reasoning: string
    alternatives: Array<{
      action: string
      value: unknown
      reasoning: string
    }>
  }
  
  export interface Resolution {
    field: string
    action: 'use_a' | 'use_b' | 'manual' | 'average' | 'delete'
    value?: unknown
    reasoning?: string
  }
  
  export interface ResolutionRecord {
    comparison_id: string
    field: string
    action: string
    selected_value: unknown
    reasoning: string
    resolved_by: string
    resolved_at: string
  }