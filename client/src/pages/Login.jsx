import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const roleRedirect = (role) => {
    if (role === 'student') return '/student-dashboard'
    if (role === 'teacher') return '/teacher-dashboard'
    if (role === 'admin') return '/admin-dashboard'
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

    try {
      const payload = username.includes('@')
        ? { email: username, password }
        : { id: username, password }
      const response = await login(payload)
      const redirect = roleRedirect(response.user.role)
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
            <label className="block text-sm font-medium text-slate-700" htmlFor="username">
              ID or Email
            </label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-4 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="a1 or a1@..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-4 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              required
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-600 px-4 py-2 text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 rounded-lg border border-white/20 bg-white/70 p-4 text-sm text-slate-600">
          <p>
            Try these sample IDs:
            <strong className="block text-slate-800">Student: s1 / student123</strong>
            <strong className="block text-slate-800">Teacher: t1 / teacher123</strong>
            <strong className="block text-slate-800">Admin: a1 / a123</strong>
          </p>
        </div>
      </div>
    </main>
  )
}
