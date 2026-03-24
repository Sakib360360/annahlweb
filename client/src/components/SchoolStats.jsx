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
        <div className="slide-up">
          <h2 className="text-3xl font-semibold text-brand-900">Live school stats</h2>
          <p className="mt-2 max-w-xl text-slate-600">
            Data is pulled live from the backend API to keep the academy dashboard current and transparent.
          </p>
        </div>
        <div className="rounded-3xl border border-white/30 bg-white/70 p-6 shadow-soft backdrop-blur min-w-[320px]">
          {loading ? (
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <svg className="h-5 w-5 animate-spin text-brand-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Loading live stats...
            </div>
          ) : error ? (
            <p className="text-sm text-rose-600">{error}</p>
          ) : (
            <div className="grid gap-4 text-center sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 animate-fadeIn">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Students</p>
                <p className="mt-2 text-3xl font-semibold text-brand-900">{counts.students}+</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 animate-fadeIn stagger-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Teachers</p>
                <p className="mt-2 text-3xl font-semibold text-brand-900">{counts.teachers}+</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 animate-fadeIn stagger-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Academic Year</p>
                <p className="mt-2 text-3xl font-semibold text-brand-900">2026</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
