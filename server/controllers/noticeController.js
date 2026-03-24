import Notice from '../models/noticeModel.js'

export async function listNotices(req, res) {
  try {
    const filter = {}
    if (req.query.active === 'true') filter.active = true
    const notices = await Notice.find(filter).sort({ createdAt: -1 }).lean()
    return res.json({ data: notices })
  } catch (error) {
    console.error('listNotices error', error)
    return res.status(500).json({ message: 'Failed to list notices' })
  }
}

export async function createNotice(req, res) {
  try {
    const { title, content, authorId, authorName, authorRole } = req.body || {}
    if (!title || !content || !authorId || !authorName || !authorRole) {
      return res.status(400).json({ message: 'Missing required notice fields' })
    }
    const created = await Notice.create({ title, content, authorId, authorName, authorRole, active: true })
    return res.status(201).json({ data: created.toObject() })
  } catch (error) {
    console.error('createNotice error', error)
    return res.status(500).json({ message: 'Failed to create notice' })
  }
}

export async function updateNotice(req, res) {
  try {
    const updated = await Notice.findByIdAndUpdate(req.params.id, req.body || {}, {
      new: true,
      runValidators: true,
    }).lean()
    if (!updated) return res.status(404).json({ message: 'Notice not found' })
    return res.json({ data: updated })
  } catch (error) {
    console.error('updateNotice error', error)
    return res.status(500).json({ message: 'Failed to update notice' })
  }
}

export async function deleteNotice(req, res) {
  try {
    const deleted = await Notice.findByIdAndDelete(req.params.id).lean()
    if (!deleted) return res.status(404).json({ message: 'Notice not found' })
    return res.status(204).end()
  } catch (error) {
    console.error('deleteNotice error', error)
    return res.status(500).json({ message: 'Failed to delete notice' })
  }
}
