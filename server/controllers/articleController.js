import Article from '../models/articleModel.js'

export async function listArticles(req, res) {
  try {
    const filter = {}
    if (req.query.published === 'true') filter.published = true
    const articles = await Article.find(filter).sort({ createdAt: -1 }).lean()
    return res.json({ data: articles })
  } catch (error) {
    console.error('listArticles error', error)
    return res.status(500).json({ message: 'Failed to list articles' })
  }
}

export async function createArticle(req, res) {
  try {
    const { title, content, authorId, authorName, authorRole } = req.body || {}
    if (!title || !content || !authorId || !authorName || !authorRole) {
      return res.status(400).json({ message: 'Missing required article fields' })
    }
    const created = await Article.create({ title, content, authorId, authorName, authorRole, published: true })
    return res.status(201).json({ data: created.toObject() })
  } catch (error) {
    console.error('createArticle error', error)
    return res.status(500).json({ message: 'Failed to create article' })
  }
}

export async function updateArticle(req, res) {
  try {
    const updated = await Article.findByIdAndUpdate(req.params.id, req.body || {}, {
      new: true,
      runValidators: true,
    }).lean()
    if (!updated) return res.status(404).json({ message: 'Article not found' })
    return res.json({ data: updated })
  } catch (error) {
    console.error('updateArticle error', error)
    return res.status(500).json({ message: 'Failed to update article' })
  }
}

export async function deleteArticle(req, res) {
  try {
    const deleted = await Article.findByIdAndDelete(req.params.id).lean()
    if (!deleted) return res.status(404).json({ message: 'Article not found' })
    return res.status(204).end()
  } catch (error) {
    console.error('deleteArticle error', error)
    return res.status(500).json({ message: 'Failed to delete article' })
  }
}
