import type { ReactNode } from 'react'

export default function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: ReactNode
  title: string
  message: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-navy-950">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
