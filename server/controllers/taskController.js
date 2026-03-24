import mongoose from 'mongoose'
import Task from '../models/taskModel.js'

function isMongoConnected() {
  return mongoose.connection.readyState === 1
}

export async function listTasks(req, res) {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'MongoDB not connected' })
    }

    const filter = {}
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo
    if (req.query.status) filter.status = req.query.status

    const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean()
    return res.json({ data: tasks })
  } catch (error) {
    console.error('listTasks error', error)
    return res.status(500).json({ message: 'Failed to list tasks' })
  }
}

export async function createTask(req, res) {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'MongoDB not connected' })
    }

    const { title, description, assignedTo, priority, startDate, deadline, status } = req.body || {}
    if (!title || !assignedTo || !startDate || !deadline) {
      return res.status(400).json({ message: 'Missing required task fields' })
    }

    const created = await Task.create({
      title,
      description: description ?? '',
      assignedTo,
      priority: priority ?? 'Medium',
      startDate,
      deadline,
      status: status ?? 'Pending',
      comments: [],
    })

    return res.status(201).json({ data: created.toObject() })
  } catch (error) {
    console.error('createTask error', error)
    return res.status(500).json({ message: 'Failed to create task' })
  }
}

export async function updateTask(req, res) {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'MongoDB not connected' })
    }

    const updates = req.body || {}
    const updated = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).lean()

    if (!updated) return res.status(404).json({ message: 'Task not found' })
    return res.json({ data: updated })
  } catch (error) {
    console.error('updateTask error', error)
    return res.status(500).json({ message: 'Failed to update task' })
  }
}

export async function addTaskComment(req, res) {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({ message: 'MongoDB not connected' })
    }

    const { comment } = req.body || {}
    if (!comment || !String(comment).trim()) {
      return res.status(400).json({ message: 'comment is required' })
    }

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: String(comment).trim() } },
      { new: true, runValidators: true },
    ).lean()

    if (!updated) return res.status(404).json({ message: 'Task not found' })
    return res.json({ data: updated })
  } catch (error) {
    console.error('addTaskComment error', error)
    return res.status(500).json({ message: 'Failed to add comment' })
  }
}