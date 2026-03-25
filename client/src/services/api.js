const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'

function getCurrentUserRole() {
  if (typeof window === 'undefined') return ''

  const mgmtSession = localStorage.getItem('mgmt_session')
  if (mgmtSession) return 'management'

  try {
    const saved = localStorage.getItem('anahl:auth')
    if (!saved) return ''
    const parsed = JSON.parse(saved)
    return parsed?.user?.role || ''
  } catch {
    return ''
  }
}

function withRoleHeader(headers = {}) {
  const role = getCurrentUserRole()
  if (!role) return headers
  return { ...headers, 'x-user-role': role }
}

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

export async function fetchAdmins() {
  const res = await fetch(`${BASE_URL}/admins`)
  if (!res.ok) throw new Error('Failed to fetch admins')
  const { data } = await res.json()
  return data
}

export async function createAdmin(adminData) {
  const res = await fetch(`${BASE_URL}/admins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'management' },
    body: JSON.stringify(adminData),
  })
  const payload = await res.json()
  if (!res.ok) throw new Error(payload?.message ?? 'Failed to create admin')
  return payload.data
}

export async function updateAdmin(id, data) {
  const res = await fetch(`${BASE_URL}/admins/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'management' },
    body: JSON.stringify(data),
  })
  const payload = await res.json()
  if (!res.ok) throw new Error(payload?.message ?? 'Failed to update admin')
  return payload.data
}

export async function deleteAdmin(id) {
  const res = await fetch(`${BASE_URL}/admins/${id}`, {
    method: 'DELETE',
    headers: { 'x-user-role': 'management' },
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new Error(payload?.message ?? 'Failed to delete admin')
  }
  return true
}

export async function toggleAdminStatus(id) {
  const res = await fetch(`${BASE_URL}/admins/${id}/status`, {
    method: 'PATCH',
    headers: { 'x-user-role': 'management' },
  })
  const payload = await res.json()
  if (!res.ok) throw new Error(payload?.message ?? 'Failed to toggle admin status')
  return payload.data
}

export async function fetchTasks(params = {}) {
  const search = new URLSearchParams()
  if (params.assignedTo) search.set('assignedTo', params.assignedTo)
  if (params.status) search.set('status', params.status)
  const suffix = search.toString() ? `?${search.toString()}` : ''

  const res = await fetch(`${BASE_URL}/tasks${suffix}`)
  if (!res.ok) throw new Error('Failed to fetch tasks')
  const { data } = await res.json()
  return data
}

export async function createTask(task) {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: withRoleHeader({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(task),
  })
  const payload = await res.json()
  if (!res.ok) throw new Error(payload?.message ?? 'Failed to create task')
  return payload.data
}

export async function updateTask(id, data) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: withRoleHeader({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  })
  const payload = await res.json()
  if (!res.ok) throw new Error(payload?.message ?? 'Failed to update task')
  return payload.data
}

export async function addTaskComment(id, comment) {
  const res = await fetch(`${BASE_URL}/tasks/${id}/comments`, {
    method: 'POST',
    headers: withRoleHeader({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ comment }),
  })
  const payload = await res.json()
  if (!res.ok) throw new Error(payload?.message ?? 'Failed to add task comment')
  return payload.data
}

// ── Academic Documents (LTP / MTP) ────────────────────────────────────────────

export async function fetchAcademicDocs() {
  const res = await fetch(`${BASE_URL}/academic-docs`)
  if (!res.ok) throw new Error('Failed to fetch academic documents')
  const { data } = await res.json()
  return data
}

export async function upsertAcademicDoc(docData) {
  const res = await fetch(`${BASE_URL}/academic-docs`, {
    method: 'PUT',
    headers: withRoleHeader({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(docData),
  })
  const payload = await res.json()
  if (!res.ok) throw new Error(payload?.message ?? 'Failed to save document link')
  return payload.data
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
