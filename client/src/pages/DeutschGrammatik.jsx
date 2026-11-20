import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import Nav from '../components/Nav.jsx'
import Fett from '../deutsch/Fett.jsx'

// Ein Grammatikthema: kurze Erklaerung auf Tuerkisch, Beispiele, dann Uebungen.
export default function DeutschGrammatik() {
  const { thema } = useParams()
  const [daten, setDaten] = useState(null)
  const [antworten, setAntworten] = useState({}) // i -> { gewaehlt, ergebnis }
  const [runde, setRunde] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    setDaten(null)
    setAntworten({})
    api.deutschThema(thema).then(setDaten).catch((err) => setError(err.message))
  }, [thema, runde])

  async function antworten_(u, option) {
    if (antworten[u.i]) return
    setAntworten((a) => ({ ...a, [u.i]: { gewaehlt: option } }))
    try {
      const r = await api.deutschThemaAntwort({ thema, i: u.i, antwort: option })
      setAntworten((a) => ({ ...a, [u.i]: { gewaehlt: option, ergebnis: r } }))
    } catch (err) {
      setError(err.message)
    }
  }

  const fertig = daten ? Object.values(antworten).filter((a) => a.ergebnis) : []
  const richtig = fertig.filter((a) => a.ergebnis.richtig).length

  return (
    <div className="min-h-screen bg-[var(--flaeche)]">
      <Nav />
      <main className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <Link to="/deutsch" className="text-xs font-medium text-[var(--text-leise)] hover:text-[var(--text)]">
          ← Deutsch
        </Link>
        {error && <p className="text-sm text-[var(--rot)] mt-4">{error}</p>}
        {!daten && !error && <p className="text-sm text-[var(--text-leise)] mt-4">Wird geladen...</p>}

        {daten && (
          <>
            <h2 className="mt-3 text-xl sm:text-2xl font-bold text-[var(--text)]">{daten.titel}</h2>
            <p className="text-sm text-[var(--text-leise)]">{daten.kurz}</p>

            <section className="mt-5 rounded-2xl bg-[var(--karte)] border border-[var(--rand)] p-4 sm:p-5">
              <div className="flex flex-col gap-2.5 text-[15px] leading-relaxed text-[var(--text-weich)]">
                {daten.erklaerung.map((absatz) => (
                  <p key={absatz}>
                    <Fett text={absatz} />
                  </p>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--rand)]">
                <p className="text-xs font-semibold text-[var(--text-schwach)] mb-1.5">Beispiele</p>
                <ul className="flex flex-col gap-1 text-[15px] text-[var(--text)]">
                  {daten.beispiele.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            </section>

            <div className="flex items-baseline justify-between mt-7 mb-2">
              <h3 className="text-sm font-bold text-[var(--text)]">Übungen</h3>
              <span className="text-xs tabular-nums text-[var(--text-mittel)]">
                {fertig.length ? `${richtig} von ${fertig.length} richtig` : `${daten.uebungen.length} Sätze`}
              </span>
            </div>

            <ol className="flex flex-col gap-3">
              {daten.uebungen.map((u) => {
                const a = antworten[u.i]
                const r = a?.ergebnis
                return (
                  <li key={u.i} className="rounded-2xl bg-[var(--karte)] border border-[var(--rand)] p-4">
                    <p className="text-[16px] text-[var(--text)] leading-snug">
                      <Luecke satz={u.satz} fuellung={r ? r.loesung : a?.gewaehlt} richtig={r?.richtig} />
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {u.optionen.map((o) => {
                        const istLoesung = r && o === r.loesung
                        const istFalsch = r && o === a.gewaehlt && !r.richtig
                        return (
                          <button
                            key={o}
                            onClick={() => antworten_(u, o)}
                            disabled={Boolean(a)}
                            className={`px-3.5 py-2 rounded-xl border text-sm font-medium transition ${
                              istLoesung
                                ? 'border-[var(--gruen)] bg-[var(--gruen-leise)] text-[var(--text)]'
                                : istFalsch
                                  ? 'border-[var(--rot-rand)] bg-[var(--rot-flaeche)] text-[var(--rot)]'
                                  : 'border-[var(--rand)] bg-[var(--feld)] text-[var(--text)] hover:border-[var(--rand-stark)] disabled:opacity-60'
                            }`}
                          >
                            {o}
                          </button>
                        )
                      })}
                    </div>
                    {r && (
                      <p className={`mt-2.5 text-sm ${r.richtig ? 'text-[var(--gruen-tief)]' : 'text-[var(--rot)]'}`}>
                        {r.richtig ? 'Richtig. ' : 'Falsch. '}
                        <span className="text-[var(--text-mittel)]">{r.hinweis}</span>
                      </p>
                    )}
                  </li>
                )
              })}
            </ol>

            {fertig.length === daten.uebungen.length && (
              <div className="mt-5 p-4 rounded-2xl bg-[var(--karte)] border border-[var(--rand)] text-center">
                <p className="font-bold text-[var(--text)]">
                  {richtig} von {fertig.length} richtig
                </p>
                <p className="text-sm text-[var(--text-leise)] mt-1">
                  {richtig === fertig.length
                    ? 'Harika! Bu konu oturmuş.'
                    : 'Yanlışları açıklamalarıyla tekrar oku, sonra bir tur daha dene.'}
                </p>
                <button
                  onClick={() => setRunde((n) => n + 1)}
                  className="mt-3 px-4 py-2.5 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-medium"
                >
                  Noch eine Runde
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

// Den Satz mit der Luecke zeigen; nach der Antwort steht die Loesung darin.
function Luecke({ satz, fuellung, richtig }) {
  const teile = satz.split('___')
  // "rufe … an" fuellt zwei Luecken
  const stuecke = fuellung ? fuellung.split(' … ') : []
  return teile.map((teil, i) => (
    <span key={i}>
      {teil}
      {i < teile.length - 1 && (
        <span
          className={`inline-block min-w-[3.5em] px-1 mx-0.5 border-b-2 text-center font-semibold ${
            fuellung == null
              ? 'border-[var(--rand-stark)] text-transparent'
              : richtig === false
                ? 'border-[var(--gruen)] text-[var(--gruen-tief)]'
                : 'border-[var(--gruen)] text-[var(--text)]'
          }`}
        >
          {fuellung == null ? '…' : (stuecke[i] ?? '').replace('–', '') || ' '}
        </span>
      )}
    </span>
  ))
}
