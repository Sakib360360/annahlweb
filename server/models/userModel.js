import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, default: null, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['management', 'admin', 'teacher', 'student'], required: true, index: true },
    name: { type: String, required: true },
    active: { type: Boolean, default: true },
    profilePhoto: { type: String, default: '' },
  },
  { timestamps: true },
)

const User = mongoose.models.User || mongoose.model('User', userSchema)
export default User
