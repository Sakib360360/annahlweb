export default function StatCard({ label, value, icon, className = '' }) {
  return (
    <div className={`rounded-3xl border border-white/30 bg-white/70 p-6 shadow-soft backdrop-blur ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-brand-900">{value}</p>
        </div>
        {icon ? <div className="text-3xl text-brand-600">{icon}</div> : null}
      </div>
    </div>
  )
}
