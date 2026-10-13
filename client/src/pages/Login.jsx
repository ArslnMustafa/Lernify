import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const pinRef = useRef(null)

  useEffect(() => {
    api
      .listUsers()
      .then((data) => setUsers(data.users))
      .catch(() => setUsers([]))
  }, [])

  function chooseName(value) {
    setName(value)
    setError('')
    pinRef.current?.focus()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(name.trim(), pin)
      // Training is where the learning happens, so that is where you land.
      navigate('/training')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--flaeche)] px-4 py-10">
      <h1 className="text-base font-semibold text-[var(--text-leise)] mb-4">Anmelden</h1>

      <div className="w-full max-w-md bg-[var(--karte)] border border-[var(--rand)] rounded-2xl shadow-sm p-7">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-medium text-[var(--text-leise)] mb-2">Wer bist du?</p>
            <div className="flex flex-wrap gap-2">
              {users.map((user) => (
                <button
                  key={user.username}
                  type="button"
                  onClick={() => chooseName(user.name)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition ${
                    name.toLowerCase() === user.name.toLowerCase()
                      ? 'bg-[var(--knopf)] text-[var(--auf-knopf)] border-[var(--knopf)]'
                      : 'bg-[var(--feld)] text-[var(--text)] border-[var(--rand)] hover:border-[var(--rand-stark)]'
                  }`}
                >
                  {user.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-xs font-medium text-[var(--text-leise)] mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              autoComplete="username"
              required
              className="w-full px-3.5 py-2.5 bg-[var(--feld)]/50 border border-[var(--rand)] rounded-xl text-sm outline-none text-[var(--text)] placeholder:text-[var(--rand-stark)] focus:ring-1 focus:ring-[var(--knopf)] transition"
            />
          </div>

          <div>
            <label htmlFor="pin" className="block text-xs font-medium text-[var(--text-leise)] mb-1">
              PIN
            </label>
            <input
              id="pin"
              ref={pinRef}
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN"
              autoComplete="current-password"
              required
              className="w-full px-3.5 py-2.5 bg-[var(--feld)]/50 border border-[var(--rand)] rounded-xl text-sm outline-none text-[var(--text)] placeholder:text-[var(--rand-stark)] focus:ring-1 focus:ring-[var(--knopf)] transition"
            />
          </div>

          {error && <p className="text-xs text-[var(--rot)]">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-bold hover:bg-[var(--knopf-tief)] transition disabled:opacity-60"
          >
            {submitting ? 'Anmeldung läuft...' : 'Anmelden'}
          </button>

          <p className="text-[11px] text-[var(--text-schwach)]">
            Wähle deinen Namen und gib deine PIN ein. Wenn du deine PIN nicht kennst,
            frag Mustafa.
          </p>
        </form>
      </div>
    </div>
  )
}
