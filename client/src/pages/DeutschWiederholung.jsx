import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Nav from '../components/Nav.jsx'
import { feiern } from '../deutsch/ui.jsx'
import { Luecke } from './DeutschLektion.jsx'

// Konu tekrari: zehn gemischte Saetze aus angefangenen Themen (Fehler zuerst),
// darunter die Zusammenfassungen zum schnellen Nachlesen.
export default function DeutschWiederholung() {
  const [d, setD] = useState(null)
  const [pos, setPos] = useState(0)
  const [ergebnis, setErgebnis] = useState(null)
  const [gewaehlt, setGewaehlt] = useState(null)
  const [punkte, setPunkte] = useState(0)
  const [error, setError] = useState('')

  const laden = useCallback(() => {
    setD(null); setPos(0); setErgebnis(null); setGewaehlt(null); setPunkte(0)
    api.deutschWiederholung().then(setD).catch((err) => setError(err.message))
  }, [])
  useEffect(() => { laden() }, [laden])

  const u = d?.uebungen[pos]
  const fertig = d && pos >= d.uebungen.length

  async function antworte(o, el) {
    if (ergebnis) return
    setGewaehlt(o)
    try {
      const r = await api.deutschThemaAntwort({ thema: u.thema, i: u.i, antwort: o })
      setErgebnis(r)
      if (r.richtig) { setPunkte((p) => p + 1); feiern(el, r.xp) }
    } catch (err) { setError(err.message) }
  }

  return (
    <div className="min-h-screen bg-[var(--flaeche)]">
      <Nav />
      <main className="[overflow-x:clip] max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <Link to="/deutsch" className="text-xs font-medium text-[var(--text-leise)] hover:text-[var(--text)]">← Deutsch</Link>
        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">Konu tekrarı</h2>
        <p className="text-sm text-[var(--text-leise)]">Başladığın konulardan karışık sorular. Önce yanlış yaptıkların gelir.</p>
        {error && <p className="text-sm text-[var(--rot)] mt-4">{error}</p>}
        {!d && !error && <p className="text-sm text-[var(--text-leise)] mt-4">Wird geladen...</p>}

        {d && d.uebungen.length === 0 && (
          <div className="mt-5 p-5 rounded-2xl bg-[var(--karte)] border border-[var(--rand)] text-center">
            <p className="font-semibold text-[var(--text)]">Henüz tekrar edilecek bir şey yok.</p>
            <p className="text-sm text-[var(--text-leise)] mt-1">Önce bir dersin alıştırmalarını çöz, sonra burada karışık tekrar yaparsın.</p>
            <Link to="/deutsch" className="inline-block mt-4 px-4 py-2.5 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-medium">Zum Lernpfad</Link>
          </div>
        )}

        {u && (
          <div className="mt-5">
            <div className="flex justify-between text-xs text-[var(--text-mittel)] mb-2">
              <span>{u.titel}</span><span className="tabular-nums">{pos + 1} / {d.uebungen.length}</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--feld)] overflow-hidden mb-4">
              <div className="h-full bg-[var(--gold)] transition-all duration-500" style={{ width: `${(pos / d.uebungen.length) * 100}%` }} />
            </div>
            <div key={pos} className={`de-schritt rounded-2xl bg-[var(--karte)] border border-[var(--rand)] p-5 ${ergebnis ? (ergebnis.richtig ? 'de-richtig' : 'de-falsch') : ''}`}>
              <p className="text-lg text-[var(--text)] leading-snug"><Luecke satz={u.satz} fuellung={ergebnis ? ergebnis.loesung : gewaehlt} richtig={ergebnis?.richtig} /></p>
              <div className="mt-4 flex flex-wrap gap-2">
                {u.optionen.map((o) => {
                  const ok = ergebnis && o === ergebnis.loesung
                  const bad = ergebnis && o === gewaehlt && !ergebnis.richtig
                  return (
                    <button key={o} onClick={(e) => antworte(o, e.currentTarget)} disabled={Boolean(ergebnis)}
                      className={`px-4 py-2.5 rounded-xl border text-[15px] font-medium transition ${ok ? 'border-[var(--gruen)] bg-[var(--gruen-leise)]' : bad ? 'border-[var(--rot-rand)] bg-[var(--rot-flaeche)] text-[var(--rot)]' : 'border-[var(--rand)] bg-[var(--feld)] hover:border-[var(--rand-stark)] hover:-translate-y-0.5'}`}>
                      {o}
                    </button>
                  )
                })}
              </div>
              {ergebnis && (
                <>
                  <p className={`mt-3 text-sm ${ergebnis.richtig ? 'text-[var(--gruen-tief)]' : 'text-[var(--rot)]'}`}>
                    {ergebnis.richtig ? 'Richtig. ' : 'Falsch. '}<span className="text-[var(--text-mittel)]">{ergebnis.hinweis}</span>
                  </p>
                  <button onClick={() => { setPos((p) => p + 1); setErgebnis(null); setGewaehlt(null) }} autoFocus
                    className="mt-4 w-full px-4 py-3 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-semibold">
                    Weiter
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {fertig && d.uebungen.length > 0 && (
          <div className="de-schritt mt-5 p-6 rounded-2xl bg-[var(--karte)] border border-[var(--rand)] text-center">
            <p className="text-4xl font-extrabold text-[var(--text)]">{punkte}/{d.uebungen.length}</p>
            <p className="text-sm text-[var(--text-leise)] mt-1">{punkte === d.uebungen.length ? 'Kusursuz!' : 'Yanlışlar bir sonraki tekrarda yine gelecek.'}</p>
            <button onClick={laden} className="mt-4 px-5 py-2.5 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-semibold">Noch eine Runde</button>
          </div>
        )}

        {d && d.themen.length > 0 && (
          <>
            <h3 className="mt-8 mb-3 text-lg font-bold text-[var(--text)]">Özetler</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {d.themen.map((t) => (
                <Link key={t.key} to={`/deutsch/lektion/${t.key}`} className="block p-4 rounded-2xl bg-[var(--karte)] border border-[var(--rand)] hover:border-[var(--rand-stark)] transition">
                  <span className="block font-bold text-[var(--text)]">{t.titel}</span>
                  <ul className="mt-2 flex flex-col gap-1">
                    {t.ozet.map((o) => <li key={o} className="text-xs text-[var(--text-weich)] flex gap-1.5"><span className="text-[var(--gold)]">●</span>{o}</li>)}
                  </ul>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
