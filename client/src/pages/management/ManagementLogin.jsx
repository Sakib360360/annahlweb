import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'

function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
  )
}

export default function ManagementLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, logout } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await login({ id: username.trim().toLowerCase(), password: password.trim() })
      if (response?.user?.role !== 'management') {
        logout()
        setError('This account is not a management account.')
        return
      }

      localStorage.setItem(
        'mgmt_session',
        JSON.stringify({ username: response.user.username || response.user.id || username.trim(), loginAt: Date.now() }),
      )
      navigate('/management/overview', { replace: true })
    } catch (err) {
      setError(err?.message || 'Invalid username or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Title */}
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="An-Nahl Academy" className="mx-auto mb-4 h-20 w-20 object-contain drop-shadow-xl" />
          <h1 className="text-2xl font-bold text-white">Management Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">An-Nahl Academy — Authorised Access Only</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-8 shadow-2xl">
          <h2 className="mb-6 text-center text-lg font-semibold text-white">Sign in to continue</h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/20 border border-red-400/30 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="mgmt-username">
                Username
              </label>
              <input
                id="mgmt-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                title="Management username"
                required
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300" htmlFor="mgmt-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="mgmt-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  title="Management password"
                  required
                  className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 pr-11 text-sm text-white placeholder-slate-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  title={showPw ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              title="Login to Management Dashboard"
              className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-lg hover:bg-brand-700 active:scale-95 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Verifying…
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Management Credentials */}
          <div className="mt-6 rounded-xl bg-gold-500/10 border border-gold-400/25 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold-400">Management Credentials</p>
            <div className="space-y-1 text-sm text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Username</span>
                <span className="font-mono font-semibold text-white">sakib</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Password</span>
                <span className="font-mono font-semibold text-white">sakib01</span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          This portal is restricted to authorised management personnel only.
        </p>
      </div>
    </div>
  )
}
