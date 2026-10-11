import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const passwordRef = useRef(null)

  useEffect(() => {
    api
      .listUsers()
      .then((data) => setUsers(data.users))
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    if (selected) passwordRef.current?.focus()
  }, [selected])

  function chooseUser(user) {
    setSelected(user)
    setPassword('')
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(selected.username, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2eee9] px-4">
      <div className="w-full max-w-sm bg-white border border-[#e8e2d5] rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#3d372c] text-[#f2eee9] flex items-center justify-center font-bold text-sm">
            L
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#24211a]">Lernify</h1>
            <p className="text-xs text-[#736856]">
              {selected ? `Angemeldet als ${selected.name}` : 'Wer lernt heute?'}
            </p>
          </div>
        </div>

        {!selected ? (
          <div className="flex flex-col gap-2">
            {users.map((user) => (
              <button
                key={user.username}
                onClick={() => chooseUser(user)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#e8e2d5] bg-[#f5f2eb]/50 hover:border-[#b8ab97] transition text-left"
              >
                <span className="w-9 h-9 rounded-full bg-[#e8e2d5] text-[#595042] flex items-center justify-center font-semibold text-sm">
                  {user.name.charAt(0)}
                </span>
                <span className="text-sm font-medium text-[#24211a]">{user.name}</span>
              </button>
            ))}

            {users.length === 0 && !error && (
              <p className="text-xs text-[#948773]">Wird geladen...</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-[#736856] mb-1">
                Passwort
              </label>
              <input
                ref={passwordRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full px-3.5 py-2.5 bg-[#f5f2eb]/50 border border-[#e8e2d5] rounded-xl text-sm outline-none text-[#24211a] focus:ring-1 focus:ring-[#3d372c] transition"
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-[#3d372c] text-[#f2eee9] text-sm font-medium hover:bg-[#24211a] transition disabled:opacity-60"
            >
              {submitting ? 'Anmeldung läuft...' : 'Anmelden'}
            </button>

            <button
              type="button"
              onClick={() => chooseUser(null)}
              className="text-xs text-[#736856] hover:text-[#24211a] transition"
            >
              ← Anderes Konto wählen
            </button>
          </form>
        )}

        {!selected && error && <p className="text-xs text-red-600 mt-3">{error}</p>}
      </div>
    </div>
  )
}
