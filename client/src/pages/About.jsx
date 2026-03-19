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
              <h1 className="text-4xl font-semibold text-brand-900 md:text-5xl">Mission & Vision</h1>
              <p className="mt-6 max-w-xl text-lg text-slate-700">
                "An investment in balanced Islamic knowledge is an eternal investment for both worlds." Our mission is to nurture confident, knowledgeable, morally upright, and practicing young Muslim professionals, entrepreneurs, and leaders prepared for success in both Dunya and Akhirah.
              </p>
            </div>
            <div className="rounded-3xl border border-white/30 bg-white/70 p-10 shadow-soft backdrop-blur">
              <h2 className="text-2xl font-semibold text-brand-900">Leadership & Accreditation</h2>
              <ul className="mt-6 space-y-4 text-slate-700">
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                  <strong>Founding Principal:</strong> Shaikh Dr Abul Kalam Azad Madani (London) — Educationist, Curriculum Developer, Islamic Scholar.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                  <strong>Accreditation:</strong> Pearson Edexcel Approved Academy (IGCSE & A-Level exams via British Council).
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                  <strong>Key distinction:</strong> Blending British Edexcel curriculum with Safeer Madani Islamic curriculum using authentic Prophetic pedagogy.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/30 bg-white/70 p-10 shadow-soft backdrop-blur">
            <h2 className="text-2xl font-semibold text-brand-900">Islamic & Arabic Excellence</h2>
            <p className="mt-4 text-slate-700">
              We teach Qur'an with Tajweed, support structured Hifz programmes, and build Arabic language skills rooted in Qur'anic understanding.
            </p>
            <ul className="mt-6 space-y-4 text-slate-700">
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                Qur'an reading with Tajweed and memorization tracks.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                Arabic language with Qur'anic focus and guided grammar.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                Duas, Sunnah practices, Aqeedah, Fiqh, Seerah, and character development.
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/30 bg-white/70 p-10 shadow-soft backdrop-blur">
            <h2 className="text-2xl font-semibold text-brand-900">British Edexcel Curriculum</h2>
            <p className="mt-4 text-slate-700">
              As a Pearson Edexcel Approved Academy, we prepare students for International GCSE and A-Level examinations with world-class resources.
            </p>
            <ul className="mt-6 space-y-4 text-slate-700">
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                Subjects include English, Mathematics, Sciences, Computing, and Humanities.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                Focused exam preparation, critical thinking, and academic rigour.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
                Strong emphasis on learner independence and future readiness.
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
