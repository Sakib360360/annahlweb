import mongoose from 'mongoose'

const academicDocSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['LTP', 'MTP'], required: true },
    session: { type: String, required: true }, // e.g. '2024-2025'
    ap: { type: String, default: null },        // 'AP1'–'AP5', only for MTP
    link: { type: String, required: true },     // Google Drive URL
    uploadedBy: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

// Enforce one document per LTP-session and one per MTP-session-AP combination
academicDocSchema.index({ type: 1, session: 1, ap: 1 }, { unique: true })

export default mongoose.model('AcademicDoc', academicDocSchema)
