import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '../api/client'
import ReportMap from '../components/map/ReportMap'
import { buttonClass } from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Spinner'
import type { Report } from '../types'

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    api
      .listReports()
      .then((data) => {
        if (!cancelled) setReports(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load the map.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const withoutLocation = useMemo(
    () => reports.filter((r) => r.latitude === null || r.longitude === null).length,
    [reports],
  )

  return (
    <div className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-navy-950">Issue map</h1>
            <p className="mt-2 text-slate-600">Every reported issue with a location.</p>
          </div>
          <Link to="/report" className={buttonClass('primary')}>
            + New report
          </Link>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner className="h-8 w-8 text-teal-500" />
            </div>
          ) : error ? (
            <EmptyState
              icon={<span className="text-xl">⚠️</span>}
              title="Could not load the map"
              message={error}
            />
          ) : (
            <>
              <ReportMap reports={reports} height="520px" />
              {withoutLocation > 0 && (
                <p className="mt-3 text-xs text-slate-500">
                  {withoutLocation} report{withoutLocation > 1 ? 's' : ''} have no location and
                  are not shown on the map.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
