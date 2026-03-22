const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'

export async function fetchStudents() {
  const res = await fetch(`${BASE_URL}/students`)
  if (!res.ok) throw new Error('Failed to fetch students')
  const { data } = await res.json()
  return data
}

export async function fetchTeachers() {
  const res = await fetch(`${BASE_URL}/teachers`)
  if (!res.ok) throw new Error('Failed to fetch teachers')
  const { data } = await res.json()
  return data
}

export async function fetchStudent(id) {
  const res = await fetch(`${BASE_URL}/students/${id}`)
  if (!res.ok) throw new Error('Failed to fetch student')
  const { data } = await res.json()
  return data
}

export async function fetchTeacher(id) {
  const res = await fetch(`${BASE_URL}/teachers/${id}`)
  if (!res.ok) throw new Error('Failed to fetch teacher')
  const { data } = await res.json()
  return data
}

export async function createStudent(student) {
  const res = await fetch(`${BASE_URL}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  })
  const payload = await res.json()
  if (!res.ok) throw new Error(payload?.message ?? 'Failed to create student')
  return payload.data
}

export async function updateStudent(id, data) {
  const res = await fetch(`${BASE_URL}/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const payload = await res.json()
  if (!res.ok) throw new Error(payload?.message ?? 'Failed to update student')
  return payload.data
}

export async function deleteStudent(id) {
  const res = await fetch(`${BASE_URL}/students/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message ?? 'Failed to delete student')
  }
  return true
}

export async function createTeacher(teacher) {
  const res = await fetch(`${BASE_URL}/teachers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(teacher),
  })
  const payload = await res.json()
  if (!res.ok) throw new Error(payload?.message ?? 'Failed to create teacher')
  return payload.data
}

export async function updateTeacher(id, data) {
  const res = await fetch(`${BASE_URL}/teachers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const payload = await res.json()
  if (!res.ok) throw new Error(payload?.message ?? 'Failed to update teacher')
  return payload.data
}

export async function deleteTeacher(id) {
  const res = await fetch(`${BASE_URL}/teachers/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message ?? 'Failed to delete teacher')
  }
  return true
}

export async function assignStudentToTeacher(studentId, teacherId) {
  const res = await fetch(`${BASE_URL}/students/${studentId}/assign`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teacherId }),
  })
  const payload = await res.json()
  if (!res.ok) throw new Error(payload?.message ?? 'Failed to assign student')
  return payload.data
}

export async function fetchStudentProgress(studentId) {
  const res = await fetch(`${BASE_URL}/students/${studentId}/progress`)
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error('Failed to fetch student progress')
  }
  const { data } = await res.json()
  return data
}

export async function upsertStudentProgress(teacherId, studentId, progress) {
  const res = await fetch(`${BASE_URL}/teachers/${teacherId}/students/${studentId}/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(progress),
  })
  const payload = await res.json()
  if (!res.ok) throw new Error(payload?.message ?? 'Failed to save student progress')
  return payload.data
}

export async function fetchTeacherPerformance() {
  const res = await fetch(`${BASE_URL}/admins/teacher-performance`)
  if (!res.ok) throw new Error('Failed to fetch teacher performance')
  const { data } = await res.json()
  return data
}

async function parseJsonResponse(res) {
  try {
    return await res.json()
  } catch (error) {
    return null
  }
}

function withTimeout(promise, ms = 10000) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      reject(new Error('Request timed out (10s)'))
    }, ms)
    promise
      .then((res) => {
        clearTimeout(id)
        resolve(res)
      })
      .catch((err) => {
        clearTimeout(id)
        reject(err)
      })
  })
}

export async function login({ id, email, password }) {
  console.log('[API] login request', { url: `${BASE_URL}/login`, id, email })
  const res = await withTimeout(
    fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, email, password }),
    }),
    10000,
  )

  console.log('[API] login response', res.status)
  const payload = await parseJsonResponse(res)
  console.log('[API] login payload', payload)

  if (!res.ok) {
    throw new Error(payload?.message ?? `Login failed (${res.status})`)
  }

  return payload
}
