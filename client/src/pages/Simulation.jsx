import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api'
import Nav from '../components/Nav.jsx'
import StudyImage from '../components/StudyImage.jsx'

const LAENGEN = [20, 30, 40]

const zeit = (sekunden) => {
  const m = Math.floor(sekunden / 60)
  const s = sekunden % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const datum = (wert) =>
  new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    .format(new Date(`${wert}Z`))

export default function Simulation() {
  const [lauf, setLauf] = useState(null)
  const [ergebnis, setErgebnis] = useState(null)
  const [verlauf, setVerlauf] = useState([])
  const [error, setError] = useState('')

  const ladeVerlauf = useCallback(() => {
    api
      .simulationVerlauf()
      .then((data) => setVerlauf(data.laeufe))
      .catch(() => setVerlauf([]))
  }, [])

  useEffect(ladeVerlauf, [ladeVerlauf])

  async function starten(laenge) {
    setError('')
    setErgebnis(null)
    try {
      setLauf(await api.simulationStart(laenge))
    } catch (err) {
      setError(err.message)
    }
  }

  async function abgeben(antworten) {
    try {
      const data = await api.simulationAbgeben(lauf.id, antworten)
      setErgebnis(data)
      setLauf(null)
      ladeVerlauf()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--flaeche)]">
      <Nav />

      <main className="max-w-2xl mx-auto px-3 sm:px-6 py-3 sm:py-8">
        {error && <p className="text-sm text-[var(--rot)] mb-3">{error}</p>}

        {lauf && <Durchlauf lauf={lauf} onAbgeben={abgeben} />}

        {!lauf && ergebnis && (
          <Auswertung ergebnis={ergebnis} onNochmal={() => setErgebnis(null)} />
        )}

        {!lauf && !ergebnis && <Start verlauf={verlauf} onStart={starten} />}
      </main>
    </div>
  )
}

function Start({ verlauf, onStart }) {
  const bestes = verlauf.reduce(
    (best, lauf) => Math.max(best, Math.round((lauf.correct / lauf.total) * 100)),
    0
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-[var(--karte)] border border-[var(--rand)] rounded-2xl p-4 sm:p-6">
        <h2 className="text-[15px] sm:text-base font-bold text-[var(--text)] mb-1">
          Prüfungssimulation
        </h2>
        <p className="text-[13px] sm:text-xs text-[var(--text-leise)] mb-4">
          Gemischte Fragen wie in der Klausur: Bauwerke, Vergleiche und Epochen. Keine
          Rückmeldung zwischendurch — die Auswertung kommt am Ende.
        </p>

        <div className="grid grid-cols-3 gap-2">
          {LAENGEN.map((laenge) => (
            <button
              key={laenge}
              onClick={() => onStart(laenge)}
              className="px-3 py-3 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-semibold hover:bg-[var(--knopf-tief)] transition"
            >
              {laenge} Fragen
            </button>
          ))}
        </div>
      </div>

      {verlauf.length > 0 && (
        <div className="bg-[var(--karte)] border border-[var(--rand)] rounded-2xl p-4 sm:p-6">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-[13px] sm:text-xs font-bold text-[var(--text)]">Deine Durchläufe</h3>
            <span className="text-[11px] text-[var(--text-schwach)]">Bestes: {bestes}%</span>
          </div>

          <div className="flex flex-col gap-2">
            {verlauf.map((lauf) => {
              const prozent = Math.round((lauf.correct / lauf.total) * 100)
              return (
                <div key={lauf.id} className="flex items-center gap-3">
                  <span className="text-[11px] text-[var(--text-schwach)] w-24 shrink-0">
                    {datum(lauf.finished_at)}
                  </span>
                  <div className="flex-1 h-2 rounded bg-[var(--flaeche)] overflow-hidden">
                    <div
                      className={`h-full rounded ${
                        prozent >= 80 ? 'bg-[var(--gruen)]' : prozent >= 50 ? 'bg-[var(--mittel)]' : 'bg-[var(--rot)]'
                      }`}
                      style={{ width: `${Math.max(prozent, 3)}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-[var(--text-mittel)] w-24 text-right shrink-0">
                    {lauf.correct}/{lauf.total} · {zeit(lauf.seconds)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function Durchlauf({ lauf, onAbgeben }) {
  const [aktuell, setAktuell] = useState(0)
  const [antworten, setAntworten] = useState({})
  const [sekunden, setSekunden] = useState(0)
  const start = useRef(Date.now())

  useEffect(() => {
    const takt = setInterval(
      () => setSekunden(Math.round((Date.now() - start.current) / 1000)),
      1000
    )
    return () => clearInterval(takt)
  }, [])

  const frage = lauf.fragen[aktuell]
  const letzte = aktuell === lauf.fragen.length - 1
  const beantwortet = Object.keys(antworten).length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-[11px] text-[var(--text-leise)]">
        <span>
          Frage {aktuell + 1} / {lauf.fragen.length} · {beantwortet} beantwortet
        </span>
        <span className="tabular-nums">{zeit(sekunden)}</span>
      </div>

      <div className="h-1 rounded bg-[var(--rand)] overflow-hidden">
        <div
          className="h-full bg-[var(--knopf)] rounded transition-all"
          style={{ width: `${((aktuell + 1) / lauf.fragen.length) * 100}%` }}
        />
      </div>

      <div className="bg-[var(--karte)] border border-[var(--rand)] rounded-2xl p-3.5 sm:p-6">
        <p className="text-[10px] uppercase tracking-wide text-[var(--text-schwach)] mb-1.5">{frage.art}</p>
        <h3 className="text-[15px] sm:text-sm font-bold text-[var(--text)] mb-3 sm:mb-5">
          {frage.text}
        </h3>

        <StudyImage src={frage.image} />

        <div className="flex flex-col gap-1.5 sm:gap-2">
          {frage.options.map((option) => (
            <button
              key={option}
              onClick={() => setAntworten((prev) => ({ ...prev, [aktuell]: option }))}
              className={`text-left px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl text-[15px] sm:text-sm border transition ${
                antworten[aktuell] === option
                  ? 'bg-[var(--knopf)] text-[var(--auf-knopf)] border-[var(--knopf)]'
                  : 'bg-[var(--feld)]/50 text-[var(--text)] border-[var(--rand)] hover:border-[var(--rand-stark)]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            onClick={() => setAktuell((n) => Math.max(0, n - 1))}
            disabled={aktuell === 0}
            className="px-3 py-2 rounded-xl text-[13px] font-medium text-[var(--text-leise)] disabled:opacity-40"
          >
            Zurück
          </button>

          {letzte ? (
            <button
              onClick={() =>
                onAbgeben(lauf.fragen.map((_, index) => antworten[index] ?? null))
              }
              className="px-5 py-2.5 rounded-xl bg-[var(--gruen)] text-[var(--auf-farbe)] text-sm font-semibold hover:bg-[var(--gruen-tief)] transition"
            >
              Abgeben
            </button>
          ) : (
            <button
              onClick={() => setAktuell((n) => Math.min(lauf.fragen.length - 1, n + 1))}
              className="px-5 py-2.5 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-medium hover:bg-[var(--knopf-tief)] transition"
            >
              Weiter
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Auswertung({ ergebnis, onNochmal }) {
  const [nurFalsche, setNurFalsche] = useState(true)
  const prozent = Math.round((ergebnis.richtig / ergebnis.total) * 100)
  const zeilen = nurFalsche ? ergebnis.fragen.filter((z) => !z.korrekt) : ergebnis.fragen

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-[var(--karte)] border border-[var(--rand)] rounded-2xl p-4 sm:p-6 text-center">
        <p className="text-3xl font-bold text-[var(--text)]">{prozent}%</p>
        <p className="text-[13px] text-[var(--text-leise)] mt-1">
          {ergebnis.richtig} von {ergebnis.total} richtig · {zeit(ergebnis.sekunden)} Minuten
        </p>
        <button
          onClick={onNochmal}
          className="mt-4 px-5 py-2.5 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-semibold hover:bg-[var(--knopf-tief)] transition"
        >
          Neuer Durchlauf
        </button>
      </div>

      <div className="bg-[var(--karte)] border border-[var(--rand)] rounded-2xl p-4 sm:p-6">
        <button
          onClick={() => setNurFalsche((value) => !value)}
          className="text-[13px] sm:text-xs font-semibold text-[var(--text-mittel)] hover:text-[var(--text)] mb-3"
        >
          {nurFalsche ? 'Alle Fragen zeigen' : 'Nur die falschen zeigen'}
        </button>

        <div className="flex flex-col gap-3">
          {zeilen.map((zeile) => (
            <div
              key={zeile.nr}
              className={`rounded-xl border px-3 py-2.5 ${
                zeile.korrekt
                  ? 'border-[var(--rand)] bg-[var(--feld)]/40'
                  : 'border-[var(--rot-rand)] bg-[var(--rot-flaeche)]'
              }`}
            >
              <p className="text-[11px] text-[var(--text-schwach)] mb-1">
                {zeile.nr}. {zeile.art}
              </p>
              <p className="text-[13px] text-[var(--text)] mb-1.5">{zeile.text}</p>
              {!zeile.korrekt && (
                <p className="text-[12px] text-[var(--rot)]">
                  Deine Antwort: {zeile.deine || 'keine'}
                </p>
              )}
              <p className="text-[12px] text-[var(--gruen-tief)]">Richtig: {zeile.richtig}</p>
            </div>
          ))}

          {zeilen.length === 0 && (
            <p className="text-[13px] text-[var(--text-leise)]">Alles richtig. Nichts nachzuarbeiten.</p>
          )}
        </div>
      </div>
    </div>
  )
}
