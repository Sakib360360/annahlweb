import mongoose from 'mongoose'

const studentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    role: { type: String, default: 'student' },
    name: { type: String, required: true },
    grade: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    section: { type: String, default: '' },
    roll: { type: String, default: '' },
    parentName: { type: String, default: '' },
    address: { type: String, default: '' },
    photo: { type: String, default: '' },
    sessionAdmitted: { type: String },
    password: { type: String, required: true },
    teacherId: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
)

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema)
export default Student
