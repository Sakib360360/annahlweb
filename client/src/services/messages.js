const STORAGE_PREFIX = 'anahl:messages:'

function conversationKey(userA, userB) {
  const sorted = [userA, userB].sort()
  return `${STORAGE_PREFIX}${sorted[0]}_${sorted[1]}`
}

export function getConversation(userA, userB) {
  const key = conversationKey(userA, userB)
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function sendMessage({ from, to, text }) {
  if (!from || !to || !text) return []
  const key = conversationKey(from, to)
  const existing = getConversation(from, to)
  const message = {
    id: `${Date.now()}`,
    from,
    to,
    text,
    createdAt: new Date().toISOString(),
  }
  const next = [message, ...existing]
  window.localStorage.setItem(key, JSON.stringify(next))
  return next
}

export function getConversationsForUser(userId) {
  const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(STORAGE_PREFIX))
  const conversations = []
  for (const key of keys) {
    const parts = key.replace(STORAGE_PREFIX, '').split('_')
    if (parts.includes(userId)) {
      const other = parts.find((id) => id !== userId)
      conversations.push({ key, other, messages: getConversation(userId, other) })
    }
  }
  return conversations
}
