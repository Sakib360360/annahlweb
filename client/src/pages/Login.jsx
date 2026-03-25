import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

function EyeIcon({ open }) {
  return open ? (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login, logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const roleRedirect = (role) => {
    if (role === 'student') return '/student-dashboard'
    if (role === 'teacher') return '/teacher-dashboard'
    if (role === 'admin') return '/admin-dashboard'
    if (role === 'management') return '/management/overview'
    return '/'
  }

  useEffect(() => {
    if (user) {
      const redirect = roleRedirect(user.role)
      navigate(redirect, { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    if (!selectedRole) {
      setLoading(false)
      setError('Please select a role before signing in.')
      return
    }

    if (selectedRole === 'management') {
      setLoading(false)
      navigate('/management/login', { replace: true })
      return
    }

    try {
      const payload = username.includes('@')
        ? { email: username, password }
        : { id: username, password }
      const response = await login(payload)

      const actualRole = response.user.role
      if (actualRole !== selectedRole) {
        logout()
        localStorage.removeItem('mgmt_session')
        setError(`This account belongs to ${actualRole}. Please select the correct role.`)
        return
      }

      if (actualRole === 'management') {
        localStorage.setItem(
          'mgmt_session',
          JSON.stringify({ username: response.user.username || response.user.id, loginAt: Date.now() }),
        )
      }
      const redirect = roleRedirect(actualRole)
      navigate(from === '/' ? redirect : from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 px-4 py-6">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-semibold">Login</h1>
        <p className="mt-2 text-slate-600">Log in with your ID and password to access your dashboard.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="role">
              Which role?
            </label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 transition"
              required
            >
              <option value="">Select role</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
              <option value="management">Management</option>
            </select>
            {selectedRole === 'management' && (
              <div className="mt-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-800">
                Management uses a dedicated login page.
                <Link to="/management/login" className="ml-1 font-semibold underline underline-offset-2 hover:text-brand-900">
                  Go to Management Login
                </Link>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="username">
              ID or Email
            </label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 transition"
              placeholder="Enter your ID or email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 transition"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-700 transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-600 px-4 py-3 text-white shadow-md transition hover:bg-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Signing in…
              </>
            ) : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 rounded-lg border border-white/20 bg-white/70 p-4 text-sm text-slate-600">
          <p>
            Student, Teacher, and Admin users are fully database-driven.
            <strong className="block text-slate-800">Create users from Management/Admin dashboard before first login.</strong>
            <strong className="block text-slate-800">Management login uses the dedicated Management Login page.</strong>
          </p>
        </div>
      </div>
    </main>
  )
}
