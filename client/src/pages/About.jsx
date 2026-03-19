export default function About() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-50">
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(29,162,109,0.35),transparent_65%)]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h1 className="text-4xl font-semibold text-brand-900 md:text-5xl">Our Mission & Vision</h1>
              <p className="mt-6 max-w-xl text-lg text-slate-700">
                At Al Nahal Academy, we are committed to developing confident, compassionate learners who uphold Islamic values while excelling in a modern world.
              </p>
            </div>
            <div className="rounded-3xl border border-white/30 bg-white/70 p-10 shadow-soft backdrop-blur">
              <h2 className="text-2xl font-semibold text-brand-900">Our core beliefs</h2>
              <ul className="mt-6 space-y-4 text-slate-700">
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                  We foster a loving community where faith and knowledge grow together.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                  We empower students with critical thinking and global competencies.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                  We support individual growth through compassionate guidance and modern resources.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/30 bg-white/70 p-10 shadow-soft backdrop-blur">
            <h2 className="text-2xl font-semibold text-brand-900">Islamic Foundation</h2>
            <p className="mt-4 text-slate-700">
              Our curriculum is grounded in Islam, encouraging students to practice kindness, responsibility, and discipline while learning core subjects.
            </p>
            <ul className="mt-6 space-y-4 text-slate-700">
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                Daily Quranic studies and Arabic language support.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                Character-building sessions and weekly tafsir discussions.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                Community service and ethical leadership programs.
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/30 bg-white/70 p-10 shadow-soft backdrop-blur">
            <h2 className="text-2xl font-semibold text-brand-900">British Curriculum</h2>
            <p className="mt-4 text-slate-700">
              Our academic programme follows internationally recognized standards to prepare students for higher education and global opportunities.
            </p>
            <ul className="mt-6 space-y-4 text-slate-700">
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                Structured learning paths from early years through A-Levels.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                Emphasis on STEM, critical thinking, and creativity.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                Exam preparation and university guidance built-in.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-white/20 bg-brand-50">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-3xl font-semibold text-brand-900">Join our growing family</h2>
          <p className="mt-4 max-w-2xl mx-auto text-slate-600">
            Take the next step—visit our campus or speak with our admissions team to learn how Al Nahal Academy can help your child succeed.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-gold-500 px-8 py-3 text-base font-semibold text-brand-900 shadow-lg transition hover:bg-gold-600"
            >
              Contact Admissions
            </a>
            <a
              href="/gallery"
              className="inline-flex items-center justify-center rounded-xl border border-brand-200 bg-white/70 px-8 py-3 text-base font-semibold text-brand-900 shadow-sm transition hover:bg-white"
            >
              View Our Campus
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
