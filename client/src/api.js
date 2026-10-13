const TOKEN_KEY = 'lernify_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || 'Ein Fehler ist aufgetreten.')
  }

  return data
}

export const api = {
  listUsers: () => request('/auth/users'),
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  me: () => request('/auth/me'),
  listExams: () => request('/exams'),
  getExam: (id) => request(`/exams/${id}`),
  submitExam: (id, answers) =>
    request(`/exams/${id}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),
  listBuildings: () => request('/catalog/buildings'),
  listTheory: () => request('/catalog/theory'),
  trainerStats: () => request('/trainer/stats'),
  trainerNext: (box) => request(`/trainer/next?box=${box}`),
  trainerAnswer: (payload) =>
    request('/trainer/answer', { method: 'POST', body: JSON.stringify(payload) }),
  listVergleiche: () => request('/vergleich'),
  getVergleich: (id) => request(`/vergleich/${id}`),
  vergleichFrage: (id, gestellt) =>
    request(`/vergleich/${id}/frage?gestellt=${gestellt.join(',')}`),
  vergleichAntwort: (payload) =>
    request('/vergleich/antwort', { method: 'POST', body: JSON.stringify(payload) }),
}
