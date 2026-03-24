export function requireRoles(...roles) {
  return (req, res, next) => {
    const role = req.header('x-user-role')
    if (!role) {
      return res.status(401).json({ message: 'Missing user role' })
    }
    if (!roles.includes(role)) {
      return res.status(403).json({ message: 'Forbidden for this role' })
    }
    return next()
  }
}
