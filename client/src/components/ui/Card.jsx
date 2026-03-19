export default function Card({ className = '', header, children, ...props }) {
  return (
    <div
      className={`rounded-3xl border border-white/30 bg-white/70 p-8 shadow-soft backdrop-blur ${className}`}
      {...props}
    >
      {header ? <div className="mb-6">{header}</div> : null}
      {children}
    </div>
  )
}
