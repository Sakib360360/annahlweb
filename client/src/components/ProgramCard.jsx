export default function ProgramCard({ icon, title, description }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/60 p-6 shadow-soft backdrop-blur">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm transition group-hover:scale-105">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-semibold text-brand-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{description}</p>
      <span className="absolute -right-12 -bottom-12 h-28 w-28 rounded-full bg-gold-200/40 blur-2xl" />
    </div>
  )
}
