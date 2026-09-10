export function EyeMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-navy-950" />
      <path
        d="M4 16c2.6-4.4 7-6.9 12-6.9s9.4 2.5 12 6.9c-2.6 4.4-7 6.9-12 6.9S6.6 20.4 4 16z"
        className="stroke-teal-400"
        strokeWidth="2"
      />
      <circle cx="16" cy="16" r="4.4" className="fill-teal-400" />
      <circle cx="16" cy="16" r="1.8" className="fill-navy-950" />
    </svg>
  )
}

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <EyeMark className="h-9 w-9" />
      <span
        className={`text-lg font-bold tracking-tight ${
          light ? 'text-white' : 'text-navy-950'
        }`}
      >
        Urban<span className="text-teal-500">Eye</span>
      </span>
    </span>
  )
}
