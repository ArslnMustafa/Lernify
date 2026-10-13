import { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken, OfflineError } from '../api'

const AuthContext = createContext(null)

// Who was signed in last, so an offline start knows whose name to show.
const SPEICHER = 'lernify_user'

function merken(user) {
  try {
    if (user) localStorage.setItem(SPEICHER, JSON.stringify(user))
    else localStorage.removeItem(SPEICHER)
  } catch {
    /* a browser without storage simply forgets */
  }
}

function gemerkt() {
  try {
    return JSON.parse(localStorage.getItem(SPEICHER) || 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    api
      .me()
      .then((data) => {
        setUser(data.user)
        merken(data.user)
      })
      .catch((err) => {
        // Without a connection the session cannot be checked — and cannot be
        // declared invalid either, so the last known user stays signed in.
        if (err instanceof OfflineError) {
          const bekannt = gemerkt()
          if (bekannt) return setUser(bekannt)
          return
        }
        setToken(null)
        merken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(username, password) {
    const data = await api.login(username, password)
    setToken(data.token)
    setUser(data.user)
    merken(data.user)
  }

  function logout() {
    setToken(null)
    setUser(null)
    merken(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
