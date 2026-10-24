import { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken, tokenDauerhaft, OfflineError } from '../api'

const AuthContext = createContext(null)

// Who was signed in last, so an offline start knows whose name to show.
const SPEICHER = 'lernify_user'

function merken(user, dauerhaft = tokenDauerhaft()) {
  try {
    localStorage.removeItem(SPEICHER)
    sessionStorage.removeItem(SPEICHER)
    if (user) {
      ;(dauerhaft ? localStorage : sessionStorage).setItem(SPEICHER, JSON.stringify(user))
    }
  } catch {
    /* a browser without storage simply forgets */
  }
}

function gemerkt() {
  try {
    return JSON.parse(
      sessionStorage.getItem(SPEICHER) || localStorage.getItem(SPEICHER) || 'null'
    )
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

  async function login(username, password, dauerhaft = true) {
    const data = await api.login(username, password)
    setToken(data.token, dauerhaft)
    setUser(data.user)
    merken(data.user, dauerhaft)
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
