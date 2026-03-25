import AcademicDoc from '../models/academicDocModel.js'

export async function listAcademicDocs(req, res) {
  try {
    const docs = await AcademicDoc.find().sort({ session: -1, type: 1, ap: 1 })
    res.json({ data: docs })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export async function upsertAcademicDoc(req, res) {
  const { type, session, ap, link, uploadedBy } = req.body

  if (!type || !session || !link) {
    return res.status(400).json({ message: 'type, session, and link are required' })
  }
  if (type === 'MTP' && !ap) {
    return res.status(400).json({ message: 'ap is required for MTP documents' })
  }

  try {
    const filter = type === 'LTP' ? { type, session, ap: null } : { type, session, ap }
    const update = { ...filter, link, uploadedBy: uploadedBy || '', uploadedAt: new Date() }
    const doc = await AcademicDoc.findOneAndUpdate(filter, update, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    })
    res.json({ data: doc })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
