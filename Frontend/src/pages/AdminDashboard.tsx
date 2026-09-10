import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { ApiError, api } from '../api/client'
import { CategoryBadge, SeverityBadge, StatusBadge } from '../components/ui/Badge'
import Card from '../components/ui/Card'
import { Input, Select } from '../components/ui/Field'
import { Spinner } from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'
import { CATEGORIES, SEVERITIES, STATUSES } from '../lib/constants'
import type { DashboardStats, Report, ReportStatus } from '../types'

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <Card className="p-5">
      <p className={`text-3xl font-bold ${accent}`}>{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </Card>
  )
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([api.dashboardStats(), api.listReports()])
      .then(([statsData, reportList]) => {
        if (!cancelled) {
          setStats(statsData)
          setReports(reportList)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load dashboard.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return reports.filter((report) => {
      if (statusFilter && report.status !== statusFilter) return false
      if (categoryFilter && report.category !== categoryFilter) return false
      if (severityFilter && report.severity !== severityFilter) return false
      if (needle) {
        const haystack = [
          report.category,
          report.description,
          report.address ?? '',
          report.user_name ?? '',
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(needle)) return false
      }
      return true
    })
  }, [reports, q, statusFilter, categoryFilter, severityFilter])

  async function updateStatus(report: Report, status: ReportStatus) {
    setUpdatingId(report.id)
    try {
      const updated = await api.updateStatus(report.id, status)
      setReports((current) => current.map((r) => (r.id === updated.id ? updated : r)))
      toast('Status updated.', 'success')
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not update status.', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <Spinner className="h-8 w-8 text-teal-500" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="bg-slate-50 py-24 text-center text-slate-600">
        {error ?? 'Dashboard unavailable.'}
      </div>
    )
  }

  const openCount =
    (stats.status_counts['Submitted'] ?? 0) +
    (stats.status_counts['Under Review'] ?? 0) +
    (stats.status_counts['In Progress'] ?? 0)

  const maxCategory = Math.max(1, ...Object.values(stats.category_counts))

  return (
    <div className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-navy-950">Admin dashboard</h1>
        <p className="mt-2 text-slate-600">Overview, priorities and status management.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total reports" value={stats.total_reports} accent="text-navy-950" />
          <StatCard label="Open (in progress)" value={openCount} accent="text-amber-500" />
          <StatCard label="High priority" value={stats.high_priority_count} accent="text-red-600" />
          <StatCard label="Resolved" value={stats.resolved_count} accent="text-emerald-600" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Reports by category
            </h2>
            <div className="mt-4 space-y-3">
              {Object.entries(stats.category_counts).length === 0 && (
                <p className="text-sm text-slate-500">No reports yet.</p>
              )}
              {Object.entries(stats.category_counts).map(([category, count]) => (
                <div key={category}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-600">{category}</span>
                    <span className="font-semibold text-navy-950">{count}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-teal-500"
                      style={{ width: `${(count / maxCategory) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              By severity
            </h2>
            <div className="mt-4 space-y-3">
              {SEVERITIES.map((severity) => (
                <div key={severity} className="flex items-center justify-between">
                  <SeverityBadge value={severity} />
                  <span className="text-sm font-semibold text-navy-950">
                    {stats.severity_counts[severity] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Reports table */}
        <Card className="mt-8 overflow-hidden">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              All reports
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <Input
                placeholder="Search…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Search reports"
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Select>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="">All categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
              <Select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                aria-label="Filter by severity"
              >
                <option value="">All severities</option>
                {SEVERITIES.map((severity) => (
                  <option key={severity} value={severity}>{severity}</option>
                ))}
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">No reports match your filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">#</th>
                    <th className="px-5 py-3">Issue</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Severity</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Reporter</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium text-slate-500">{report.id}</td>
                      <td className="max-w-xs px-5 py-3">
                        <p className="truncate font-medium text-navy-950">
                          {report.description || report.category}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {report.address || 'No location'}
                        </p>
                      </td>
                      <td className="px-5 py-3"><CategoryBadge value={report.category} /></td>
                      <td className="px-5 py-3"><SeverityBadge value={report.severity} /></td>
                      <td className="px-5 py-3 font-semibold text-navy-950">{report.priority_score}</td>
                      <td className="px-5 py-3"><StatusBadge value={report.status} /></td>
                      <td className="px-5 py-3 text-slate-600">{report.user_name ?? '—'}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-40">
                            <Select
                              value={report.status}
                              disabled={updatingId === report.id}
                              onChange={(e) => updateStatus(report, e.target.value as ReportStatus)}
                              aria-label={`Update status of report ${report.id}`}
                            >
                              {STATUSES.map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </Select>
                          </div>
                          <Link
                            to={`/reports/${report.id}`}
                            className="text-xs font-semibold text-teal-600 hover:underline"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
