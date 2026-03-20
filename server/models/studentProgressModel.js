import mongoose from 'mongoose'

const daySchema = new mongoose.Schema(
  {
    subjects: {
      type: Map,
      of: String,
      default: {},
    },
    resources: {
      type: [
        new mongoose.Schema(
          {
            title: String,
            link: String,
            description: String,
          },
          { _id: false },
        ),
      ],
      default: [],
    },
  },
  { _id: false },
)

const weekSchema = new mongoose.Schema(
  {
    days: {
      type: [daySchema],
      default: [],
    },
  },
  { _id: false },
)

const progressSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    ap: {
      type: Map,
      of: new mongoose.Schema({
        weeks: {
          type: [weekSchema],
          default: [],
        },
      }, { _id: false }),
      default: {},
    },
    messages: {
      type: [
        new mongoose.Schema(
          {
            id: String,
            sender: String,
            text: String,
            createdAt: Date,
          },
          { _id: false },
        ),
      ],
      default: [],
    },
  },
  { timestamps: true },
)

const StudentProgress = mongoose.models.StudentProgress || mongoose.model('StudentProgress', progressSchema)
export default StudentProgress
