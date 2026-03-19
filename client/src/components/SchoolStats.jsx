import { useEffect, useState } from 'react'
import { fetchStudents, fetchTeachers } from '../services/api'

export default function SchoolStats() {
  const [counts, setCounts] = useState({ students: 0, teachers: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchStudents(), fetchTeachers()])
      .then(([students, teachers]) => {
        setCounts({ students: students.length, teachers: teachers.length })
        setError('')
      })
      .catch(() => {
        setError('Unable to load live stats. Please check backend connection.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-brand-900">Live school stats</h2>
          <p className="mt-2 max-w-xl text-slate-600">
            Data is pulled live from the backend API. This demonstrates the connection between the frontend and backend.
          </p>
        </div>
        <div className="rounded-3xl border border-white/30 bg-white/70 p-6 shadow-soft backdrop-blur">
          {loading ? (
            <p className="text-sm text-slate-600">Loading...</p>
          ) : error ? (
            <p className="text-sm text-rose-600">{error}</p>
          ) : (
            <div className="grid gap-4 text-center sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Students</p>
                <p className="mt-2 text-3xl font-semibold text-brand-900">{counts.students}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Teachers</p>
                <p className="mt-2 text-3xl font-semibold text-brand-900">{counts.teachers}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
