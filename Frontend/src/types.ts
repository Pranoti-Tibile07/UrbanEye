export type Role = 'citizen' | 'admin'

export type Category =
  | 'Pothole'
  | 'Garbage'
  | 'Broken Streetlight'
  | 'Water Leakage'
  | 'Damaged Public Property'
  | 'Other'

export type Severity = 'Low' | 'Medium' | 'High'

export type ReportStatus =
  | 'Submitted'
  | 'Under Review'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected'

export interface User {
  id: number
  name: string
  email: string
  role: Role
  created_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface AnalysisResult {
  category: Category
  severity: Severity
  confidence: number
  description: string
}

export interface Report {
  id: number
  user_id: number
  user_name: string | null
  category: Category
  severity: Severity
  confidence: number
  description: string
  image_url: string | null
  latitude: number | null
  longitude: number | null
  address: string | null
  status: ReportStatus
  priority_score: number
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  total_reports: number
  status_counts: Record<string, number>
  category_counts: Record<string, number>
  severity_counts: Record<string, number>
  high_priority_count: number
  resolved_count: number
  recent_reports: Report[]
}

export interface PublicStats {
  total_reports: number
  resolved_reports: number
  open_reports: number
  categories_observed: number
}
