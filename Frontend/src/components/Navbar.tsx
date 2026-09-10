export default function Navbar() {
  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Impact', href: '#impact' },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-navy-950/80 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <a href="#" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500 text-sm font-bold text-white shadow-lg shadow-teal-500/30">
            CP
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            Civic<span className="text-teal-400">Pulse</span>
          </span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="#"
            className="hidden text-sm font-medium text-slate-300 transition-colors hover:text-white sm:inline-block"
          >
            Sign In
          </a>
          <a
            href="#cta"
            className="rounded-full bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:bg-teal-400 hover:shadow-teal-400/30"
          >
            Get Started
          </a>
        </div>
      </nav>
    </header>
  )
}
