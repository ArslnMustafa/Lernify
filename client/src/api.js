const TOKEN_KEY = 'lernify_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export class OfflineError extends Error {
  constructor() {
    super('Keine Verbindung.')
    this.name = 'OfflineError'
  }
}

async function request(path, options = {}) {
  const token = getToken()
  let res
  try {
    res = await fetch(`/api${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    })
  } catch {
    // The server was never reached, so nothing is known about the session.
    throw new OfflineError()
  }

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
  pruefeAntwort: (examId, questionId, index) =>
    request(`/exams/${examId}/pruefen`, {
      method: 'POST',
      body: JSON.stringify({ questionId, index }),
    }),
  listBuildings: () => request('/catalog/buildings'),
  listTheory: () => request('/catalog/theory'),
  trainerStats: () => request('/trainer/stats'),
  trainerNext: (stapel) =>
    request(
      typeof stapel === 'number'
        ? `/trainer/next?box=${stapel}`
        : `/trainer/next?modus=${stapel}`
    ),
  trainerAnswer: (payload) =>
    request('/trainer/answer', { method: 'POST', body: JSON.stringify(payload) }),
  listVergleiche: () => request('/vergleich'),
  getVergleich: (id) => request(`/vergleich/${id}`),
  vergleichFrage: (id, gestellt) =>
    request(`/vergleich/${id}/frage?gestellt=${gestellt.join(',')}`),
  vergleichAntwort: (payload) =>
    request('/vergleich/antwort', { method: 'POST', body: JSON.stringify(payload) }),
  simulationStart: (laenge) =>
    request('/simulation/start', { method: 'POST', body: JSON.stringify({ laenge }) }),
  simulationAbgeben: (id, antworten) =>
    request(`/simulation/${id}/abgeben`, {
      method: 'POST',
      body: JSON.stringify({ antworten }),
    }),
  simulationVerlauf: () => request('/simulation/verlauf'),
  schreibNaechste: () => request('/schreiben/naechste'),
  schreibLoesung: (key) => request(`/schreiben/${encodeURIComponent(key)}/loesung`),
  schreibBewerten: (key, treffer) =>
    request('/schreiben/bewerten', { method: 'POST', body: JSON.stringify({ key, treffer }) }),
  schreibStatistik: () => request('/schreiben/statistik'),
}
