import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Nav from '../components/Nav.jsx'
import { Hoeren } from '../deutsch/ui.jsx'

// Tueyolar als Karten zum Umdrehen: vorn die Regel, hinten Erklaerung und Beispiel.
export default function DeutschTipps() {
  const [tipps, setTipps] = useState(null)
  const [um, setUm] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    api.deutschTipps().then((d) => setTipps(d.tipps)).catch((err) => setError(err.message))
  }, [])

  return (
    <div className="min-h-screen bg-[var(--flaeche)]">
      <Nav />
      <main className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <Link to="/deutsch" className="text-xs font-medium text-[var(--text-leise)] hover:text-[var(--text)]">← Deutsch</Link>
        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">Tüyolar</h2>
        <p className="text-sm text-[var(--text-leise)]">Kartı çevir, püf noktasını ve örneği gör.</p>
        {error && <p className="text-sm text-[var(--rot)] mt-4">{error}</p>}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {(tipps || []).map((t, i) => (
            <div key={t.i} className={`de-auf de-auf-${Math.min(i + 1, 6)} de-flip ${um[t.i] ? 'um' : ''}`}>
              <div className="de-flip-innen">
                <button
                  onClick={() => setUm((u) => ({ ...u, [t.i]: true }))}
                  className="de-flip-vorn text-left min-h-[170px] p-5 rounded-2xl bg-[var(--karte)] border border-[var(--rand)] hover:border-[var(--rand-stark)] flex flex-col"
                  aria-label={`${t.titel}, umdrehen`}
                >
                  <span className="text-2xl" aria-hidden="true">💡</span>
                  <span className="mt-2 text-lg font-bold text-[var(--text)] leading-snug">{t.titel}</span>
                  <span className="mt-auto pt-3 text-xs text-[var(--text-schwach)]">Çevirmek için dokun ↻</span>
                </button>
                <div className="de-flip-hinten min-h-[170px] p-5 rounded-2xl bg-[var(--knopf)] text-[var(--auf-knopf)] flex flex-col">
                  <p className="text-sm leading-relaxed">{t.text}</p>
                  <p className="mt-3 flex items-start gap-2 text-sm font-semibold">
                    <Hoeren text={t.beispiel} klein className="!bg-transparent !text-[var(--auf-knopf)] !border-[var(--auf-knopf-leise)]" />
                    <span>{t.beispiel}</span>
                  </p>
                  <button onClick={() => setUm((u) => ({ ...u, [t.i]: false }))} className="mt-auto pt-3 self-start text-xs opacity-75 hover:opacity-100">
                    ↻ zurück
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
