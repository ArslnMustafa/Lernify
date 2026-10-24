import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth/AuthContext.jsx'

/* Der Anmeldebildschirm bleibt dunkel, egal welches Thema sonst eingestellt
   ist: er ist die eine Seite, die man vor dem Lernen kurz sieht, und das
   warme Dunkel ist ruhiger als ein helles Blatt. Die Farben stehen hier
   direkt und nicht als Variablen, damit das Thema sie nicht umdreht. */

const TON = {
  grund: '#191411',
  karte: '#241c17',
  rand: '#3b2f26',
  randStark: '#4d3e32',
  feld: '#1f1915',
  text: '#f3ebdd',
  textLeise: '#bdae99',
  textSchwach: '#8d8070',
  knopf: '#e8bd8c',
  aufKnopf: '#2a2019',
  rot: '#d79182',
}

const ANZEIGE = "ui-serif, Georgia, 'Iowan Old Style', 'Times New Roman', serif"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [pinOffen, setPinOffen] = useState(false)
  const [bleiben, setBleiben] = useState(true)
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
      await login(name.trim(), pin, bleiben)
      // Training is where the learning happens, so that is where you land.
      navigate('/training')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const feldStil = {
    backgroundColor: TON.feld,
    borderColor: TON.rand,
    color: TON.text,
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden px-5 py-8 sm:px-8"
      style={{ backgroundColor: TON.grund, color: TON.text }}
    >
      {/* Ein warmer Schein oben rechts, sonst waere das Dunkel flach. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(62rem 36rem at 80% 6%, rgba(232,189,140,0.22), transparent 62%),' +
            'radial-gradient(40rem 28rem at 70% 52%, rgba(232,189,140,0.10), transparent 65%)',
        }}
      />

      <div className="relative flex min-h-[calc(100vh-4rem)] flex-col">
        <div className="flex items-center gap-2.5">
          <span
            className="grid h-8 w-8 place-items-center rounded-lg text-[15px] font-bold"
            style={{ backgroundColor: TON.knopf, color: TON.aufKnopf }}
          >
            L
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Lernify</span>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div
            className="grid w-full max-w-4xl overflow-hidden rounded-3xl border md:grid-cols-2"
            style={{ borderColor: TON.rand, backgroundColor: `${TON.karte}cc` }}
          >
            {/* --- linke Haelfte: das Formular --- */}
            <div className="p-7 sm:p-10">
              <h1 className="text-[32px] leading-tight sm:text-[36px]" style={{ fontFamily: ANZEIGE }}>
                Willkommen zurück
              </h1>
              <p className="mt-1.5 text-sm" style={{ color: TON.textLeise }}>
                Melde dich an, um weiterzulernen.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
                {users.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium" style={{ color: TON.textLeise }}>
                      Wer bist du?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {users.map((user) => {
                        const gewaehlt = name.toLowerCase() === user.name.toLowerCase()
                        return (
                          <button
                            key={user.username}
                            type="button"
                            onClick={() => chooseName(user.name)}
                            className="rounded-full border px-4 py-1.5 text-sm font-semibold transition"
                            style={
                              gewaehlt
                                ? {
                                    backgroundColor: TON.knopf,
                                    borderColor: TON.knopf,
                                    color: TON.aufKnopf,
                                  }
                                : {
                                    backgroundColor: 'transparent',
                                    borderColor: TON.rand,
                                    color: TON.textLeise,
                                  }
                            }
                          >
                            {user.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="mb-1.5 block text-xs font-medium" style={{ color: TON.textLeise }}>
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dein Name"
                    autoComplete="username"
                    required
                    className="w-full rounded-xl border px-4 py-3 text-[15px] outline-none transition focus:border-[#7a6450]"
                    style={feldStil}
                  />
                </div>

                <div>
                  <label htmlFor="pin" className="mb-1.5 block text-xs font-medium" style={{ color: TON.textLeise }}>
                    PIN
                  </label>
                  <div className="relative">
                    <input
                      id="pin"
                      ref={pinRef}
                      type={pinOffen ? 'text' : 'password'}
                      inputMode="numeric"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Deine PIN"
                      autoComplete="current-password"
                      required
                      className="w-full rounded-xl border px-4 py-3 pr-20 text-[15px] outline-none transition focus:border-[#7a6450]"
                      style={feldStil}
                    />
                    <button
                      type="button"
                      onClick={() => setPinOffen((offen) => !offen)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold transition hover:opacity-80"
                      style={{ color: TON.textLeise }}
                    >
                      {pinOffen ? 'Verbergen' : 'Zeigen'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex select-none items-center gap-2 text-sm" style={{ color: TON.textLeise }}>
                    <input
                      type="checkbox"
                      checked={bleiben}
                      onChange={(e) => setBleiben(e.target.checked)}
                      className="h-4 w-4 rounded"
                      style={{ accentColor: TON.knopf }}
                    />
                    Angemeldet bleiben
                  </label>
                  <span className="text-sm" style={{ color: TON.textSchwach }}>
                    PIN vergessen? Frag Mustafa.
                  </span>
                </div>

                {error && (
                  <p className="text-sm" style={{ color: TON.rot }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl py-3.5 text-[15px] font-bold transition hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: TON.knopf, color: TON.aufKnopf }}
                >
                  {submitting ? 'Anmeldung läuft...' : 'Anmelden'}
                </button>
              </form>
            </div>

            {/* --- rechte Haelfte: nur Stimmung --- */}
            <div
              className="relative flex flex-col justify-center border-t p-7 sm:p-10 md:border-l md:border-t-0"
              style={{ borderColor: TON.rand, backgroundColor: 'rgba(255,243,228,0.025)' }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: TON.knopf }}
              >
                Baugeschichte II
              </p>
              <p
                className="mt-5 text-[40px] leading-[1.05] sm:text-[52px]"
                style={{ fontFamily: ANZEIGE }}
              >
                Weiter geht&rsquo;s.
              </p>
              <p className="mt-4 max-w-xs text-sm leading-relaxed" style={{ color: TON.textLeise }}>
                Deine fälligen Karten warten schon. Ein paar Minuten am Tag reichen, damit
                nichts wieder aus dem Kopf fällt.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs" style={{ color: TON.textSchwach }}>
          Lernify · Baugeschichte II
        </p>
      </div>
    </div>
  )
}
