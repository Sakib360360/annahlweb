export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition'

  const styles = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700',
    secondary: 'bg-white text-brand-600 border border-brand-600 hover:bg-brand-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-50',
  }

  return (
    <button className={`${base} ${styles[variant] ?? styles.primary} ${className}`} {...props}>
      {children}
    </button>
  )
}
