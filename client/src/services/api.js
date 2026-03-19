const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

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

export async function login({ email, password }) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const payload = await res.json()
  if (!res.ok) {
    throw new Error(payload?.message ?? 'Login failed')
  }

  return payload
}
