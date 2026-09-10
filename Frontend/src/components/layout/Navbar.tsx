import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'
import { buttonClass } from '../ui/Button'
import Logo from '../Logo'

function navLinkClass(isActive: boolean): string {
  return [
    'text-sm font-medium transition-colors',
    isActive ? 'text-teal-400' : 'text-slate-300 hover:text-white',
  ].join(' ')
}

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { label: 'Home', to: '/' },
    { label: 'Map', to: '/map' },
    { label: 'My Reports', to: '/reports' },
    ...(isAdmin ? [{ label: 'Admin', to: '/admin' }] : []),
  ]

  function handleLogout() {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-navy-950/85 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 lg:px-8">
        <Link to="/" onClick={() => setMenuOpen(false)}>
          <Logo light />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.to === '/'} className={({ isActive }) => navLinkClass(isActive)}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link to="/report" className={buttonClass('primary', 'sm')}>
                Report Issue
              </Link>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/20 text-xs font-bold text-teal-300">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                Sign in
              </Link>
              <Link to="/register" className={buttonClass('primary', 'sm')}>
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-300 hover:bg-white/10 md:hidden"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-white/10 bg-navy-950 px-6 pt-2 pb-4 md:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `block py-2.5 ${navLinkClass(isActive)}`}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            {user ? (
              <>
                <Link to="/report" onClick={() => setMenuOpen(false)} className={buttonClass('primary', 'md')}>
                  Report Issue
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={buttonClass('outline', 'md')}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className={buttonClass('outline', 'md')}>
                  Sign in
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className={buttonClass('primary', 'md')}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
