import { getAllAdmins } from '../models/dataStore.js'

export function listAdmins(req, res) {
  return res.json({ data: getAllAdmins() })
}
