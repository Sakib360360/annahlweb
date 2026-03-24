import mongoose from 'mongoose'

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    authorRole: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

const Notice = mongoose.models.Notice || mongoose.model('Notice', noticeSchema)
export default Notice
