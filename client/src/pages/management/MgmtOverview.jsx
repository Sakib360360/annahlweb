import { useEffect, useMemo, useState } from 'react'
import {
  fetchAdmins,
  fetchStudentProgress,
  fetchStudents,
  fetchTasks,
  fetchTeacherPerformance,
  fetchTeachers,
} from '../../services/api'
import { managementLeaders } from '../../data/managementData'

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className={`rounded-2xl bg-white p-5 shadow-sm border-l-4 ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-800">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-slate-400">{icon}</div>
      </div>
    </div>
  )
}

function ProgressBar({ pct, color = 'bg-brand-500' }) {
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div className={`h-2 rounded-full ${color} transition-all duration-700`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  )
}

function countCompletedWeeks(apProgress) {
  const weeks = apProgress?.weeks || []
  return weeks.reduce((count, week) => {
    const hasEntry = (week.days || []).some((day) => day && day.subjects && Object.keys(day.subjects).length > 0)
    return count + (hasEntry ? 1 : 0)
  }, 0)
}

function getStudentProgressPercent(progress) {
  if (!progress?.ap) return 0
  const APS = ['AP1', 'AP2', 'AP3', 'AP4', 'AP5', 'AP6']
  const completed = APS.reduce((sum, ap) => sum + countCompletedWeeks(progress.ap?.[ap]), 0)
  const totalExpected = APS.length * 6
  return totalExpected ? Math.round((completed / totalExpected) * 100) : 0
}

export default function MgmtOverview() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [admins, setAdmins] = useState([])
  const [tasks, setTasks] = useState([])
  const [teacherPerformance, setTeacherPerformance] = useState([])
  const [studentProgressMap, setStudentProgressMap] = useState({})

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [studentData, teacherData, adminData, taskData, performanceData] = await Promise.all([
          fetchStudents(),
          fetchTeachers(),
          fetchAdmins(),
          fetchTasks(),
          fetchTeacherPerformance(),
        ])

        const progressEntries = await Promise.all(
          studentData.map(async (student) => {
            try {
              const progress = await fetchStudentProgress(student.id)
              return [student.id, progress]
            } catch {
              return [student.id, null]
            }
          }),
        )

        if (!mounted) return
        setStudents(studentData)
        setTeachers(teacherData)
        setAdmins(adminData)
        setTasks(taskData)
        setTeacherPerformance(performanceData)
        setStudentProgressMap(Object.fromEntries(progressEntries))
      } catch (e) {
        if (!mounted) return
        setError(e.message || 'Failed to load dashboard data')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  const enrichedStudents = useMemo(
    () =>
      students.map((student) => ({
        ...student,
        computedProgress: getStudentProgressPercent(studentProgressMap[student.id]),
      })),
    [studentProgressMap, students],
  )

  const avgProgress =
    enrichedStudents.length > 0
      ? Math.round(enrichedStudents.reduce((sum, s) => sum + s.computedProgress, 0) / enrichedStudents.length)
      : 0

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => ['Completed', 'Done'].includes(t.status)).length
  const activeTasks = tasks.filter((t) => !['Completed', 'Done'].includes(t.status)).length
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length

  const topStudents = [...enrichedStudents].sort((a, b) => b.computedProgress - a.computedProgress).slice(0, 5)
  const weakStudents = [...enrichedStudents].sort((a, b) => a.computedProgress - b.computedProgress).slice(0, 3)

  const taskStatusCounts = [
    {
      label: 'Completed',
      count: completedTasks,
      color: 'bg-green-500',
      light: 'bg-green-50 text-green-700 border-green-200',
    },
    {
      label: 'In Progress',
      count: tasks.filter((t) => t.status === 'In Progress').length,
      color: 'bg-blue-500',
      light: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      label: 'Ongoing',
      count: tasks.filter((t) => t.status === 'Ongoing').length,
      color: 'bg-gold-500',
      light: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    },
    {
      label: 'Pending',
      count: pendingTasks,
      color: 'bg-slate-400',
      light: 'bg-slate-50 text-slate-600 border-slate-200',
    },
  ]

  const classProgress = Object.values(
    enrichedStudents.reduce((acc, student) => {
      const grade = student.grade || 'Unknown'
      if (!acc[grade]) {
        acc[grade] = { class: grade, students: 0, total: 0 }
      }
      acc[grade].students += 1
      acc[grade].total += student.computedProgress
      return acc
    }, {}),
  ).map((entry) => ({
    class: entry.class,
    students: entry.students,
    avgProgress: entry.students ? Math.round(entry.total / entry.students) : 0,
  }))

  const recentActivity = [
    `${tasks.length} tasks currently in database`,
    `${teachers.length} teachers loaded`,
    `${admins.length} admin users loaded`,
    `${enrichedStudents.length} students loaded`,
  ]

  if (loading) {
    return <div className="rounded-2xl bg-white p-8 text-sm text-slate-500 shadow-sm">Loading management data from database…</div>
  }

  if (error) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-sm text-red-600 shadow-sm">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-slate-500">Live data source: API + MongoDB (students, teachers, admins, tasks, progress).</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Students"
          value={enrichedStudents.length}
          sub="From database"
          color="border-brand-500"
          icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>}
        />
        <StatCard
          label="Avg Academic Progress"
          value={`${avgProgress}%`}
          sub="Computed from progress records"
          color="border-blue-500"
          icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <StatCard
          label="Active Tasks"
          value={activeTasks}
          sub={`${completedTasks} completed of ${totalTasks}`}
          color="border-gold-500"
          icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <StatCard
          label="Teachers / Admins"
          value={`${teachers.length} / ${admins.length}`}
          sub="From database"
          color="border-purple-400"
          icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V4H2v16h5m10 0v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4m10 0H7" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-slate-800">Task Status Breakdown</h2>
          {totalTasks === 0 ? (
            <p className="text-sm text-slate-400">No tasks in database yet.</p>
          ) : (
            <div className="space-y-3">
              {taskStatusCounts.map((t) => (
                <div key={t.label} className="flex items-center gap-3">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${t.light}`}>{t.label}</span>
                  <div className="flex-1">
                    <ProgressBar pct={(t.count / totalTasks) * 100} color={t.color} />
                  </div>
                  <span className="w-6 text-right text-sm font-bold text-slate-700">{t.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-slate-800">Top 5 Performers</h2>
          <div className="space-y-3">
            {topStudents.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gold-100 text-xs font-bold text-gold-700">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.grade || 'N/A'} · {s.teacherId || 'Unassigned'}</p>
                </div>
                <span className="text-sm font-bold text-brand-600">{s.computedProgress}%</span>
              </div>
            ))}
            {topStudents.length === 0 && <p className="text-sm text-slate-400">No student progress data yet.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-slate-800">Class-wise Progress</h2>
          <div className="space-y-4">
            {classProgress.map((c) => (
              <div key={c.class}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{c.class}</span>
                  <span className="font-bold text-brand-600">{c.avgProgress}%</span>
                </div>
                <ProgressBar pct={c.avgProgress} color={c.avgProgress >= 85 ? 'bg-brand-500' : c.avgProgress >= 75 ? 'bg-blue-500' : 'bg-amber-400'} />
              </div>
            ))}
            {classProgress.length === 0 && <p className="text-sm text-slate-400">No class data available.</p>}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-slate-800">Recent Activity</h2>
          <ul className="space-y-3">
            {recentActivity.map((text, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-brand-400" />
                <p className="text-sm text-slate-700">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-slate-800">Students Needing Attention</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {weakStudents.map((s) => (
            <div key={s.id} className="rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="font-semibold text-slate-800">{s.name}</p>
              <p className="text-xs text-slate-500">{s.grade || 'N/A'} · {s.teacherId || 'Unassigned'}</p>
              <div className="mt-2">
                <ProgressBar pct={s.computedProgress} color="bg-red-400" />
                <p className="mt-1 text-right text-xs font-bold text-red-600">{s.computedProgress}%</p>
              </div>
            </div>
          ))}
          {weakStudents.length === 0 && <p className="text-sm text-slate-400">No low-performing students detected from current progress records.</p>}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-slate-800">Top-Level Management (Static)</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {managementLeaders.map((leader) => (
            <div key={leader.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-800">{leader.name}</p>
              <p className="text-xs text-slate-500">{leader.title}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-slate-800">Teacher Performance Summary</h2>
        <div className="space-y-3">
          {teacherPerformance.map((teacher) => (
            <div key={teacher.teacherId}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-slate-700">{teacher.name}</span>
                <span className="font-bold text-brand-600">{teacher.totalPoints}%</span>
              </div>
              <ProgressBar pct={teacher.totalPoints} color={teacher.totalPoints >= 75 ? 'bg-brand-500' : 'bg-amber-400'} />
            </div>
          ))}
          {teacherPerformance.length === 0 && <p className="text-sm text-slate-400">No teacher performance data available.</p>}
        </div>
      </div>
    </div>
  )
}
