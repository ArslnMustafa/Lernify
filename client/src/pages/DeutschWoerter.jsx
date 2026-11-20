import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Nav from '../components/Nav.jsx'
import { Hoeren, MitArtikel } from '../deutsch/ui.jsx'
import { Niveau } from './DeutschKarten.jsx'

// Wortliste: alle Woerter zum Nachschlagen, mit Suche (deutsch oder tuerkisch),
// Filtern nach Bereich, Niveau und Lernstand, und dem Beispielsatz zum Anhoeren.
const STAENDE = [['', 'Alle'], ['neu', 'Neu'], ['lernen', 'Am Lernen'], ['sicher', 'Sicher'], ['fehler', 'Fehler']]
const standVon = (w) => (!w.gesehen ? 'neu' : w.box >= 3 ? 'sicher' : 'lernen')
// Fuer die Suche: Gross/Klein und Umlaute egal
const flach = (x) => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss').replace(/ı/g, 'i')

export default function DeutschWoerter() {
  const [d, setD] = useState(null)
  const [error, setError] = useState('')
  const [suche, setSuche] = useState('')
  const [bereich, setBereich] = useState('')
  const [niveau, setNiveau] = useState('')
  const [stand, setStand] = useState('')
  const [offen, setOffen] = useState(null)
  const [mehr, setMehr] = useState(60)

  useEffect(() => {
    api.deutschWoerter().then(setD).catch((err) => setError(err.message))
  }, [])

  const liste = useMemo(() => {
    if (!d) return []
    const q = flach(suche.trim())
    return d.woerter.filter((w) =>
      (!bereich || w.bereich === bereich) &&
      (!niveau || w.niveau === niveau) &&
      (!stand || (stand === 'fehler' ? w.falsch > 0 : standVon(w) === stand)) &&
      (!q || flach(w.wort).includes(q) || flach(w.tr).includes(q)))
  }, [d, suche, bereich, niveau, stand])

  // Bei neuem Filter wieder oben anfangen
  useEffect(() => { setMehr(60); setOffen(null) }, [suche, bereich, niveau, stand])

  const zahl = (f) => (d ? d.woerter.filter(f).length : 0)

  return (
    <div className="min-h-screen bg-[var(--flaeche)]">
      <Nav />
      <main className="[overflow-x:clip] max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <Link to="/deutsch" className="text-xs font-medium text-[var(--text-leise)] hover:text-[var(--text)]">← Deutsch</Link>
        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">Wortliste</h2>
        <p className="text-sm text-[var(--text-leise)]">Bütün kelimeler: ara, dinle, örnek cümleye bak.</p>

        {error && <p className="text-sm text-[var(--rot)] mt-4">{error}</p>}
        {!d && !error && <p className="text-sm text-[var(--text-leise)] mt-4">Wird geladen...</p>}

        {d && (
          <>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Zahl wert={zahl((w) => w.gesehen && w.box >= 3)} text="sicher" farbe="var(--gruen)" />
              <Zahl wert={zahl((w) => w.gesehen && w.box < 3)} text="am Lernen" farbe="var(--gold)" />
              <Zahl wert={zahl((w) => !w.gesehen)} text="neu" farbe="var(--text-schwach)" />
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <input
                type="search"
                value={suche}
                onChange={(e) => setSuche(e.target.value)}
                placeholder="Wort suchen, deutsch oder türkçe …"
                aria-label="Wort suchen"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--karte)] border border-[var(--rand)] text-[15px] text-[var(--text)] placeholder:text-[var(--text-schwach)] focus:outline-none focus:border-[var(--rand-stark)]"
              />
              <div className="flex flex-wrap gap-2">
                <select value={bereich} onChange={(e) => setBereich(e.target.value)} aria-label="Bereich"
                  className="px-3 py-1.5 rounded-xl bg-[var(--karte)] border border-[var(--rand)] text-xs font-semibold text-[var(--text-mittel)]">
                  <option value="">Alle Bereiche</option>
                  {d.bereiche.map((b) => <option key={b.key} value={b.key}>{b.name}</option>)}
                </select>
                <Chips werte={[['', 'Alle'], ...d.niveaus.map((n) => [n, n])]} aktiv={niveau} onPick={setNiveau} label="Niveau" />
              </div>
              <Chips werte={STAENDE} aktiv={stand} onPick={setStand} label="Lernstand" />
            </div>

            <p className="mt-2 mb-2 text-xs text-[var(--text-leise)]">{liste.length} {liste.length === 1 ? 'Wort' : 'Wörter'}</p>

            <ul className="rounded-2xl bg-[var(--karte)] border border-[var(--rand)] divide-y divide-[var(--rand)] overflow-hidden">
              {liste.slice(0, mehr).map((w) => {
                const auf = offen === w.key
                return (
                  <li key={w.key}>
                    <div className="flex items-start gap-3 px-3 sm:px-4 py-3">
                      <Hoeren text={w.wort} klein className="mt-0.5" />
                      <button onClick={() => setOffen(auf ? null : w.key)} aria-expanded={auf} className="flex-1 min-w-0 text-left">
                        <span className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-bold text-[var(--text)]"><MitArtikel text={w.wort} /></span>
                          {w.form !== '–' && <span className="text-xs text-[var(--text-schwach)]">{w.form}</span>}
                        </span>
                        <span className="block text-sm text-[var(--text-mittel)]">{w.tr}</span>
                      </button>
                      <span className="flex flex-col items-end gap-1.5 shrink-0">
                        <Niveau n={w.niveau} />
                        <Kaestchen w={w} />
                      </span>
                    </div>
                    {auf && (
                      <div className="de-schritt px-3 sm:px-4 pb-3 -mt-1">
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--feld)]">
                          <Hoeren text={w.beispiel} klein className="mt-0.5" />
                          <p className="text-[15px] text-[var(--text)] italic">„{w.beispiel}“</p>
                        </div>
                        <p className="mt-2 text-[11px] text-[var(--text-schwach)]">
                          {w.bereichName} · {w.thema}
                          {w.gesehen ? ` · ${w.richtig}× richtig, ${w.falsch}× falsch` : ' · noch nicht geübt'}
                        </p>
                      </div>
                    )}
                  </li>
                )
              })}
              {liste.length === 0 && <li className="px-4 py-6 text-sm text-center text-[var(--text-leise)]">Kein Wort gefunden.</li>}
            </ul>
            {liste.length > mehr && (
              <button onClick={() => setMehr((m) => m + 100)}
                className="mt-3 w-full px-4 py-2.5 rounded-xl bg-[var(--karte)] border border-[var(--rand)] text-sm font-semibold text-[var(--text-mittel)] hover:border-[var(--rand-stark)]">
                Weitere {Math.min(100, liste.length - mehr)} anzeigen
              </button>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function Zahl({ wert, text, farbe }) {
  return (
    <div className="p-3 rounded-2xl bg-[var(--karte)] border border-[var(--rand)]">
      <span className="block text-xl font-extrabold tabular-nums" style={{ color: farbe }}>{wert}</span>
      <span className="block text-[11px] text-[var(--text-leise)]">{text}</span>
    </div>
  )
}

// Lernstand als vier Kaestchen: so viele gefuellt, wie die Karte Boxen weit ist
function Kaestchen({ w }) {
  const voll = w.gesehen ? w.box : 0
  return (
    <span className="flex gap-0.5" title={w.gesehen ? `Box ${w.box} von 4` : 'neu'} aria-label={w.gesehen ? `Box ${w.box} von 4` : 'neu'}>
      {[1, 2, 3, 4].map((i) => (
        <span key={i} className={`w-1.5 h-3 rounded-sm ${i <= voll ? (voll >= 3 ? 'bg-[var(--gruen)]' : 'bg-[var(--gold)]') : 'bg-[var(--feld)]'}`} />
      ))}
    </span>
  )
}

function Chips({ werte, aktiv, onPick, label }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1 p-1 rounded-xl bg-[var(--karte)] border border-[var(--rand)]">
      {werte.map(([wert, name]) => (
        <button key={wert} onClick={() => onPick(wert)} aria-pressed={aktiv === wert}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${aktiv === wert ? 'bg-[var(--knopf)] text-[var(--auf-knopf)]' : 'text-[var(--text-mittel)] hover:bg-[var(--feld)]'}`}>
          {name}
        </button>
      ))}
    </div>
  )
}
