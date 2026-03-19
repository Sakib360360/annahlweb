import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function TeacherDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role !== 'teacher') {
      navigate('/')
    }
  }, [user, navigate])

  return (
    <main className="flex-1 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="rounded-3xl border border-white/30 bg-white/70 p-10 shadow-soft backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-brand-900">Teacher Dashboard</h1>
              <p className="mt-2 text-slate-600">
                Welcome back, <span className="font-semibold text-brand-900">{user?.name}</span>. Here's your quick teacher overview.
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
          <h2 className="text-2xl font-semibold text-brand-900">Your Tools</h2>
          <p className="mt-2 text-slate-600">This is a placeholder teacher dashboard page. You can extend it with class plans, student tracking, and resource management.</p>
          <ul className="mt-6 space-y-3 text-slate-700">
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
              Manage class roster and attendance
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
              Post assignments and learning resources
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-gold-500" />
              Track student performance and feedback
            </li>
          </ul>
        </section>
      </div>
    </main>
  )
}
