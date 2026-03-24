import { useEffect, useState } from 'react'
import { createTask, fetchAdmins, fetchTasks, updateTask } from '../../services/api'

const PRIORITIES = ['Low', 'Medium', 'High']
const STATUSES = ['Pending', 'Ongoing', 'In Progress', 'Completed']

const priorityStyle = {
  High: 'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Low: 'bg-green-100 text-green-700 border-green-200',
}
const statusStyle = {
  Pending: 'bg-slate-100 text-slate-600 border-slate-200',
  Ongoing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  Completed: 'bg-green-100 text-green-700 border-green-200',
  Done: 'bg-green-100 text-green-700 border-green-200',
}

const emptyForm = {
  title: '',
  description: '',
  assignedTo: '',
  priority: 'Medium',
  startDate: '',
  deadline: '',
  status: 'Pending',
}

export default function MgmtAdministration() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [admins, setAdmins] = useState([])
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [filterStatus, setFilterStatus] = useState('All')

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [adminData, taskData] = await Promise.all([fetchAdmins(), fetchTasks()])
      setAdmins(adminData)
      setTasks(taskData)
    } catch (e) {
      setError(e.message || 'Failed to load administration data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function validate() {
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'Task title is required'
    if (!form.assignedTo) nextErrors.assignedTo = 'Please assign to an admin user'
    if (!form.startDate) nextErrors.startDate = 'Start date is required'
    if (!form.deadline) nextErrors.deadline = 'Deadline is required'
    if (form.startDate && form.deadline && form.deadline < form.startDate) {
      nextErrors.deadline = 'Deadline must be after start date'
    }
    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    try {
      await createTask(form)
      setForm(emptyForm)
      setErrors({})
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      await loadData()
    } catch (e) {
      setError(e.message || 'Failed to create task')
    }
  }

  async function handleStatusChange(taskId, status) {
    try {
      await updateTask(taskId, { status })
      setTasks((prev) => prev.map((task) => (task._id === taskId ? { ...task, status } : task)))
    } catch (e) {
      setError(e.message || 'Failed to update task status')
    }
  }

  function getAssigneeName(id) {
    return admins.find((admin) => admin.id === id)?.name || id
  }

  function getAssigneeRole(id) {
    return admins.find((admin) => admin.id === id)?.title || admins.find((admin) => admin.id === id)?.role || ''
  }

  const visibleTasks = filterStatus === 'All' ? tasks : tasks.filter((task) => task.status === filterStatus)

  if (loading) {
    return <div className="rounded-2xl bg-white p-8 text-sm text-slate-500 shadow-sm">Loading administration data from database…</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Administration Management</h1>
        <p className="mt-1 text-sm text-slate-500">Create and assign tasks to admin users from database records.</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-base font-bold text-slate-800">Create New Task</h2>
        {success && <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-700">✓ Task created successfully.</div>}

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label-style">Task Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter task title"
              title="Task title"
              className={`input-style ${errors.title ? 'border-red-300' : ''}`}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="label-style">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the task…"
              title="Task description"
              className="input-style resize-none"
            />
          </div>

          <div>
            <label className="label-style">Assign To</label>
            <select
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              title="Assign task"
              className={`input-style ${errors.assignedTo ? 'border-red-300' : ''}`}
            >
              <option value="">— Select user —</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name} ({admin.title || admin.role || 'Admin'})
                </option>
              ))}
            </select>
            {errors.assignedTo && <p className="mt-1 text-xs text-red-500">{errors.assignedTo}</p>}
          </div>

          <div>
            <label className="label-style">Priority</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} title="Task priority" className="input-style">
              {PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}
            </select>
          </div>

          <div>
            <label className="label-style">Start Date</label>
            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} title="Task start date" className={`input-style ${errors.startDate ? 'border-red-300' : ''}`} />
            {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
          </div>

          <div>
            <label className="label-style">Deadline</label>
            <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} title="Task deadline" className={`input-style ${errors.deadline ? 'border-red-300' : ''}`} />
            {errors.deadline && <p className="mt-1 text-xs text-red-500">{errors.deadline}</p>}
          </div>

          <div>
            <label className="label-style">Initial Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} title="Task status" className="input-style">
              {STATUSES.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" title="Create task" className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-brand-700 transition active:scale-95">Create &amp; Assign Task</button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-800">All Tasks ({visibleTasks.length})</h2>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} title="Filter by status" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-brand-400">
            <option value="All">All Statuses</option>
            {STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          {visibleTasks.length === 0 && <p className="text-center py-8 text-slate-400 text-sm">No tasks found in database.</p>}

          {visibleTasks.map((task) => (
            <div key={task._id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 hover:shadow-sm transition">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800">{task.title}</h3>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${priorityStyle[task.priority] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && <p className="text-sm text-slate-500 mb-2">{task.description}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                    <span>👤 {getAssigneeName(task.assignedTo)}</span>
                    <span className="text-slate-300">·</span>
                    <span>{getAssigneeRole(task.assignedTo)}</span>
                    <span className="text-slate-300">·</span>
                    <span>📅 {task.startDate} → {task.deadline}</span>
                  </div>
                </div>
                <select value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)} title="Change task status" className={`rounded-xl border px-3 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer ${statusStyle[task.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {STATUSES.map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .label-style { display:block; margin-bottom:6px; font-size:.8rem; font-weight:600; color:#475569; }
        .input-style { width:100%; border-radius:.75rem; border:1px solid #e2e8f0; background:#f8fafc; padding:.6rem 1rem; font-size:.875rem; color:#1e293b; outline:none; transition: border-color .15s, box-shadow .15s; }
        .input-style:focus { border-color:#16a34a; box-shadow:0 0 0 3px rgba(22,163,74,.15); }
      `}</style>
    </div>
  )
}
