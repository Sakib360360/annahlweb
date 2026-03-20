import Admin from '../models/adminModel.js'

export async function listAdmins(req, res) {
  try {
    const admins = await Admin.find({}).select('-password -__v').lean()
    return res.json({ data: admins })
  } catch (error) {
    console.error('listAdmins error', error)
    return res.status(500).json({ message: 'Failed to list admins' })
  }
}
