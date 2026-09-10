import { Link } from 'react-router-dom'

import Logo from '../Logo'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/">
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
              Eyes on every civic issue. UrbanEye uses AI to classify and
              prioritise public infrastructure problems reported by citizens.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-navy-950">Product</h3>
            <ul className="mt-4 space-y-2.5">
              <li><Link to="/report" className="text-sm text-slate-600 hover:text-teal-600">Report an issue</Link></li>
              <li><Link to="/map" className="text-sm text-slate-600 hover:text-teal-600">Issue map</Link></li>
              <li><Link to="/reports" className="text-sm text-slate-600 hover:text-teal-600">My reports</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-navy-950">About</h3>
            <ul className="mt-4 space-y-2.5">
              <li><a href="#how-it-works" className="text-sm text-slate-600 hover:text-teal-600">How it works</a></li>
              <li><a href="#features" className="text-sm text-slate-600 hover:text-teal-600">Features</a></li>
              <li><a href="https://github.com/Pranoti-Tibile07/UrbanEye" className="text-sm text-slate-600 hover:text-teal-600">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-8 sm:flex-row">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} UrbanEye · Student academic project.
          </p>
          <p className="text-xs text-slate-400">
            AI results are advisory — always verify before acting.
          </p>
        </div>
      </div>
    </footer>
  )
}
