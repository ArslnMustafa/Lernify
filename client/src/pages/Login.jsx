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
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#e9e0d2] px-4 py-10">
      <h1 className="text-base font-semibold text-[#736856] mb-4">Anmelden</h1>

      <div className="w-full max-w-md bg-[#fdfaf4] border border-[#d9ccb6] rounded-2xl shadow-sm p-7">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-medium text-[#736856] mb-2">Wer bist du?</p>
            <div className="flex flex-wrap gap-2">
              {users.map((user) => (
                <button
                  key={user.username}
                  type="button"
                  onClick={() => chooseName(user.name)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition ${
                    name.toLowerCase() === user.name.toLowerCase()
                      ? 'bg-[#3d372c] text-[#e9e0d2] border-[#3d372c]'
                      : 'bg-[#f1e9dc] text-[#24211a] border-[#d9ccb6] hover:border-[#b8ab97]'
                  }`}
                >
                  {user.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-xs font-medium text-[#736856] mb-1">
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
              className="w-full px-3.5 py-2.5 bg-[#f1e9dc]/50 border border-[#d9ccb6] rounded-xl text-sm outline-none text-[#24211a] placeholder:text-[#b8ab97] focus:ring-1 focus:ring-[#3d372c] transition"
            />
          </div>

          <div>
            <label htmlFor="pin" className="block text-xs font-medium text-[#736856] mb-1">
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
              className="w-full px-3.5 py-2.5 bg-[#f1e9dc]/50 border border-[#d9ccb6] rounded-xl text-sm outline-none text-[#24211a] placeholder:text-[#b8ab97] focus:ring-1 focus:ring-[#3d372c] transition"
            />
          </div>

          {error && <p className="text-xs text-[#8c4b3f]">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-[#3d372c] text-[#e9e0d2] text-sm font-bold hover:bg-[#24211a] transition disabled:opacity-60"
          >
            {submitting ? 'Anmeldung läuft...' : 'Anmelden'}
          </button>

          <p className="text-[11px] text-[#948773]">
            Wähle deinen Namen und gib deine PIN ein. Wenn du deine PIN nicht kennst,
            frag Mustafa.
          </p>
        </form>
      </div>
    </div>
  )
}
