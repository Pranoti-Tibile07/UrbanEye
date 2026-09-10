import { Link } from 'react-router-dom'

import { buttonClass } from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 px-6 py-24 text-center">
      <p className="text-6xl font-extrabold text-teal-500">404</p>
      <h1 className="mt-4 text-2xl font-bold text-navy-950">Page not found</h1>
      <p className="mt-2 text-slate-600">The page you are looking for does not exist.</p>
      <Link to="/" className={buttonClass('primary', 'md', 'mt-6')}>
        Back to home
      </Link>
    </div>
  )
}
