import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Nav from '../components/Nav.jsx'
import { Hoeren } from '../deutsch/ui.jsx'

// Kaliplar: fertige Saetze nach Situation. "Kendini test et" blendet das Tuerkische aus.
const FILTER = [['', 'Alle'], ['alltag', 'Alltag'], ['beruf', 'Beruf'], ['pruefung', 'Prüfung']]

export default function DeutschKaliplar() {
  const [sit, setSit] = useState(null)
  const [filter, setFilter] = useState('')
  const [offen, setOffen] = useState(null)
  const [test, setTest] = useState(false)
  const [gezeigt, setGezeigt] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    api.deutschKaliplar().then((d) => setSit(d.situationen)).catch((err) => setError(err.message))
  }, [])

  const liste = sit ? sit.filter((s) => !filter || s.bereich === filter) : []

  return (
    <div className="min-h-screen bg-[var(--flaeche)]">
      <Nav />
      <main className="[overflow-x:clip] max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <Link to="/deutsch" className="text-xs font-medium text-[var(--text-leise)] hover:text-[var(--text)]">← Deutsch</Link>
        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">Kalıplar</h2>
        <p className="text-sm text-[var(--text-leise)]">Hazır cümleler: dinle, tekrar et, ezberle. Doğru yerde doğru cümle.</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Bereich" className="flex gap-1 p-1 rounded-xl bg-[var(--karte)] border border-[var(--rand)]">
            {FILTER.map(([w, n]) => (
              <button key={w} onClick={() => setFilter(w)} aria-pressed={filter === w}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filter === w ? 'bg-[var(--knopf)] text-[var(--auf-knopf)]' : 'text-[var(--text-mittel)] hover:bg-[var(--feld)]'}`}>
                {n}
              </button>
            ))}
          </div>
          <label className="ml-auto flex items-center gap-2 text-xs font-semibold text-[var(--text-mittel)] cursor-pointer">
            <input type="checkbox" checked={test} onChange={(e) => { setTest(e.target.checked); setGezeigt({}) }} className="accent-[var(--knopf)]" />
            Kendini test et (Türkçeyi gizle)
          </label>
        </div>

        {error && <p className="text-sm text-[var(--rot)] mt-4">{error}</p>}
        {!sit && !error && <p className="text-sm text-[var(--text-leise)] mt-4">Wird geladen...</p>}

        <div className="mt-4 flex flex-col gap-3">
          {liste.map((s, i) => {
            const auf = offen === s.key || liste.length === 1
            return (
              <section key={s.key} className={`de-auf de-auf-${Math.min(i + 1, 6)} rounded-2xl bg-[var(--karte)] border border-[var(--rand)] overflow-hidden`}>
                <button onClick={() => setOffen(auf ? null : s.key)} aria-expanded={auf}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[var(--feld)] transition">
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold text-[var(--text)]">{s.titel}</span>
                    <span className="block text-xs text-[var(--text-leise)]">{s.kurz} · {s.saetze.length} Sätze</span>
                  </span>
                  <span aria-hidden="true" className={`text-[var(--text-mittel)] transition ${auf ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {auf && (
                  <div className="de-schritt px-4 pb-4">
                    <p className="flex gap-2 text-sm text-[var(--text-weich)] p-3 rounded-xl bg-[color-mix(in_srgb,var(--gold)_10%,var(--karte))] border border-[var(--gold)]">
                      <span aria-hidden="true">💡</span>{s.tipp}
                    </p>
                    <ul className="mt-2 divide-y divide-[var(--rand)]">
                      {s.saetze.map(([de, tr]) => {
                        const k = s.key + de
                        const sichtbar = !test || gezeigt[k]
                        return (
                          <li key={de} className="flex items-start gap-3 py-2.5">
                            <Hoeren text={de} klein className="mt-0.5" />
                            <button onClick={() => test && setGezeigt((g) => ({ ...g, [k]: !g[k] }))} className="min-w-0 text-left">
                              <span className="block text-[15px] text-[var(--text)]">{de}</span>
                              <span className={`block text-xs transition ${sichtbar ? 'text-[var(--text-leise)]' : 'text-transparent bg-[var(--feld)] rounded select-none'}`}>
                                {sichtbar ? tr : 'antippen für Türkisch'}
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </section>
            )
          })}
        </div>
      </main>
    </div>
  )
}
