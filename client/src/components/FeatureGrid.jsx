const features = [
  {
    id: 'f1',
    title: 'Holistic Islamic Education',
    description:
      'We blend spiritual growth with academic excellence, teaching Qur’an, hadith, and core values alongside modern subjects.',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3l8 4-8 4-8-4 8-4zm0 13l8-4v6l-8 4-8-4v-6l8 4z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'f2',
    title: 'British Curriculum Excellence',
    description:
      'Our accredited curriculum ensures your child is prepared for global opportunities and outstanding academic outcomes.',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 6h16M4 12h16M4 18h16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'f3',
    title: 'Modern Campus & Labs',
    description:
      'State-of-the-art facilities including science labs, smart classrooms, and safe recreational spaces.',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 9l9-6 9 6v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 22V12h6v10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'f4',
    title: 'Caring Community',
    description:
      'A safe and supportive environment with dedicated staff, guided by Islamic values and community spirit.',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 7a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.5 21a6.5 6.5 0 0 1 13 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

export default function FeatureGrid() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:grid-cols-2 lg:grid-cols-4">
      {features.map((feature) => (
        <div
          key={feature.id}
          className="group relative overflow-hidden rounded-3xl border border-white/30 bg-white/70 p-6 shadow-soft backdrop-blur transition hover:-translate-y-1 hover:shadow-glow"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm transition group-hover:bg-brand-700">
            {feature.icon}
          </div>
          <h3 className="mt-5 text-lg font-semibold text-brand-900">{feature.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{feature.description}</p>
          <span className="absolute -right-10 -bottom-10 h-28 w-28 rounded-full bg-gold-200/30 blur-2xl" />
        </div>
      ))}
    </div>
  )
}
