import { Link } from 'react-router-dom'

import type { Report } from '../types'
import { CategoryBadge, SeverityBadge, StatusBadge } from './ui/Badge'

function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function ReportCard({ report }: { report: Report }) {
  return (
    <Link
      to={`/reports/${report.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-teal-200 hover:shadow-md"
    >
      <div className="h-40 w-full overflow-hidden bg-slate-100">
        {report.image_url ? (
          <img
            src={report.image_url}
            alt={report.category}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">No image</div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <CategoryBadge value={report.category} />
          <SeverityBadge value={report.severity} />
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-slate-600">
          {report.description || 'No description provided.'}
        </p>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>{report.address || 'No location'}</span>
          <span>{formatDate(report.created_at)}</span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <StatusBadge value={report.status} />
          <span className="text-xs font-medium text-slate-400">
            Priority {report.priority_score}
          </span>
        </div>
      </div>
    </Link>
  )
}
