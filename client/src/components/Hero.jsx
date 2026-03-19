import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.5),transparent_60%)]" />
      </div>
      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-20 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold tracking-wide backdrop-blur-sm">
            <span className="inline-flex h-2 w-2 rounded-full bg-gold-400" />
            A Pioneering British Edexcel & Madani Safeer Academy
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            AN-NAHL ACADEMY (أكاديمية النحل)
          </h1>
          <p className="text-lg text-white/85">
            "An investment in balanced Islamic knowledge is an eternal investment for both worlds." — nurturing confident Muslim professionals, entrepreneurs, and leaders.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/contact"
              className="inline-flex w-full items-center justify-center rounded-xl bg-gold-500 px-6 py-3 text-base font-semibold text-brand-900 shadow-lg shadow-black/20 transition hover:bg-gold-600 sm:w-auto"
            >
              Enquire now
            </Link>
            <Link
              to="/about"
              className="inline-flex w-full items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/20 sm:w-auto"
            >
              Learn more
            </Link>
          </div>
        </div>

        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -right-16 -bottom-10 h-72 w-72 rounded-full bg-gold-400/20 blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 shadow-soft backdrop-blur-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-white/80">Academy Enrollment</p>
                <h2 className="text-2xl font-semibold text-white">Admissions Open</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <span className="text-lg font-bold text-white">24</span>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/80">
              Limited seats available for the upcoming academic year. Secure your child’s place today!
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">Islamic Values</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">British Curriculum</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">Modern Facilities</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
