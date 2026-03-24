import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    role: { type: String, default: 'admin' },
    name: { type: String, required: true },
    title: { type: String },
    email: { type: String, default: null, unique: true, sparse: true },
    phone: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    active: { type: Boolean, default: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
)

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema)
export default Admin
