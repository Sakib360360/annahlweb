import { useEffect, useState } from 'react'
import { addTaskComment, fetchAdmins, fetchTasks, updateTask } from '../../services/api'

const STATUSES = ['Pending', 'Ongoing', 'In Progress', 'Done', 'Completed']

const statusStyle = {
  Pending: { badge: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  Ongoing: { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
  'In Progress': { badge: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  Completed: { badge: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  Done: { badge: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
}

const priorityStyle = {
  High: 'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Low: 'bg-green-100 text-green-700 border-green-200',
}

function isOverdue(deadline, status) {
  if (status === 'Completed' || status === 'Done') return false
  return new Date(deadline) < new Date()
}

function isDueToday(deadline) {
  const due = new Date(deadline)
  const now = new Date()
  return due.getFullYear() === now.getFullYear() && due.getMonth() === now.getMonth() && due.getDate() === now.getDate()
}

function daysUntil(deadline) {
  const diff = new Date(deadline) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function MgmtTaskDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [admins, setAdmins] = useState([])
  const [tasks, setTasks] = useState([])
  const [comments, setComments] = useState({})
  const [selectedAssignee, setSelectedAssignee] = useState('all')
  const [expandedTask, setExpandedTask] = useState(null)

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [adminData, taskData] = await Promise.all([fetchAdmins(), fetchTasks()])
      setAdmins(adminData)
      setTasks(taskData)
    } catch (e) {
      setError(e.message || 'Failed to load task dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleStatusChange(id, status) {
    try {
      const updated = await updateTask(id, { status })
      setTasks((prev) => prev.map((task) => (task._id === id ? updated : task)))
    } catch (e) {
      setError(e.message || 'Failed to update task status')
    }
  }

  async function handleAddComment(id) {
    const comment = comments[id]?.trim()
    if (!comment) return
    try {
      const updated = await addTaskComment(id, comment)
      setTasks((prev) => prev.map((task) => (task._id === id ? updated : task)))
      setComments((prev) => ({ ...prev, [id]: '' }))
    } catch (e) {
      setError(e.message || 'Failed to add comment')
    }
  }

  async function handleMarkComplete(id) {
    await handleStatusChange(id, 'Completed')
  }

  const filtered = selectedAssignee === 'all' ? tasks : tasks.filter((task) => task.assignedTo === selectedAssignee)

  function getAssignee(id) {
    return admins.find((admin) => admin.id === id)
  }

  const stats = {
    total: tasks.length,
    pending: tasks.filter((task) => task.status === 'Pending').length,
    ongoing: tasks.filter((task) => ['Ongoing', 'In Progress'].includes(task.status)).length,
    completed: tasks.filter((task) => ['Completed', 'Done'].includes(task.status)).length,
    overdue: tasks.filter((task) => isOverdue(task.deadline, task.status)).length,
  }

  if (loading) {
    return <div className="rounded-2xl bg-white p-8 text-sm text-slate-500 shadow-sm">Loading tasks from database…</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Task Management Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">All task updates and comments are synced with API + MongoDB.</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: 'Total', value: stats.total, color: 'border-slate-300 text-slate-700' },
          { label: 'Pending', value: stats.pending, color: 'border-slate-400 text-slate-600' },
          { label: 'Active', value: stats.ongoing, color: 'border-blue-400 text-blue-600' },
          { label: 'Completed', value: stats.completed, color: 'border-green-400 text-green-600' },
          { label: 'Overdue', value: stats.overdue, color: 'border-red-400 text-red-600' },
        ].map((item) => (
          <div key={item.label} className={`rounded-2xl bg-white p-4 shadow-sm border-l-4 ${item.color} text-center`}>
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedAssignee('all')}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${selectedAssignee === 'all' ? 'bg-brand-600 text-white shadow' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          All Staff
        </button>
        {admins.map((admin) => (
          <button
            key={admin.id}
            onClick={() => setSelectedAssignee(admin.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${selectedAssignee === admin.id ? 'bg-brand-600 text-white shadow' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            {admin.name}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && <div className="rounded-2xl bg-white p-10 text-center text-slate-400 shadow-sm">No tasks for selected user.</div>}

        {filtered.map((task) => {
          const assignee = getAssignee(task.assignedTo)
          const overdue = isOverdue(task.deadline, task.status)
          const dueToday = isDueToday(task.deadline)
          const days = daysUntil(task.deadline)
          const style = statusStyle[task.status] || statusStyle.Pending
          const expanded = expandedTask === task._id

          return (
            <div key={task._id} className={`rounded-2xl bg-white shadow-sm border ${overdue ? 'border-red-200 bg-red-50/30' : 'border-transparent'} transition`}>
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`inline-block h-2 w-2 rounded-full ${style.dot}`} />
                      <h3 className="font-semibold text-slate-800">{task.title}</h3>
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${priorityStyle[task.priority] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>{task.priority}</span>
                      {overdue && <span className="rounded-full bg-red-100 border border-red-200 px-2 py-0.5 text-xs font-semibold text-red-600">⚠ Overdue</span>}
                      {dueToday && !overdue && <span className="rounded-full bg-orange-100 border border-orange-200 px-2 py-0.5 text-xs font-semibold text-orange-600">Due Today</span>}
                    </div>

                    {task.description && <p className="text-sm text-slate-500 mb-2">{task.description}</p>}

                    <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                      {assignee && <span>👤 {assignee.name} — {assignee.title || assignee.role || 'Admin'}</span>}
                      <span>📅 Start: {task.startDate}</span>
                      <span className={overdue ? 'text-red-500 font-semibold' : ''}>
                        🏁 Deadline: {task.deadline}{' '}
                        {!overdue && days >= 0 && <span className={`ml-1 font-semibold ${days <= 2 ? 'text-red-500' : days <= 5 ? 'text-amber-500' : 'text-slate-500'}`}>({days === 0 ? 'today' : `${days}d left`})</span>}
                      </span>
                    </div>
                  </div>

                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    title="Update task status"
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer focus:outline-none ${style.badge}`}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <button onClick={() => setExpandedTask(expanded ? null : task._id)} className="text-xs font-medium text-brand-600 hover:underline">
                    {expanded ? '▲ Hide details' : '▼ View details & comments'}
                  </button>

                  {!['Completed', 'Done'].includes(task.status) && (
                    <button onClick={() => handleMarkComplete(task._id)} className="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 transition">
                      ✓ Mark Complete
                    </button>
                  )}
                </div>
              </div>

              {expanded && (
                <div className="border-t border-slate-100 px-5 pb-5 pt-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Comments</p>

                  {(!task.comments || task.comments.length === 0) && <p className="text-xs text-slate-400 italic">No comments yet.</p>}

                  {(task.comments || []).map((comment, index) => (
                    <div key={index} className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-sm text-slate-700">
                      💬 {comment}
                    </div>
                  ))}

                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={comments[task._id] ?? ''}
                      onChange={(e) => setComments((prev) => ({ ...prev, [task._id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(task._id)}
                      placeholder="Add a comment…"
                      title="Add comment"
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
                    />
                    <button onClick={() => handleAddComment(task._id)} className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition">
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
