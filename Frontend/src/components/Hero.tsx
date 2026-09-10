export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-950 pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-teal-400/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-sm font-medium text-teal-300">
              Empowering communities nationwide
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Your voice.{' '}
            <span className="bg-gradient-to-r from-teal-300 to-teal-500 bg-clip-text text-transparent">
              Your community.
            </span>{' '}
            Real impact.
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-slate-400 sm:text-xl">
            CivicPulse connects citizens with local government — report issues,
            track progress, and shape the future of your neighborhood together.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#cta"
              className="w-full rounded-full bg-teal-500 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-teal-500/30 transition-all hover:bg-teal-400 hover:shadow-teal-400/40 sm:w-auto"
            >
              Join Your Community
            </a>
            <a
              href="#how-it-works"
              className="w-full rounded-full border border-white/20 px-8 py-3.5 text-base font-semibold text-white transition-all hover:border-white/40 hover:bg-white/5 sm:w-auto"
            >
              See How It Works
            </a>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-navy-900/60 shadow-2xl shadow-black/40 backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400/80" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80" />
              <span className="h-3 w-3 rounded-full bg-teal-400/80" />
              <span className="ml-3 text-xs text-slate-500">civicpulse.app/dashboard</span>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-3">
              {[
                { label: 'Open Issues', value: '24', trend: '+3 this week' },
                { label: 'Resolved', value: '187', trend: '92% satisfaction' },
                { label: 'Active Citizens', value: '1.2k', trend: 'In your area' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/5 bg-white/5 p-5"
                >
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-xs text-teal-400">{stat.trend}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
