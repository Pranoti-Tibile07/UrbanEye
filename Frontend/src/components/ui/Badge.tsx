import type { ReactNode } from 'react'

import { CATEGORY_STYLES, SEVERITY_STYLES, STATUS_STYLES } from '../../lib/constants'
import type { Category, ReportStatus, Severity } from '../../types'

interface BadgeProps {
  tone: string
  dot?: string
  children: ReactNode
}

export function Badge({ tone, dot, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
      {children}
    </span>
  )
}

export function SeverityBadge({ value }: { value: Severity }) {
  const style = SEVERITY_STYLES[value]
  return <Badge tone={style.badge} dot={style.dot}>{value}</Badge>
}

export function StatusBadge({ value }: { value: ReportStatus }) {
  const style = STATUS_STYLES[value]
  return <Badge tone={style.badge} dot={style.dot}>{value}</Badge>
}

export function CategoryBadge({ value }: { value: Category }) {
  return <Badge tone={CATEGORY_STYLES[value].badge}>{value}</Badge>
}
