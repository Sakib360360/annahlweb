import mongoose from 'mongoose'

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    authorRole: { type: String, required: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
)

const Article = mongoose.models.Article || mongoose.model('Article', articleSchema)
export default Article
