import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Nav from '../components/Nav.jsx'

// Startseite fuer Deutsch: drei Bereiche Wortschatz, Grammatik von A2 nach B1.
// Erklaerungen auf Tuerkisch, Uebungen auf Deutsch.
export default function Deutsch() {
  const [daten, setDaten] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.deutschUebersicht().then(setDaten).catch((err) => setError(err.message))
  }, [])

  const faelligGesamt = daten ? daten.bereiche.reduce((s, b) => s + (b.faellig - b.neu), 0) : 0

  return (
    <div className="min-h-screen bg-[var(--flaeche)]">
      <Nav />
      <main className="max-w-3xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">Deutsch</h2>
        <p className="text-sm text-[var(--text-leise)] mt-1">
          A2'den B1'e: günlük hayat, iş ve sınav için. Kelimeler kutu sistemiyle tekrar edilir,
          bildiğin kelime birkaç gün dinlenir.
        </p>

        {error && <p className="text-sm text-[var(--rot)] mt-4">{error}</p>}
        {!daten && !error && <p className="text-sm text-[var(--text-leise)] mt-4">Wird geladen...</p>}

        {daten && (
          <>
            <Link
              to="/deutsch/karten"
              className="mt-5 flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl bg-[var(--knopf)] text-[var(--auf-knopf)] hover:bg-[var(--knopf-tief)] transition"
            >
              <span>
                <span className="block font-bold">Heute üben</span>
                <span className="block text-xs opacity-80">
                  {faelligGesamt > 0
                    ? `${faelligGesamt} Wörter sind zur Wiederholung dran, dazu ein paar neue`
                    : 'Neue Wörter aus allen drei Bereichen'}
                </span>
              </span>
              <span aria-hidden="true" className="text-lg">▶</span>
            </Link>

            <h3 className="mt-7 mb-2 text-sm font-bold text-[var(--text)]">Wortschatz</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {daten.bereiche.map((b) => (
                <Link
                  key={b.key}
                  to={`/deutsch/karten?bereich=${b.key}`}
                  className="block p-4 rounded-2xl bg-[var(--karte)] border border-[var(--rand)] hover:border-[var(--rand-stark)] transition"
                >
                  <span className="block font-bold text-[var(--text)]">{b.name}</span>
                  <span className="block text-xs text-[var(--text-leise)] mt-0.5 min-h-[2.5em]">{b.beschreibung}</span>
                  <Balken wert={b.sicher} von={b.woerter} />
                  <span className="block text-xs text-[var(--text-mittel)] mt-1.5">
                    {b.sicher} von {b.woerter} sicher
                    {b.woerter - b.neu > 0 && b.faellig - b.neu > 0 ? ` · ${b.faellig - b.neu} fällig` : ''}
                  </span>
                </Link>
              ))}
            </div>

            <h3 className="mt-7 mb-2 text-sm font-bold text-[var(--text)]">Grammatik</h3>
            <div className="rounded-2xl bg-[var(--karte)] border border-[var(--rand)] divide-y divide-[var(--rand)] overflow-hidden">
              {daten.grammatik.map((t) => (
                <Link
                  key={t.key}
                  to={`/deutsch/grammatik/${t.key}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--feld)] transition"
                >
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold text-[var(--text)] text-[15px]">{t.titel}</span>
                    <span className="block text-xs text-[var(--text-leise)]">{t.kurz}</span>
                  </span>
                  <span className="text-xs tabular-nums text-[var(--text-mittel)] whitespace-nowrap">
                    {t.gemacht === 0 ? 'neu' : `${t.sicher}/${t.uebungen}`}
                  </span>
                </Link>
              ))}
            </div>

            <h3 className="mt-7 mb-2 text-sm font-bold text-[var(--text)]">Als Nächstes</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Bald titel="Schreiben" text="Mektup, e-posta ve görüş yazısı; yazdığını örnek cevapla karşılaştırırsın." />
              <Bald titel="Prüfungssimulation" text="DTZ ve Goethe B1 formatında, süreli deneme sınavı." />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function Balken({ wert, von }) {
  const prozent = von ? Math.round((wert / von) * 100) : 0
  return (
    <span className="block mt-3 h-1.5 rounded-full bg-[var(--feld)] overflow-hidden" aria-hidden="true">
      <span className="block h-full rounded-full bg-[var(--gruen)]" style={{ width: `${prozent}%` }} />
    </span>
  )
}

function Bald({ titel, text }) {
  return (
    <div className="p-4 rounded-2xl border border-dashed border-[var(--rand-stark)] text-[var(--text-leise)]">
      <span className="block font-semibold text-[var(--text-mittel)]">{titel}</span>
      <span className="block text-xs mt-0.5">{text}</span>
    </div>
  )
}
