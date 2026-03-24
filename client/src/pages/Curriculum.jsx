const curriculumTracks = [
  {
    title: 'Hifz Curriculum',
    description:
      "Every pupil begins Hifzul Qur'an from day one with structured memorization, revision planning, and tajweed-focused recitation.",
  },
  {
    title: "Safeerul Qur'an Curriculum",
    description:
      "Students learn Qur'anic Arabic through Safeer modules so they can understand the Qur'an and access tafseer texts with confidence.",
  },
  {
    title: 'Safeer Islamic Curriculum',
    description:
      'Core Islamic sciences include Imaan, Fiqh, Seerah, Aqeedah, Sunnah, adab, and character formation through authentic Prophetic pedagogy.',
  },
  {
    title: 'British National Curriculum',
    description:
      'We follow England’s National Curriculum with strong coverage of Mathematics, English, Science, Computing, Humanities, and critical thinking.',
  },
  {
    title: 'Art & Culture Curriculum',
    description:
      'Creative expression through art, design, calligraphy, nasheed, drama, and communication helps learners build confidence and balanced personalities.',
  },
]

const courses = [
  'Teachers’ Training',
  'Computing',
  'British English & IELTS',
  'Part-time Madrasah',
  "Part-time Hifzul Qur'an",
]

export default function Curriculum() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-50">
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(29,162,109,0.25),transparent_65%)]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <h1 className="text-4xl font-semibold text-brand-900 md:text-5xl">Curriculum</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-700">
            An Nahl Academy blends world-class British academics with a full Islamic educational pathway to develop students who benefit both Dunya and Akhirah.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-semibold text-brand-900">Our 5 Core Curriculum Tracks</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {curriculumTracks.map((item) => (
            <article key={item.title} className="rounded-3xl border border-white/30 bg-white/70 p-8 shadow-soft backdrop-blur">
              <h3 className="text-xl font-semibold text-brand-900">{item.title}</h3>
              <p className="mt-3 text-slate-700">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-white/20 bg-brand-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-semibold text-brand-900">Additional Courses</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <li key={course} className="rounded-2xl border border-white/30 bg-white/80 px-5 py-4 text-sm font-medium text-slate-700 shadow-soft">
                {course}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
