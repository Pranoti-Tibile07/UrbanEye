import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { EyeMark } from '../components/Logo'
import { buttonClass } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import type { PublicStats } from '../types'

const FEATURES = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    title: 'AI-Powered Classification',
    description: 'Upload a photo and Gemini identifies the issue category, severity and confidence in seconds.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: 'Precise Location',
    description: 'Pin the exact spot on an interactive map or use your device location — with a manual fallback.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Smart Prioritisation',
    description: 'Each report gets a priority score derived from severity and AI confidence, not guesswork.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Status Tracking',
    description: 'Follow every report from Submitted to Resolved with transparent status updates.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
    title: 'Live Issue Map',
    description: 'See reported problems across the city on a free OpenStreetMap-based map.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
      </svg>
    ),
    title: 'Admin Dashboard',
    description: 'Officials filter, prioritise and update reports from one analytics dashboard.',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Snap & Upload',
    description: 'Take a photo of a pothole, broken streetlight or any civic issue and upload it.',
  },
  {
    number: '02',
    title: 'AI Analysis',
    description: 'UrbanEye classifies the issue, estimates severity and confidence, and pinpoints it.',
  },
  {
    number: '03',
    title: 'Track to Resolution',
    description: 'Submit your report and follow its status until the city resolves it.',
  },
]

function StatCard({ label, value, loading }: { label: string; value: number | string; loading: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-6 text-center">
      <p className="text-3xl font-bold text-white">
        {loading ? <Spinner className="mx-auto h-6 w-6 text-teal-400" /> : value}
      </p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </div>
  )
}

export default function Home() {
  const { user } = useAuth()
  const [stats, setStats] = useState<PublicStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    api
      .publicStats()
      .then((data) => {
        if (!cancelled) setStats(data)
      })
      .catch(() => {
        /* landing page still works without the backend */
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 pt-28 pb-16 lg:pt-36 lg:pb-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-teal-500/10 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-teal-400/5 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5">
              <EyeMark className="h-4 w-4" />
              <span className="text-sm font-medium text-teal-300">
                AI-powered civic reporting
              </span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Eyes on every{' '}
              <span className="bg-gradient-to-r from-teal-300 to-teal-500 bg-clip-text text-transparent">
                civic issue
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
              UrbanEye lets citizens photograph public infrastructure problems and
              uses AI to classify, prioritise and route them — so nothing falls
              through the cracks.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to={user ? '/report' : '/register'}
                className={buttonClass('primary', 'lg', 'w-full sm:w-auto')}
              >
                Report an Issue
              </Link>
              <Link
                to="/map"
                className={buttonClass('outline', 'lg', 'w-full border-white/20 bg-transparent text-white hover:bg-white/5 sm:w-auto')}
              >
                View the Map
              </Link>
            </div>
          </div>

          {/* Live statistics */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Reports filed" value={stats?.total_reports ?? '—'} loading={statsLoading} />
            <StatCard label="Open issues" value={stats?.open_reports ?? '—'} loading={statsLoading} />
            <StatCard label="Resolved" value={stats?.resolved_reports ?? '—'} loading={statsLoading} />
            <StatCard label="Issue types" value={stats?.categories_observed ?? '—'} loading={statsLoading} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">Features</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
              Everything you need to make a difference
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              UrbanEye gives citizens and city officials a shared view of every
              reported issue.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-teal-200 hover:shadow-lg hover:shadow-teal-500/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 transition-colors group-hover:bg-teal-500 group-hover:text-white">
                  {feature.icon}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-navy-950">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-slate-50 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">How it works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
              Three steps to civic impact
            </h2>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-12 md:grid-cols-3 md:gap-8">
            {STEPS.map((step) => (
              <div key={step.number} className="relative text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-navy-950 text-2xl font-bold text-teal-400 shadow-xl shadow-navy-950/20">
                  {step.number}
                </div>
                <h3 className="mt-6 text-lg font-semibold text-navy-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-navy-950 to-navy-800 px-8 py-16 text-center shadow-2xl sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Spot a problem? Let UrbanEye see it.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
              Join citizens keeping their neighbourhoods safer, cleaner and better
              maintained — one report at a time.
            </p>
            <Link
              to={user ? '/report' : '/register'}
              className={buttonClass('primary', 'lg', 'mt-8')}
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
