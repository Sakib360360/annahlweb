export function getFromStorage(key, defaultValue = null) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return defaultValue
    return JSON.parse(raw)
  } catch {
    return defaultValue
  }
}

export function setInStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function removeFromStorage(key) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignore
  }
}
