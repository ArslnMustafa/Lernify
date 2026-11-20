import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Nav from '../components/Nav.jsx'

// Pruefungssimulation: Liste der Modelltests mit letztem und bestem Ergebnis.
export const prozent = (a, b) => (b ? Math.round((a / b) * 100) : 0)
export const dauerText = (s) => (s >= 60 ? `${Math.round(s / 60)} Min.` : `${s} Sek.`)

export default function DeutschPruefung() {
  const [d, setD] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.deutschPruefungen().then(setD).catch((err) => setError(err.message))
  }, [])

  return (
    <div className="min-h-screen bg-[var(--flaeche)]">
      <Nav />
      <main className="[overflow-x:clip] max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <Link to="/deutsch" className="text-xs font-medium text-[var(--text-leise)] hover:text-[var(--text)]">← Deutsch</Link>
        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">Prüfungssimulation</h2>
        <p className="text-sm text-[var(--text-leise)]">
          DTZ / Goethe B1 ve B2 tarzında deneme sınavları. Lesen süreli; Hören metinlerini tarayıcı okur, her metni en fazla iki kez dinlersin.
          Her modülde %60 = geçti.
        </p>

        {error && <p className="text-sm text-[var(--rot)] mt-4">{error}</p>}
        {!d && !error && <p className="text-sm text-[var(--text-leise)] mt-4">Wird geladen...</p>}

        <div className="mt-5 flex flex-col gap-3">
          {d?.pruefungen.map((p, i) => (
            <Link
              key={p.key}
              to={`/deutsch/pruefung/${p.key}`}
              className={`de-auf de-auf-${Math.min(i + 1, 6)} group block p-4 sm:p-5 rounded-2xl bg-[var(--karte)] border border-[var(--rand)] hover:border-[var(--rand-stark)] hover:-translate-y-0.5 transition`}
            >
              <div className="flex items-start gap-4">
                <span className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-extrabold ${p.niveau === 'B2' ? 'bg-[var(--knopf)] text-[var(--auf-knopf)]' : 'bg-[color-mix(in_srgb,var(--gold)_25%,var(--karte))] text-[var(--text)]'}`}>
                  {p.niveau}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-[var(--text)]">{p.titel}</span>
                  <span className="block text-xs text-[var(--text-leise)]">{p.thema}</span>
                  <span className="block text-xs text-[var(--text-mittel)] mt-1.5">
                    Lesen {p.minuten.lesen} Min. · Hören · {p.fragen} Aufgaben
                  </span>
                  {p.letztes ? (
                    <span className="mt-3 flex flex-wrap gap-2 text-xs">
                      <Ergebnis titel="Letztes" e={p.letztes} />
                      {p.versuche > 1 && <Ergebnis titel="Bestes" e={p.bestes} />}
                    </span>
                  ) : (
                    <span className="block mt-3 text-xs font-semibold text-[var(--text-mittel)]">Noch nicht gemacht</span>
                  )}
                </span>
                <span aria-hidden="true" className="self-center text-xl text-[var(--text-mittel)] transition group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-2xl border border-dashed border-[var(--rand-stark)] text-xs text-[var(--text-leise)]">
          <span className="block font-semibold text-[var(--text-mittel)]">Schreiben ve Sprechen</span>
          Yazma bölümü bir sonraki adımda, yazma pratiğiyle birlikte gelecek.
        </div>
      </main>
    </div>
  )
}

function Ergebnis({ titel, e }) {
  return (
    <span className={`px-2.5 py-1 rounded-lg font-semibold ${e.bestanden ? 'bg-[var(--gruen-leise)] text-[var(--gruen-tief)]' : 'bg-[var(--rot-flaeche)] text-[var(--rot)]'}`}>
      {titel}: Lesen {prozent(e.lesen, e.lesenMax)} % · Hören {prozent(e.hoeren, e.hoerenMax)} %
    </span>
  )
}
