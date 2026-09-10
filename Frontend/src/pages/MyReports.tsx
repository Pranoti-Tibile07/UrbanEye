import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '../api/client'
import ReportCard from '../components/ReportCard'
import { buttonClass } from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Spinner'
import type { Report, ReportStatus } from '../types'

const FILTERS: Array<ReportStatus | 'All'> = [
  'All',
  'Submitted',
  'Under Review',
  'In Progress',
  'Resolved',
  'Rejected',
]

export default function MyReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<ReportStatus | 'All'>('All')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .listReports()
      .then((data) => {
        if (!cancelled) {
          setReports(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load reports.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const visible = filter === 'All' ? reports : reports.filter((r) => r.status === filter)

  return (
    <div className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-navy-950">My reports</h1>
            <p className="mt-2 text-slate-600">Track the issues you have reported.</p>
          </div>
          <Link to="/report" className={buttonClass('primary')}>
            + New report
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                filter === item
                  ? 'bg-navy-950 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner className="h-8 w-8 text-teal-500" />
            </div>
          ) : error ? (
            <EmptyState
              icon={<span className="text-xl">⚠️</span>}
              title="Could not load reports"
              message={error}
            />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={<span className="text-xl">📋</span>}
              title={reports.length === 0 ? 'No reports yet' : 'No reports with this status'}
              message={
                reports.length === 0
                  ? 'Report your first civic issue and track its progress here.'
                  : 'Try a different status filter.'
              }
              action={
                reports.length === 0 ? (
                  <Link to="/report" className={buttonClass('primary')}>
                    Report an issue
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
