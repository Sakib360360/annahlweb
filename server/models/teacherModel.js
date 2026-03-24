import mongoose from 'mongoose'

const teacherSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    role: { type: String, default: 'teacher' },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    photoUrl: { type: String },
    joinedDate: { type: Date },
    position: { type: String },
    department: { type: String },
    address: { type: String },
    education: { type: String },
    subject: { type: String },
    assignedClass: { type: String, default: '' },
    active: { type: Boolean, default: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
)

const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema)
export default Teacher
