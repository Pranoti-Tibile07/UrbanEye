import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ApiError, api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import ReportMap from '../components/map/ReportMap'
import { CategoryBadge, SeverityBadge, StatusBadge } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { Field, Select } from '../components/ui/Field'
import { Spinner } from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'
import { STATUSES } from '../lib/constants'
import type { Report, ReportStatus } from '../types'

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>()
  const { isAdmin } = useAuth()
  const { toast } = useToast()

  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [nextStatus, setNextStatus] = useState<ReportStatus>('Submitted')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    api
      .getReport(id)
      .then((data) => {
        if (!cancelled) {
          setReport(data)
          setNextStatus(data.status)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load the report.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleStatusUpdate() {
    if (!report) return
    setUpdating(true)
    try {
      const updated = await api.updateStatus(report.id, nextStatus)
      setReport(updated)
      setNextStatus(updated.status)
      toast('Status updated.', 'success')
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not update status.', 'error')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <Spinner className="h-8 w-8 text-teal-500" />
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="bg-slate-50 py-24 text-center">
        <p className="text-slate-600">{error ?? 'Report not found.'}</p>
        <Link to="/reports" className="mt-4 inline-block font-semibold text-teal-600 hover:underline">
          ← Back to my reports
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <Link to="/reports" className="text-sm font-semibold text-teal-600 hover:underline">
          ← Back to reports
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-navy-950">Report #{report.id}</h1>
          <CategoryBadge value={report.category} />
          <SeverityBadge value={report.severity} />
          <StatusBadge value={report.status} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden">
            {report.image_url ? (
              <img
                src={report.image_url}
                alt={report.category}
                className="max-h-[480px] w-full object-cover"
              />
            ) : (
              <div className="flex h-64 items-center justify-center text-slate-400">No image</div>
            )}
            <div className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                AI analysis
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {report.description || 'No description provided.'}
              </p>
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                  <span>Confidence</span>
                  <span className="font-semibold text-navy-950">{report.confidence}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-teal-500"
                    style={{ width: `${report.confidence}%` }}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-500">Priority score</span>
                <span className="font-bold text-navy-950">{report.priority_score}</span>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Location
              </h2>
              {report.latitude !== null && report.longitude !== null ? (
                <div className="mt-4">
                  <ReportMap reports={[report]} height="260px" />
                  <p className="mt-3 text-sm text-slate-600">
                    {report.address || 'No address provided'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  No location was provided for this report.
                  {report.address && <span className="block">{report.address}</span>}
                </p>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Status timeline
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-teal-500" />
                  <div>
                    <p className="font-medium text-navy-950">Report submitted</p>
                    <p className="text-xs text-slate-500">{formatDateTime(report.created_at)}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
                  <div>
                    <p className="font-medium text-navy-950">Current status: {report.status}</p>
                    <p className="text-xs text-slate-500">Last updated {formatDateTime(report.updated_at)}</p>
                  </div>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Details
              </h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Reported by</dt>
                  <dd className="font-medium text-navy-950">{report.user_name ?? `User #${report.user_id}`}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Category</dt>
                  <dd className="font-medium text-navy-950">{report.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Severity</dt>
                  <dd className="font-medium text-navy-950">{report.severity}</dd>
                </div>
              </dl>

              {isAdmin && (
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <Field label="Update status" htmlFor="status-select">
                    <Select
                      id="status-select"
                      value={nextStatus}
                      onChange={(e) => setNextStatus(e.target.value as ReportStatus)}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </Select>
                  </Field>
                  <Button
                    type="button"
                    className="mt-3"
                    loading={updating}
                    onClick={handleStatusUpdate}
                    disabled={nextStatus === report.status}
                  >
                    Save status
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
