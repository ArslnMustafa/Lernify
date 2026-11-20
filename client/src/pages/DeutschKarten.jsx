import { useCallback, useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../api'
import Nav from '../components/Nav.jsx'

const BEREICHE = [
  ['', 'Alle'],
  ['alltag', 'Alltag'],
  ['beruf', 'Beruf'],
  ['pruefung', 'Prüfung'],
]
const MODI = [
  ['faellig', 'Heute'],
  ['fehler', 'Fehler'],
  ['alle', 'Alle Wörter'],
]

// Eine Karte nach der anderen: antworten, Loesung mit Beispielsatz sehen, weiter.
export default function DeutschKarten() {
  const [params, setParams] = useSearchParams()
  const bereich = params.get('bereich') || ''
  const modus = params.get('modus') || 'faellig'
  const [frage, setFrage] = useState(null)
  const [leer, setLeer] = useState(false)
  const [ergebnis, setErgebnis] = useState(null)
  const [gewaehlt, setGewaehlt] = useState(null)
  const [zaehler, setZaehler] = useState({ richtig: 0, falsch: 0 })
  const [error, setError] = useState('')

  const laden = useCallback((letzte) => {
    // Alte Frage sofort weg, sonst ist sie bis zur neuen kurz wieder anklickbar
    setFrage(null)
    setErgebnis(null)
    setGewaehlt(null)
    setError('')
    api
      .deutschKarte(bereich, modus, letzte)
      .then((d) => {
        setFrage(d.frage)
        setLeer(!d.frage)
      })
      .catch((err) => setError(err.message))
  }, [bereich, modus])

  useEffect(() => {
    laden()
  }, [laden])

  function setzen(key, wert) {
    const neu = new URLSearchParams(params)
    if (wert) neu.set(key, wert)
    else neu.delete(key)
    setParams(neu)
  }

  async function antworten(option) {
    if (ergebnis) return
    setGewaehlt(option)
    try {
      const r = await api.deutschKarteAntwort({ itemKey: frage.itemKey, art: frage.art, antwort: option })
      setErgebnis(r)
      setZaehler((z) => (r.richtig ? { ...z, richtig: z.richtig + 1 } : { ...z, falsch: z.falsch + 1 }))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--flaeche)]">
      <Nav />
      <main className="max-w-xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="flex items-center justify-between gap-2 mb-3">
          <Link to="/deutsch" className="text-xs font-medium text-[var(--text-leise)] hover:text-[var(--text)]">
            ← Deutsch
          </Link>
          <span className="text-xs tabular-nums text-[var(--text-mittel)]">
            {zaehler.richtig} richtig · {zaehler.falsch} falsch
          </span>
        </div>

        <Auswahl werte={BEREICHE} aktiv={bereich} onPick={(v) => setzen('bereich', v)} label="Bereich" />
        <Auswahl werte={MODI} aktiv={modus} onPick={(v) => setzen('modus', v === 'faellig' ? '' : v)} label="Auswahl" />

        {error && <p className="text-sm text-[var(--rot)] mt-4">{error}</p>}

        {leer && (
          <div className="mt-5 p-5 rounded-2xl bg-[var(--karte)] border border-[var(--rand)] text-center">
            <p className="font-semibold text-[var(--text)]">
              {modus === 'fehler' ? 'Keine Fehler zum Wiederholen.' : 'Für heute ist hier alles wiederholt.'}
            </p>
            <p className="text-sm text-[var(--text-leise)] mt-1">
              Bugünlük bu kadar. Yine de devam etmek istersen tüm kelimelerden sor.
            </p>
            <button
              onClick={() => setzen('modus', 'alle')}
              className="mt-4 px-4 py-2.5 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-medium"
            >
              Alle Wörter üben
            </button>
          </div>
        )}

        {frage && (
          <div className="mt-5 rounded-2xl bg-[var(--karte)] border border-[var(--rand)] p-5 sm:p-6">
            <div className="flex justify-between text-[11px] text-[var(--text-schwach)]">
              <span>{frage.thema}{frage.neu ? ' · neues Wort' : ''}</span>
              <span>{frage.hinweis}</span>
            </div>
            <p className={`mt-3 font-bold text-[var(--text)] ${frage.art === 'bedeutung' || frage.art === 'artikel' ? 'text-2xl' : 'text-xl'}`}>
              {frage.text}
            </p>

            <div className={`mt-5 grid gap-2 ${frage.art === 'artikel' ? 'grid-cols-3' : ''}`}>
              {frage.optionen.map((o) => {
                const istLoesung = ergebnis && o === ergebnis.loesung
                const istFalsch = ergebnis && o === gewaehlt && !ergebnis.richtig
                return (
                  <button
                    key={o}
                    onClick={() => antworten(o)}
                    disabled={Boolean(ergebnis)}
                    className={`text-left px-4 py-3 rounded-xl border text-[15px] transition ${
                      istLoesung
                        ? 'border-[var(--gruen)] bg-[var(--gruen-leise)] text-[var(--text)] font-semibold'
                        : istFalsch
                          ? 'border-[var(--rot-rand)] bg-[var(--rot-flaeche)] text-[var(--rot)]'
                          : 'border-[var(--rand)] bg-[var(--feld)] text-[var(--text)] hover:border-[var(--rand-stark)]'
                    } ${frage.art === 'artikel' ? 'text-center font-semibold' : ''}`}
                  >
                    {o}
                  </button>
                )
              })}
            </div>

            {ergebnis && (
              <div className="mt-5 pt-4 border-t border-[var(--rand)]">
                <p className={`text-sm font-semibold ${ergebnis.richtig ? 'text-[var(--gruen-tief)]' : 'text-[var(--rot)]'}`}>
                  {ergebnis.richtig
                    ? ergebnis.wiederIn
                      ? `Richtig! Kommt in ${ergebnis.wiederIn} ${ergebnis.wiederIn === 1 ? 'Tag' : 'Tagen'} wieder.`
                      : 'Richtig!'
                    : 'Leider falsch. Diese Karte kommt bald wieder.'}
                </p>
                <div className="mt-3 rounded-xl bg-[var(--feld)] p-3.5">
                  <p className="font-bold text-[var(--text)] text-lg">{ergebnis.karte.wort}</p>
                  {ergebnis.karte.form !== '–' && (
                    <p className="text-xs text-[var(--text-leise)]">{ergebnis.karte.form}</p>
                  )}
                  <p className="text-sm text-[var(--text-mittel)] mt-1">{ergebnis.karte.tr}</p>
                  <p className="text-sm text-[var(--text)] mt-2 italic">„{ergebnis.karte.beispiel}“</p>
                </div>
                <button
                  onClick={() => laden(frage.itemKey)}
                  autoFocus
                  className="mt-4 w-full px-4 py-3 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-semibold hover:bg-[var(--knopf-tief)]"
                >
                  Weiter
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function Auswahl({ werte, aktiv, onPick, label }) {
  return (
    <div role="group" aria-label={label} className="flex gap-1 p-1 mb-2 rounded-xl bg-[var(--karte)] border border-[var(--rand)]">
      {werte.map(([wert, name]) => (
        <button
          key={wert}
          onClick={() => onPick(wert)}
          aria-pressed={aktiv === wert}
          className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition ${
            aktiv === wert ? 'bg-[var(--knopf)] text-[var(--auf-knopf)]' : 'text-[var(--text-mittel)] hover:bg-[var(--feld)]'
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  )
}
