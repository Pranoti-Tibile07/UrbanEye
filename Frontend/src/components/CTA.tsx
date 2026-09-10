export default function CTA() {
  return (
    <section id="cta" className="relative overflow-hidden bg-white py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-navy-950 to-navy-800 px-8 py-16 text-center shadow-2xl sm:px-16 lg:py-20">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to shape your community?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
            Join thousands of citizens already making their neighborhoods safer,
            cleaner, and more connected.
          </p>

          <form
            className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email"
              aria-label="Email address"
              className="flex-1 rounded-full border border-white/10 bg-white/10 px-5 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30"
            />
            <button
              type="submit"
              className="rounded-full bg-teal-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition-all hover:bg-teal-400"
            >
              Get Early Access
            </button>
          </form>

          <p className="mt-4 text-xs text-slate-500">
            Free for residents. No credit card required.
          </p>
        </div>
      </div>
    </section>
  )
}
