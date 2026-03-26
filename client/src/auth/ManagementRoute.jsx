import { Navigate } from 'react-router-dom'

export default function ManagementRoute({ children }) {
  const session = localStorage.getItem('mgmt_session')
  if (session) return children

  try {
    const authRaw = localStorage.getItem('anahl:auth')
    if (authRaw) {
      const parsed = JSON.parse(authRaw)
      if (parsed?.user?.role === 'management') {
        localStorage.setItem(
          'mgmt_session',
          JSON.stringify({ username: parsed.user.username || parsed.user.id || '', loginAt: Date.now() }),
        )
        return children
      }
    }
  } catch {
    // ignore parse/storage errors and redirect
  }

  return <Navigate to="/management/login" replace />
}
