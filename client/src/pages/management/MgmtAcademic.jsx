import { useEffect, useMemo, useState } from 'react'
import { fetchStudentProgress, fetchStudents } from '../../services/api'

function ProgressBar({ pct, color = 'bg-brand-500' }) {
  return (
    <div className="h-2.5 w-full rounded-full bg-slate-100">
      <div className={`h-2.5 rounded-full ${color} transition-all duration-700`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  )
}

function RingIndicator({ pct, size = 80, stroke = 8, color = '#16a34a' }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dash = (Math.max(0, Math.min(100, pct)) / 100) * circumference
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round" />
    </svg>
  )
}

function countCompletedWeeks(apProgress) {
  const weeks = apProgress?.weeks || []
  return weeks.reduce((count, week) => {
    const hasEntry = (week.days || []).some((day) => day && day.subjects && Object.keys(day.subjects).length > 0)
    return count + (hasEntry ? 1 : 0)
  }, 0)
}

function getStudentProgressData(progress) {
  if (!progress?.ap) {
    return {
      overall: 0,
      apScores: { AP1: 0, AP2: 0, AP3: 0, AP4: 0, AP5: 0, AP6: 0 },
    }
  }

  const apLabels = ['AP1', 'AP2', 'AP3', 'AP4', 'AP5', 'AP6']
  const apScores = {}
  let total = 0

  for (const label of apLabels) {
    const completed = countCompletedWeeks(progress.ap?.[label])
    const score = Math.round((completed / 6) * 100)
    apScores[label] = score
    total += score
  }

  return {
    overall: Math.round(total / apLabels.length),
    apScores,
  }
}

export default function MgmtAcademic() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [students, setStudents] = useState([])
  const [progressMap, setProgressMap] = useState({})

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const studentData = await fetchStudents()
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
        setProgressMap(Object.fromEntries(progressEntries))
      } catch (e) {
        if (!mounted) return
        setError(e.message || 'Failed to load academic data')
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
      students.map((student) => {
        const metrics = getStudentProgressData(progressMap[student.id])
        return {
          ...student,
          overallProgress: metrics.overall,
          apScores: metrics.apScores,
        }
      }),
    [students, progressMap],
  )

  const totalStudents = enrichedStudents.length
  const avgProgress = totalStudents > 0 ? Math.round(enrichedStudents.reduce((sum, s) => sum + s.overallProgress, 0) / totalStudents) : 0
  const topStudents = [...enrichedStudents].filter((student) => student.overallProgress >= 70)
  const weakStudents = [...enrichedStudents].filter((student) => student.overallProgress < 40)

  const apLabels = ['AP1', 'AP2', 'AP3', 'AP4', 'AP5', 'AP6']
  const subjectAvg = apLabels.map((label) => {
    const average =
      totalStudents > 0
        ? Math.round(enrichedStudents.reduce((sum, student) => sum + (student.apScores?.[label] || 0), 0) / totalStudents)
        : 0
    return { subject: label, avg: average }
  })

  const classProgress = Object.values(
    enrichedStudents.reduce((acc, student) => {
      const grade = student.grade || 'Unknown'
      if (!acc[grade]) {
        acc[grade] = { class: grade, students: 0, total: 0 }
      }
      acc[grade].students += 1
      acc[grade].total += student.overallProgress
      return acc
    }, {}),
  ).map((entry) => ({
    class: entry.class,
    students: entry.students,
    avgProgress: entry.students ? Math.round(entry.total / entry.students) : 0,
  }))

  if (loading) {
    return <div className="rounded-2xl bg-white p-8 text-sm text-slate-500 shadow-sm">Loading academic progress from database…</div>
  }

  if (error) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-sm text-red-600 shadow-sm">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Academic Progress Overview</h1>
        <p className="mt-1 text-sm text-slate-500">All values are generated from student progress APIs and database records.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: 'Total Students', value: totalStudents, pct: 100, color: '#2563eb' },
          { label: 'Average Performance', value: `${avgProgress}%`, pct: avgProgress, color: '#16a34a' },
          {
            label: 'Top Performing Students',
            value: topStudents.length,
            pct: totalStudents ? Math.round((topStudents.length / totalStudents) * 100) : 0,
            color: '#d97706',
          },
          {
            label: 'Weak Students',
            value: weakStudents.length,
            pct: totalStudents ? Math.round((weakStudents.length / totalStudents) * 100) : 0,
            color: '#dc2626',
          },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center rounded-2xl bg-white p-5 shadow-sm">
            <div className="relative">
              <RingIndicator pct={item.pct} color={item.color} />
              <div className="absolute inset-0 flex items-center justify-center rotate-90">
                <span className="text-lg font-bold text-slate-800">{item.value}</span>
              </div>
            </div>
            <p className="mt-3 text-center text-sm font-medium text-slate-600">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-base font-bold text-slate-800">Subject-wise Progress (AP-wise)</h2>
        <div className="space-y-4">
          {subjectAvg.map((item) => (
            <div key={item.subject}>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-medium text-slate-700">{item.subject}</span>
                <span className="font-bold" style={{ color: item.avg >= 70 ? '#16a34a' : item.avg >= 40 ? '#2563eb' : '#d97706' }}>
                  {item.avg}%
                </span>
              </div>
              <ProgressBar pct={item.avg} color={item.avg >= 70 ? 'bg-green-500' : item.avg >= 40 ? 'bg-brand-500' : 'bg-amber-400'} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-base font-bold text-slate-800">Class-wise Progress</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {classProgress.map((item) => (
            <div key={item.class} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-slate-800">{item.class}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${item.avgProgress >= 70 ? 'bg-green-100 text-green-700' : item.avgProgress >= 40 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                  {item.avgProgress}%
                </span>
              </div>
              <ProgressBar pct={item.avgProgress} color={item.avgProgress >= 70 ? 'bg-green-500' : item.avgProgress >= 40 ? 'bg-brand-500' : 'bg-amber-400'} />
              <div className="mt-3 text-xs text-slate-500">{item.students} students</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-slate-800">Top Performing Students</h2>
          <div className="space-y-3">
            {[...topStudents]
              .sort((a, b) => b.overallProgress - a.overallProgress)
              .slice(0, 8)
              .map((student) => (
                <div key={student.id} className="flex items-center gap-3 rounded-xl bg-green-50 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-white text-sm font-bold flex-shrink-0">
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{student.name}</p>
                    <p className="text-xs text-slate-400">{student.grade || 'N/A'}</p>
                  </div>
                  <span className="text-sm font-bold text-green-600">{student.overallProgress}%</span>
                </div>
              ))}
            {topStudents.length === 0 && <p className="text-sm text-slate-400">No top performers identified yet.</p>}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-slate-800">Weak Students</h2>
          <div className="space-y-3">
            {[...weakStudents]
              .sort((a, b) => a.overallProgress - b.overallProgress)
              .slice(0, 8)
              .map((student) => (
                <div key={student.id} className="rounded-xl bg-red-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-400 text-white text-sm font-bold flex-shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{student.name}</p>
                      <p className="text-xs text-slate-400">{student.grade || 'N/A'} · {student.teacherId || 'Unassigned'}</p>
                    </div>
                    <span className="text-sm font-bold text-red-500">{student.overallProgress}%</span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar pct={student.overallProgress} color="bg-red-400" />
                  </div>
                </div>
              ))}
            {weakStudents.length === 0 && <p className="text-sm text-slate-400">No weak students detected.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
