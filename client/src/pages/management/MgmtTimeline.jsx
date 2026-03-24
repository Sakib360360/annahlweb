import { useEffect, useState } from 'react'
import { fetchAdmins, fetchTasks } from '../../services/api'

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
  return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
}

function CountdownBadge({ deadline, status }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (status === 'Completed' || status === 'Done') {
    return <span className="rounded-full bg-green-100 border border-green-200 px-2.5 py-1 text-xs font-semibold text-green-700">✓ Completed</span>
  }

  const diff = new Date(deadline) - now
  if (diff < 0) {
    const overBy = Math.floor(-diff / (1000 * 60 * 60 * 24))
    return <span className="rounded-full bg-red-100 border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600">⚠ Overdue by {overBy}d</span>
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const secs = Math.floor((diff % (1000 * 60)) / 1000)

  const color = days === 0 ? 'bg-orange-100 border-orange-200 text-orange-700' : days <= 3 ? 'bg-yellow-100 border-yellow-200 text-yellow-700' : 'bg-blue-100 border-blue-200 text-blue-700'

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-mono font-semibold ${color}`}>
      {days > 0 ? `${days}d ` : ''}
      {String(hrs).padStart(2, '0')}:{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  )
}

const STATUS_COLOR = {
  Completed: 'bg-green-500',
  Done: 'bg-green-500',
  'In Progress': 'bg-blue-500',
  Ongoing: 'bg-yellow-400',
  Pending: 'bg-slate-300',
}

const CARD_STYLE = {
  overdue: 'border-red-200 bg-red-50',
  dueToday: 'border-orange-200 bg-orange-50',
  upcoming: 'border-blue-100 bg-white',
  completed: 'border-green-100 bg-green-50/40',
}

export default function MgmtTimeline() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tasks, setTasks] = useState([])
  const [admins, setAdmins] = useState([])

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [taskData, adminData] = await Promise.all([fetchTasks(), fetchAdmins()])
        if (!mounted) return
        setTasks(taskData)
        setAdmins(adminData)
      } catch (e) {
        if (!mounted) return
        setError(e.message || 'Failed to load timeline data')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  function getAssignee(id) {
    return admins.find((admin) => admin.id === id)
  }

  const overdueTasks = tasks.filter((task) => isOverdue(task.deadline, task.status))
  const dueTodayTasks = tasks.filter((task) => isDueToday(task.deadline) && !isOverdue(task.deadline, task.status) && !['Completed', 'Done'].includes(task.status))
  const upcomingTasks = tasks.filter((task) => !isOverdue(task.deadline, task.status) && !isDueToday(task.deadline) && !['Completed', 'Done'].includes(task.status) && daysUntil(task.deadline) <= 7)
  const completedTasks = tasks.filter((task) => ['Completed', 'Done'].includes(task.status))

  function TaskRow({ task, variant }) {
    const assignee = getAssignee(task.assignedTo)
    const cardStyle = CARD_STYLE[variant] ?? 'border-slate-100 bg-white'

    return (
      <div className={`rounded-xl border p-4 ${cardStyle} transition`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full ${STATUS_COLOR[task.status] || 'bg-slate-300'}`} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800">{task.title}</p>
              {task.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>}
              <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
                {assignee && <span>👤 {assignee.name}</span>}
                <span>📅 Deadline: {task.deadline}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <CountdownBadge deadline={task.deadline} status={task.status} />
            <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${task.priority === 'High' ? 'bg-red-100 border-red-200 text-red-700' : task.priority === 'Medium' ? 'bg-yellow-100 border-yellow-200 text-yellow-700' : 'bg-green-100 border-green-200 text-green-700'}`}>
              {task.priority}
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="rounded-2xl bg-white p-8 text-sm text-slate-500 shadow-sm">Loading timeline from database…</div>
  }

  if (error) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-sm text-red-600 shadow-sm">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reminders &amp; Timeline</h1>
        <p className="mt-1 text-sm text-slate-500">Live countdown timers and deadline indicators sourced from API tasks.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Overdue', count: overdueTasks.length, color: 'bg-red-100 text-red-700 border-red-200' },
          { label: 'Due Today', count: dueTodayTasks.length, color: 'bg-orange-100 text-orange-700 border-orange-200' },
          { label: 'Upcoming', count: upcomingTasks.length, color: 'bg-blue-100 text-blue-700 border-blue-200' },
          { label: 'Completed', count: completedTasks.length, color: 'bg-green-100 text-green-700 border-green-200' },
        ].map((chip) => (
          <span key={chip.label} className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${chip.color}`}>
            <span>{chip.label}</span>
            <span className="rounded-full bg-white/60 px-1.5 py-0.5 text-xs">{chip.count}</span>
          </span>
        ))}
      </div>

      {overdueTasks.length > 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-red-600"><span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />Overdue Tasks ({overdueTasks.length})</h2>
          <div className="space-y-3">{overdueTasks.map((task) => <TaskRow key={task._id} task={task} variant="overdue" />)}</div>
        </div>
      )}

      {dueTodayTasks.length > 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-orange-600"><span className="h-2.5 w-2.5 rounded-full bg-orange-400" />Due Today ({dueTodayTasks.length})</h2>
          <div className="space-y-3">{dueTodayTasks.map((task) => <TaskRow key={task._id} task={task} variant="dueToday" />)}</div>
        </div>
      )}

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-blue-600"><span className="h-2.5 w-2.5 rounded-full bg-blue-400" />Upcoming Tasks ({upcomingTasks.length})</h2>
        {upcomingTasks.length === 0 ? <p className="text-sm text-slate-400 italic">No upcoming tasks in the next 7 days.</p> : <div className="space-y-3">{upcomingTasks.map((task) => <TaskRow key={task._id} task={task} variant="upcoming" />)}</div>}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-5 text-base font-bold text-slate-800">Full Task Timeline</h2>
        <div className="relative pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-100" />
          <div className="space-y-5">
            {[...tasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).map((task) => {
              const done = ['Completed', 'Done'].includes(task.status)
              const overdue = isOverdue(task.deadline, task.status)
              const dotColor = done ? 'bg-green-500' : overdue ? 'bg-red-500 animate-pulse' : 'bg-blue-400'
              const assignee = getAssignee(task.assignedTo)

              return (
                <div key={task._id} className="relative flex gap-4">
                  <div className={`absolute -left-6 mt-1 h-4 w-4 rounded-full border-2 border-white shadow ${dotColor}`} />
                  <div className={`flex-1 rounded-xl border p-4 ${done ? 'bg-green-50 border-green-100' : overdue ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-slate-800">{task.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{assignee?.name || task.assignedTo} · Deadline: <strong>{task.deadline}</strong></p>
                      </div>
                      <CountdownBadge deadline={task.deadline} status={task.status} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-green-600"><span className="h-2.5 w-2.5 rounded-full bg-green-500" />Completed Tasks ({completedTasks.length})</h2>
        <div className="space-y-3">{completedTasks.map((task) => <TaskRow key={task._id} task={task} variant="completed" />)}</div>
      </div>
    </div>
  )
}
