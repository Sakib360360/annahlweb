import { verifyCredentials } from '../models/dataStore.js'

export function login(req, res) {
  const { id, email, password } = req.body || {}
  const user = verifyCredentials({ id, email, password })
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }
  return res.json({ user, token: 'fake-jwt-token' })
}
