import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/')
    }
  }, [user, navigate])

  return (
    <main className="flex-1 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="rounded-3xl border border-white/30 bg-white/70 p-10 shadow-soft backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-brand-900">Admin Dashboard</h1>
              <p className="mt-2 text-slate-600">
                Welcome back, <span className="font-semibold text-brand-900">{user?.name}</span>. This is your admin control panel.
              </p>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-700"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="rounded-3xl border border-white/30 bg-white/70 p-10 shadow-soft backdrop-blur">
          <h2 className="text-2xl font-semibold text-brand-900">Administrative tools</h2>
          <p className="mt-2 text-slate-600">This is a placeholder admin dashboard page. You can extend it with user management, reports, and system settings.</p>
          <ul className="mt-6 space-y-3 text-slate-700">
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
              Manage user accounts and roles
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
              Review dashboards and analytics
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
              Configure system settings and announcements
            </li>
          </ul>
        </section>
      </div>
    </main>
  )
}
