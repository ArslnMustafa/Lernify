import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../api'
import Nav from '../components/Nav.jsx'
import { Hoeren, sprechen, feiern, MitArtikel } from '../deutsch/ui.jsx'

const BEREICHE = [['', 'Alle'], ['alltag', 'Alltag'], ['beruf', 'Beruf'], ['pruefung', 'Prüfung']]
const MODI = [['faellig', 'Heute'], ['fehler', 'Fehler'], ['alle', 'Alle Wörter']]

// Eine Karte nach der anderen: antworten, die Karte dreht sich um und zeigt das Wort
// mit Artikel, Form, Bedeutung und Beispielsatz -- und liest es vor.
export default function DeutschKarten() {
  const [params, setParams] = useSearchParams()
  const bereich = params.get('bereich') || ''
  const modus = params.get('modus') || 'faellig'
  const [frage, setFrage] = useState(null)
  const [leer, setLeer] = useState(false)
  const [ergebnis, setErgebnis] = useState(null)
  const [gewaehlt, setGewaehlt] = useState(null)
  const [um, setUm] = useState(false)
  const [zaehler, setZaehler] = useState({ richtig: 0, falsch: 0, folge: 0 })
  const [error, setError] = useState('')
  const timer = useRef(0)

  const laden = useCallback((letzte) => {
    // Alte Frage sofort weg, sonst ist sie bis zur neuen kurz wieder anklickbar
    clearTimeout(timer.current)
    setFrage(null); setUm(false); setErgebnis(null); setGewaehlt(null); setError('')
    api.deutschKarte(bereich, modus, letzte)
      .then((d) => { setFrage(d.frage); setLeer(!d.frage) })
      .catch((err) => setError(err.message))
  }, [bereich, modus])

  useEffect(() => { laden() }, [laden])
  useEffect(() => () => clearTimeout(timer.current), [])

  function setzen(key, wert) {
    const neu = new URLSearchParams(params)
    if (wert) neu.set(key, wert); else neu.delete(key)
    setParams(neu)
  }

  async function antworten(option, el) {
    if (ergebnis) return
    setGewaehlt(option)
    try {
      const r = await api.deutschKarteAntwort({ itemKey: frage.itemKey, art: frage.art, antwort: option })
      setErgebnis(r)
      setZaehler((z) => (r.richtig ? { ...z, richtig: z.richtig + 1, folge: z.folge + 1 } : { ...z, falsch: z.falsch + 1, folge: 0 }))
      if (r.richtig) feiern(el, r.xp)
      // kurz die Markierung zeigen, dann umdrehen und vorlesen
      timer.current = setTimeout(() => { setUm(true); sprechen(r.karte.wort) }, r.richtig ? 650 : 1100)
    } catch (err) {
      setError(err.message)
    }
  }

  const deutscheFrage = frage && (frage.art === 'bedeutung' || frage.art === 'artikel')

  return (
    <div className="min-h-screen bg-[var(--flaeche)]">
      <Nav />
      <main className="[overflow-x:clip] max-w-xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="flex items-center justify-between gap-2 mb-3">
          <Link to="/deutsch" className="text-xs font-medium text-[var(--text-leise)] hover:text-[var(--text)]">← Deutsch</Link>
          <span className="text-xs tabular-nums text-[var(--text-mittel)]">
            {zaehler.folge >= 3 && <span className="mr-2"><span className="de-flamme">🔥</span> {zaehler.folge} in Folge</span>}
            {zaehler.richtig} richtig · {zaehler.falsch} falsch
          </span>
        </div>

        <Auswahl werte={BEREICHE} aktiv={bereich} onPick={(v) => setzen('bereich', v)} label="Bereich" />
        <Auswahl werte={MODI} aktiv={modus} onPick={(v) => setzen('modus', v === 'faellig' ? '' : v)} label="Auswahl" />

        {error && <p className="text-sm text-[var(--rot)] mt-4">{error}</p>}

        {leer && (
          <div className="de-schritt mt-5 p-6 rounded-2xl bg-[var(--karte)] border border-[var(--rand)] text-center">
            <p className="text-3xl" aria-hidden="true">🎉</p>
            <p className="mt-2 font-semibold text-[var(--text)]">
              {modus === 'fehler' ? 'Keine Fehler zum Wiederholen.' : 'Für heute ist hier alles wiederholt.'}
            </p>
            <p className="text-sm text-[var(--text-leise)] mt-1">Bugünlük bu kadar. Yine de devam etmek istersen tüm kelimelerden sor.</p>
            <button onClick={() => setzen('modus', 'alle')} className="mt-4 px-4 py-2.5 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-medium">
              Alle Wörter üben
            </button>
          </div>
        )}

        {frage && (
          <div className={`de-flip de-schritt mt-5 ${um ? 'um' : ''}`} key={frage.itemKey + frage.art}>
            <div className="de-flip-innen">
              {/* ---------- Vorderseite: Frage ---------- */}
              <div className={`de-flip-vorn rounded-3xl bg-[var(--karte)] border border-[var(--rand)] p-5 sm:p-6 shadow-[0_12px_30px_-18px_rgba(0,0,0,.35)] ${ergebnis && !ergebnis.richtig ? 'de-falsch' : ''}`}>
                <div className="flex justify-between text-[11px] text-[var(--text-schwach)]">
                  <span>{frage.thema}{frage.neu ? ' · neues Wort' : ''}</span>
                  <span>{frage.hinweis}</span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <p className={`flex-1 font-extrabold text-[var(--text)] tracking-tight ${deutscheFrage ? 'text-3xl' : 'text-xl'}`}>
                    {frage.art === 'bedeutung' ? <MitArtikel text={frage.text} /> : frage.text}
                  </p>
                  {deutscheFrage && <Hoeren text={frage.text} />}
                </div>
                <div className={`mt-5 grid gap-2 ${frage.art === 'artikel' ? 'grid-cols-3' : ''}`}>
                  {frage.optionen.map((o) => {
                    const istLoesung = ergebnis && o === ergebnis.loesung
                    const istFalsch = ergebnis && o === gewaehlt && !ergebnis.richtig
                    return (
                      <button
                        key={o}
                        onClick={(e) => antworten(o, e.currentTarget)}
                        disabled={Boolean(ergebnis)}
                        className={`px-4 py-3 rounded-xl border text-[15px] transition ${frage.art === 'artikel' ? 'text-center font-bold text-lg' : 'text-left'} ${
                          istLoesung ? 'border-[var(--gruen)] bg-[var(--gruen-leise)] text-[var(--text)] font-semibold de-richtig'
                            : istFalsch ? 'border-[var(--rot-rand)] bg-[var(--rot-flaeche)] text-[var(--rot)]'
                              : 'border-[var(--rand)] bg-[var(--feld)] text-[var(--text)] hover:border-[var(--rand-stark)] hover:-translate-y-0.5'
                        }`}
                      >
                        {frage.art === 'artikel' ? <span className={`de-${o}`}>{o}</span> : frage.art === 'deutsch' ? <MitArtikel text={o} /> : o}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ---------- Rueckseite: das Wort ---------- */}
              <div className="de-flip-hinten rounded-3xl bg-[var(--karte)] border border-[var(--rand)] p-5 sm:p-6 flex flex-col shadow-[0_12px_30px_-18px_rgba(0,0,0,.35)]">
                {ergebnis && (
                  <>
                    <p className={`text-sm font-semibold ${ergebnis.richtig ? 'text-[var(--gruen-tief)]' : 'text-[var(--rot)]'}`}>
                      {ergebnis.richtig
                        ? ergebnis.wiederIn ? `Richtig! Kommt in ${ergebnis.wiederIn} ${ergebnis.wiederIn === 1 ? 'Tag' : 'Tagen'} wieder.` : 'Richtig!'
                        : 'Noch nicht. Diese Karte kommt bald wieder.'}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <p className="flex-1 font-extrabold text-3xl text-[var(--text)] tracking-tight"><MitArtikel text={ergebnis.karte.wort} /></p>
                      <Hoeren text={ergebnis.karte.wort} />
                    </div>
                    {ergebnis.karte.form !== '–' && <p className="text-sm text-[var(--text-leise)]">{ergebnis.karte.form}</p>}
                    <p className="text-[15px] text-[var(--text-mittel)] mt-1">{ergebnis.karte.tr}</p>
                    <div className="mt-4 flex items-start gap-3 p-3.5 rounded-xl bg-[var(--feld)]">
                      <Hoeren text={ergebnis.karte.beispiel} klein className="mt-0.5" />
                      <p className="text-[15px] text-[var(--text)] italic">„{ergebnis.karte.beispiel}“</p>
                    </div>
                    <button
                      onClick={() => laden(frage.itemKey)}
                      autoFocus={um}
                      className="mt-5 w-full px-4 py-3 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-semibold hover:bg-[var(--knopf-tief)]"
                    >
                      Weiter
                    </button>
                  </>
                )}
              </div>
            </div>
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
        <button key={wert} onClick={() => onPick(wert)} aria-pressed={aktiv === wert}
          className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition ${aktiv === wert ? 'bg-[var(--knopf)] text-[var(--auf-knopf)]' : 'text-[var(--text-mittel)] hover:bg-[var(--feld)]'}`}>
          {name}
        </button>
      ))}
    </div>
  )
}
