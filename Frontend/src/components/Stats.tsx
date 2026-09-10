const stats = [
  { value: '50K+', label: 'Issues Resolved' },
  { value: '200+', label: 'Cities Connected' },
  { value: '1M+', label: 'Active Citizens' },
  { value: '4.8', label: 'App Store Rating' },
]

export default function Stats() {
  return (
    <section id="impact" className="bg-navy-950 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
            Our Impact
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Real numbers. Real change.
          </h2>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-extrabold text-teal-400 lg:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
