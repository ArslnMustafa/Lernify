import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(username, password)
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
            <p className="text-xs text-[#736856]">Sınavına giriş yap</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-[#736856] mb-1">
              Kullanıcı adı
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="w-full px-3.5 py-2.5 bg-[#f5f2eb]/50 border border-[#e8e2d5] rounded-xl text-sm outline-none text-[#24211a] focus:ring-1 focus:ring-[#3d372c] transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#736856] mb-1">Şifre</label>
            <input
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
            className="mt-2 w-full py-2.5 rounded-xl bg-[#3d372c] text-[#f2eee9] text-sm font-medium hover:bg-[#24211a] transition disabled:opacity-60"
          >
            {submitting ? 'Giriş yapılıyor...' : 'Giriş yap'}
          </button>
        </form>
      </div>
    </div>
  )
}
