import type {
  AnalysisResult,
  AuthResponse,
  DashboardStats,
  PublicStats,
  Report,
  ReportStatus,
  User,
} from '../types'

const TOKEN_KEY = 'urbaneye_token'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

function extractDetail(data: unknown): string {
  if (typeof data === 'string' && data) return data
  if (data && typeof data === 'object') {
    const obj = data as { detail?: unknown }
    if (typeof obj.detail === 'string') return obj.detail
    if (Array.isArray(obj.detail)) {
      return obj.detail
        .map((err) => {
          const e = err as { loc?: unknown[]; msg?: string }
          const field = Array.isArray(e.loc) ? e.loc.slice(1).join('.') : 'field'
          return `${field || 'field'}: ${e.msg ?? 'invalid value'}`
        })
        .join(' · ')
    }
  }
  return 'Something went wrong. Please try again.'
}

interface RequestOptions {
  method?: string
  body?: unknown
  formData?: FormData
  auth?: boolean
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, formData, auth = true } = options
  const headers: Record<string, string> = {}

  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let payload: BodyInit | undefined
  if (formData) {
    payload = formData
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let response: Response
  try {
    response = await fetch(path, { method, headers, body: payload })
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Is the backend running?')
  }

  if (response.status === 401) {
    setToken(null)
    window.dispatchEvent(new Event('urbaneye:unauthorized'))
    throw new ApiError(401, 'Your session has expired. Please log in again.')
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      message = extractDetail(await response.json())
    } catch {
      /* keep default message */
    }
    throw new ApiError(response.status, message)
  }

  return (await response.json()) as T
}

function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, value)
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export interface ReportListParams {
  status?: ReportStatus | ''
  category?: string
  severity?: string
  q?: string
}

export const api = {
  health: () => request<{ status: string; ai_configured: boolean }>('/api/health', { auth: false }),
  publicStats: () => request<PublicStats>('/api/stats/public', { auth: false }),

  register: (name: string, email: string, password: string) =>
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      auth: false,
      body: { name, email, password },
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      auth: false,
      body: { email, password },
    }),

  me: () => request<User>('/api/auth/me'),

  analyze: (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    return request<AnalysisResult>('/api/analyze', { method: 'POST', formData })
  },

  createReport: (data: {
    image: File
    category: string
    severity: string
    confidence: number
    description: string
    latitude: number | null
    longitude: number | null
    address: string
  }) => {
    const formData = new FormData()
    formData.append('image', data.image)
    formData.append('category', data.category)
    formData.append('severity', data.severity)
    formData.append('confidence', String(data.confidence))
    formData.append('description', data.description)
    if (data.latitude !== null) formData.append('latitude', String(data.latitude))
    if (data.longitude !== null) formData.append('longitude', String(data.longitude))
    if (data.address) formData.append('address', data.address)
    return request<Report>('/api/reports', { method: 'POST', formData })
  },

  listReports: (params: ReportListParams = {}) =>
    request<Report[]>(`/api/reports${buildQuery({ ...params })}`),

  getReport: (id: number | string) => request<Report>(`/api/reports/${id}`),

  updateStatus: (id: number | string, status: ReportStatus) =>
    request<Report>(`/api/reports/${id}/status`, {
      method: 'PATCH',
      body: { status },
    }),

  dashboardStats: () => request<DashboardStats>('/api/dashboard/stats'),
}
