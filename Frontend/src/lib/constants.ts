import type { Category, ReportStatus, Severity } from '../types'

export const CATEGORIES: Category[] = [
  'Pothole',
  'Garbage',
  'Broken Streetlight',
  'Water Leakage',
  'Damaged Public Property',
  'Other',
]

export const SEVERITIES: Severity[] = ['Low', 'Medium', 'High']

export const STATUSES: ReportStatus[] = [
  'Submitted',
  'Under Review',
  'In Progress',
  'Resolved',
  'Rejected',
]

// Full literal Tailwind classes so the JIT compiler picks them up.
export const SEVERITY_STYLES: Record<Severity, { badge: string; dot: string }> = {
  Low: { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  Medium: { badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  High: { badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
}

export const STATUS_STYLES: Record<ReportStatus, { badge: string; dot: string }> = {
  Submitted: { badge: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  'Under Review': { badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  'In Progress': { badge: 'bg-sky-100 text-sky-700', dot: 'bg-sky-500' },
  Resolved: { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  Rejected: { badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
}

export const CATEGORY_STYLES: Record<Category, { badge: string; marker: string }> = {
  Pothole: { badge: 'bg-rose-100 text-rose-700', marker: '#e11d48' },
  Garbage: { badge: 'bg-amber-100 text-amber-700', marker: '#d97706' },
  'Broken Streetlight': { badge: 'bg-violet-100 text-violet-700', marker: '#7c3aed' },
  'Water Leakage': { badge: 'bg-sky-100 text-sky-700', marker: '#0284c7' },
  'Damaged Public Property': { badge: 'bg-fuchsia-100 text-fuchsia-700', marker: '#c026d3' },
  Other: { badge: 'bg-slate-100 text-slate-600', marker: '#475569' },
}
