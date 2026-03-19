import { Link, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import NotificationBell from './notifications/NotificationBell'
import { useAuth } from '../auth/AuthProvider'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Testimonials', to: '/testimonials' },
  { label: 'Contact', to: '/contact' },
]

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `block rounded-lg px-3 py-2 text-sm font-medium transition ${
          isActive
            ? 'bg-brand-600 text-white shadow-sm'
            : 'text-slate-700 hover:bg-brand-50 hover:text-brand-800'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow ${
        scrolled ? 'shadow-sm backdrop-blur bg-white/80' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="inline-flex items-center gap-2 text-xl font-semibold text-brand-900">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white shadow">
            A
          </span>
          <span>Al Nahal Academy</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
          <Link
            to="/login"
            className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gold-600"
          >
            Admin Login
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-50 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavItem key={item.to} {...item} onClick={() => setOpen(false)} />
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block rounded-lg bg-gold-500 px-3 py-2 text-base font-semibold text-white transition hover:bg-gold-600"
            >
              Admin Login
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
