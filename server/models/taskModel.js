import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    assignedTo: { type: String, required: true, trim: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    startDate: { type: String, required: true },
    deadline: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Ongoing', 'In Progress', 'Completed', 'Done'], default: 'Pending' },
    comments: { type: [String], default: [] },
  },
  {
    timestamps: true,
  },
)

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema)
export default Task