import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export default function PrivateRoute({ allowedRoles, children }) {
  const { user, ready } = useAuth()
  const location = useLocation()

  if (!ready) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const redirectPath = {
      student: '/student-dashboard',
      teacher: '/teacher-dashboard',
      admin: '/admin-dashboard',
    }[user.role]

    return <Navigate to={redirectPath || '/'} replace />
  }

  return children
}
