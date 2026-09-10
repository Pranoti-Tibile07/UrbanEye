const steps = [
  {
    number: '01',
    title: 'Sign Up & Verify',
    description:
      'Create your free account and verify your address to connect with your local community.',
  },
  {
    number: '02',
    title: 'Report or Engage',
    description:
      'Submit issues, join discussions, or vote on community proposals that matter to you.',
  },
  {
    number: '03',
    title: 'Track & Celebrate',
    description:
      'Watch issues get resolved in real time and see the collective impact your community creates.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">
            How It Works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
            Three steps to civic impact
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Getting started takes less than two minutes. No bureaucracy required.
          </p>
        </div>

        <div className="relative mx-auto mt-16 max-w-4xl">
          <div className="absolute top-12 right-0 left-0 hidden h-0.5 bg-gradient-to-r from-teal-500/0 via-teal-500/40 to-teal-500/0 md:block" />

          <div className="grid gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-navy-950 text-2xl font-bold text-teal-400 shadow-xl shadow-navy-950/20">
                  {step.number}
                </div>
                <h3 className="mt-6 text-lg font-semibold text-navy-950">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
