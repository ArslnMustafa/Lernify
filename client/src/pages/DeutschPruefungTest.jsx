import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import Nav from '../components/Nav.jsx'
import { dialogVorlesen, stillsein, kannSprechen, feiern } from '../deutsch/ui.jsx'
import { prozent, dauerText } from './DeutschPruefung.jsx'

// Ein Modelltest wie in der Pruefung: erst Lesen (mit Zeitlimit, danach kein Zurueck),
// dann Hoeren (jeder Text hoechstens zweimal), dann Abgabe und Auswertung mit Erklaerungen.
// Der Zwischenstand liegt im Browser, damit ein Neuladen nichts kostet.

const MAX_HOEREN = 2
const BUCHSTABEN = ['a', 'b', 'c', 'd']
const speicherKey = (key) => `lernify-pruefung-${key}`
function laden(key) {
  try {
    const s = JSON.parse(localStorage.getItem(speicherKey(key)) || 'null')
    // Nach vier Stunden gilt ein angefangener Test als liegen gelassen
    return s && Date.now() - s.start < 4 * 3600 * 1000 ? s : null
  } catch { return null }
}
function speichern(key, stand) {
  try { localStorage.setItem(speicherKey(key), JSON.stringify(stand)) } catch { /* privat: ohne Zwischenstand */ }
}
function vergessen(key) {
  try { localStorage.removeItem(speicherKey(key)) } catch { /* egal */ }
}
const uhr = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default function DeutschPruefungTest() {
  const { key } = useParams()
  const [test, setTest] = useState(null)
  const [error, setError] = useState('')
  // phase: start | lesen | hoeren | ergebnis
  const [stand, setStand] = useState({ phase: 'start', teil: 0, antworten: {}, plays: {}, start: 0, lesenEnde: 0 })
  const [jetzt, setJetzt] = useState(Date.now())
  const [hinweis, setHinweis] = useState('')
  const [ergebnis, setErgebnis] = useState(null)
  const [sendet, setSendet] = useState(false)
  const oben = useRef(null)

  useEffect(() => {
    api.deutschPruefung(key).then((t) => {
      setTest(t)
      const alt = laden(key)
      if (alt && (alt.phase === 'lesen' || alt.phase === 'hoeren')) {
        setStand(alt)
        setHinweis('Dein angefangener Test wurde wiederhergestellt.')
      }
    }).catch((err) => setError(err.message))
    return () => stillsein()
  }, [key])

  const teile = useMemo(() => {
    if (!test) return { lesen: [], hoeren: [] }
    return { lesen: test.teile.filter((t) => t.modul === 'lesen'), hoeren: test.teile.filter((t) => t.modul === 'hoeren') }
  }, [test])

  const setze = useCallback((f) => {
    setStand((s) => {
      const neu = typeof f === 'function' ? f(s) : { ...s, ...f }
      if (neu.phase === 'lesen' || neu.phase === 'hoeren') speichern(key, neu)
      return neu
    })
  }, [key])

  // Uhr fuer Lesen; laeuft die Zeit ab, geht es automatisch zum Hoeren
  useEffect(() => {
    if (stand.phase !== 'lesen') return
    const t = setInterval(() => setJetzt(Date.now()), 1000)
    return () => clearInterval(t)
  }, [stand.phase])
  useEffect(() => {
    if (stand.phase === 'lesen' && stand.lesenEnde && jetzt >= stand.lesenEnde) {
      setHinweis('Die Zeit für Lesen ist abgelaufen. Weiter mit Hören.')
      setze((s) => ({ ...s, phase: 'hoeren', teil: 0 }))
    }
  }, [jetzt, stand.phase, stand.lesenEnde, setze])

  // Beim Wechsel des Teils nach oben
  useEffect(() => {
    oben.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [stand.phase, stand.teil])

  function starten() {
    const t = Date.now()
    setJetzt(t)
    setHinweis('')
    setze({ phase: 'lesen', teil: 0, antworten: {}, plays: {}, start: t, lesenEnde: t + test.minuten.lesen * 60000 })
  }

  const antworte = (id, wert) => setze((s) => ({ ...s, antworten: { ...s.antworten, [id]: wert } }))
  const gespielt = (id) => setze((s) => ({ ...s, plays: { ...s.plays, [id]: (s.plays[id] || 0) + 1 } }))

  const liste = stand.phase === 'hoeren' ? teile.hoeren : teile.lesen
  const teil = liste[stand.teil]
  const offen = (ts) => ts.reduce((n, t) => n + t.fragen.filter((f) => stand.antworten[f.id] === undefined).length, 0)

  function zumHoeren() {
    const n = offen(teile.lesen)
    if (!window.confirm(`Lesen beenden?${n ? ` ${n} Aufgaben sind noch offen.` : ''} Danach kannst du nicht mehr zurück.`)) return
    setHinweis('')
    setze((s) => ({ ...s, phase: 'hoeren', teil: 0 }))
  }

  async function abgeben() {
    const n = offen(teile.hoeren) + offen(teile.lesen)
    if (n && !window.confirm(`${n} Aufgaben sind noch offen. Trotzdem abgeben?`)) return
    stillsein()
    setSendet(true)
    try {
      const r = await api.deutschPruefungAbgabe(key, { antworten: stand.antworten, sekunden: Math.round((Date.now() - stand.start) / 1000) })
      vergessen(key)
      setErgebnis({ ...r, sekunden: Math.round((Date.now() - stand.start) / 1000) })
      setze((s) => ({ ...s, phase: 'ergebnis' }))
      if (r.xp) feiern(null, r.xp)
    } catch (err) {
      setError(err.message)
    } finally {
      setSendet(false)
    }
  }

  function nochmal() {
    vergessen(key)
    setErgebnis(null)
    setStand({ phase: 'start', teil: 0, antworten: {}, plays: {}, start: 0, lesenEnde: 0 })
  }

  const rest = stand.lesenEnde - jetzt
  const knapp = stand.phase === 'lesen' && rest < 5 * 60000

  return (
    <div className="min-h-screen bg-[var(--flaeche)]">
      <Nav />
      <main ref={oben} className={`[overflow-x:clip] max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8 scroll-mt-20 ${stand.phase === 'lesen' || stand.phase === 'hoeren' ? 'pb-28' : ''}`}>
        <Link to="/deutsch/pruefung" className="text-xs font-medium text-[var(--text-leise)] hover:text-[var(--text)]">← Prüfungssimulation</Link>
        {error && <p className="text-sm text-[var(--rot)] mt-4">{error}</p>}
        {!test && !error && <p className="text-sm text-[var(--text-leise)] mt-4">Wird geladen...</p>}
        {hinweis && <p className="mt-3 text-sm px-3 py-2 rounded-xl bg-[color-mix(in_srgb,var(--gold)_14%,var(--karte))] border border-[var(--gold)] text-[var(--text)]" role="status">{hinweis}</p>}

        {test && stand.phase === 'start' && <Start test={test} teile={teile} onStart={starten} />}

        {test && teil && (stand.phase === 'lesen' || stand.phase === 'hoeren') && (
          <section key={stand.phase + stand.teil} className="de-schritt mt-3">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text)] tracking-tight">{teil.titel}</h2>
              <span className="text-xs font-semibold text-[var(--text-leise)]">{test.niveau} · {test.titel}</span>
            </div>
            <p className="mt-1 text-[15px] text-[var(--text)]">{teil.aufgabe}</p>
            <p className="text-xs text-[var(--text-leise)]">{teil.tr}</p>
            <TeilInhalt teil={teil} antworten={stand.antworten} antworte={antworte} plays={stand.plays} gespielt={gespielt} />
          </section>
        )}

        {test && stand.phase === 'ergebnis' && ergebnis && (
          <Auswertung test={test} e={ergebnis} antworten={stand.antworten} onNochmal={nochmal} />
        )}
      </main>

      {/* ---------- Leiste unten: Teile, Zeit, weiter ---------- */}
      {test && (stand.phase === 'lesen' || stand.phase === 'hoeren') && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-[var(--karte)] border-t border-[var(--rand)] pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-3xl mx-auto px-3 sm:px-6 py-2.5 flex items-center gap-2">
            <div className="flex gap-1" role="tablist" aria-label="Teile">
              {liste.map((t, i) => {
                const n = t.fragen.filter((f) => stand.antworten[f.id] === undefined).length
                return (
                  <button key={t.id} role="tab" aria-selected={i === stand.teil} onClick={() => setze((s) => ({ ...s, teil: i }))}
                    title={`${t.titel}${n ? `: ${n} offen` : ': fertig'}`}
                    className={`relative w-9 h-9 rounded-xl text-sm font-bold transition ${i === stand.teil ? 'bg-[var(--knopf)] text-[var(--auf-knopf)]' : 'bg-[var(--feld)] text-[var(--text-mittel)]'}`}>
                    {i + 1}
                    {n === 0 && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[var(--gruen)] border-2 border-[var(--karte)]" aria-hidden="true" />}
                  </button>
                )
              })}
            </div>
            <span className="ml-1 text-xs font-semibold text-[var(--text-mittel)] hidden sm:inline">{stand.phase === 'lesen' ? 'Lesen' : 'Hören'}</span>
            {stand.phase === 'lesen' && (
              <span className={`ml-auto tabular-nums text-sm font-extrabold px-2.5 py-1 rounded-lg ${knapp ? 'bg-[var(--rot-flaeche)] text-[var(--rot)]' : 'text-[var(--text)]'}`} aria-label="Restzeit Lesen">
                ⏱ {uhr(rest)}
              </span>
            )}
            <span className={stand.phase === 'lesen' ? '' : 'ml-auto'} />
            {stand.teil < liste.length - 1 ? (
              <button onClick={() => setze((s) => ({ ...s, teil: s.teil + 1 }))}
                className="px-4 py-2.5 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-semibold">Weiter</button>
            ) : stand.phase === 'lesen' ? (
              <button onClick={zumHoeren} className="px-4 py-2.5 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-semibold">Zu Hören</button>
            ) : (
              <button onClick={abgeben} disabled={sendet} className="px-4 py-2.5 rounded-xl bg-[var(--gruen)] text-[var(--auf-farbe)] text-sm font-semibold disabled:opacity-60">
                {sendet ? 'Wird ausgewertet…' : 'Abgeben'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- Startseite des Tests ----------
function Start({ test, teile, onStart }) {
  return (
    <section className="de-schritt mt-3">
      <span className="inline-block px-2 py-0.5 rounded-md bg-[var(--feld)] text-xs font-bold text-[var(--text-mittel)]">{test.niveau}</span>
      <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">{test.titel}</h2>
      <p className="text-sm text-[var(--text-leise)]">{test.thema}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="p-4 rounded-2xl bg-[var(--karte)] border border-[var(--rand)]">
          <span className="block text-2xl" aria-hidden="true">📖</span>
          <span className="block mt-1 font-bold text-[var(--text)]">Lesen · {test.minuten.lesen} Minuten</span>
          <span className="block text-xs text-[var(--text-leise)] mt-0.5">{teile.lesen.length} Teile, {teile.lesen.reduce((n, t) => n + t.fragen.length, 0)} Aufgaben. Süre bitince Hören'e geçilir, geri dönülmez.</span>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--karte)] border border-[var(--rand)]">
          <span className="block text-2xl" aria-hidden="true">🎧</span>
          <span className="block mt-1 font-bold text-[var(--text)]">Hören · jeder Text höchstens 2×</span>
          <span className="block text-xs text-[var(--text-leise)] mt-0.5">{teile.hoeren.length} Teile, {teile.hoeren.reduce((n, t) => n + t.fragen.length, 0)} Aufgaben. Sesi aç ya da kulaklık tak.</span>
        </div>
      </div>
      <div className="mt-4 p-4 rounded-2xl bg-[color-mix(in_srgb,var(--gold)_10%,var(--karte))] border border-[var(--gold)] text-sm text-[var(--text-weich)]">
        <span className="font-bold text-[var(--text)]">💡 Sınav tüyoları</span>
        <ul className="mt-1.5 flex flex-col gap-1 list-disc pl-5">
          <li>Önce soruları oku, sonra metne dön: neyi aradığını bilirsen daha hızlı bulursun.</li>
          <li>Richtig/Falsch: metinde tam olarak yazmıyorsa genelde falsch'tır. „nur“, „alle“, „nie“ gibi kelimelere dikkat.</li>
          <li>Dinlerken ilk seferde cevabı işaretle, ikinci seferde kontrol et.</li>
          <li>Boş bırakma: yanlış cevap puan götürmez.</li>
        </ul>
      </div>
      {!kannSprechen() && (
        <p className="mt-3 text-xs text-[var(--rot)]">Bu tarayıcı sesli okumayı desteklemiyor. Hören bölümünde metinler yazılı gösterilecek.</p>
      )}
      <button onClick={onStart} className="mt-5 w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] font-semibold hover:bg-[var(--knopf-tief)]">
        Prüfung starten
      </button>
    </section>
  )
}

// ---------- Ein Teil: Text, Hoertext und Aufgaben ----------
function TeilInhalt({ teil, antworten, antworte, plays, gespielt }) {
  return (
    <div className="mt-4 flex flex-col gap-4">
      {teil.text && (
        <article className="p-4 sm:p-5 rounded-2xl bg-[var(--karte)] border border-[var(--rand)]">
          <h3 className="font-bold text-[var(--text)]">{teil.text.titel}</h3>
          {teil.text.absaetze.map((a, i) => <p key={i} className="mt-2 text-[15px] leading-relaxed text-[var(--text)]">{a}</p>)}
        </article>
      )}
      {teil.typ === 'zuordnen' && (
        <div className="grid gap-2 sm:grid-cols-2">
          {teil.texte.map((x) => (
            <article key={x.id} className="p-3.5 rounded-2xl bg-[var(--karte)] border border-[var(--rand)]">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[var(--knopf)] text-[var(--auf-knopf)] text-xs font-bold flex items-center justify-center uppercase">{x.id}</span>
                <span className="font-bold text-sm text-[var(--text)]">{x.titel}</span>
              </span>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-weich)]">{x.text}</p>
            </article>
          ))}
        </div>
      )}
      {teil.hoertext && <Abspieler id={teil.id} zeilen={teil.hoertext} plays={plays} gespielt={gespielt} />}

      <ol className="flex flex-col gap-3">
        {teil.fragen.map((f) => (
          <li key={f.id} className="p-4 rounded-2xl bg-[var(--karte)] border border-[var(--rand)]">
            {f.hoertext && <Abspieler id={f.id} zeilen={f.hoertext} plays={plays} gespielt={gespielt} klein />}
            <p className={`text-[15px] text-[var(--text)] ${f.hoertext ? 'mt-3' : ''}`}>
              <span className="mr-2 text-xs font-bold text-[var(--text-schwach)]">{f.id}</span>{f.text}
            </p>
            <Antworten teil={teil} frage={f} wert={antworten[f.id]} onWahl={(w) => antworte(f.id, w)} />
          </li>
        ))}
      </ol>
    </div>
  )
}

function Antworten({ teil, frage, wert, onWahl }) {
  const knopf = (aktiv) => `px-3.5 py-2.5 rounded-xl border text-sm font-medium transition text-left ${
    aktiv ? 'border-[var(--knopf)] bg-[var(--knopf)] text-[var(--auf-knopf)]' : 'border-[var(--rand)] bg-[var(--feld)] text-[var(--text)] hover:border-[var(--rand-stark)]'
  }`
  if (teil.typ === 'rf') {
    return (
      <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup">
        {[[true, 'richtig'], [false, 'falsch']].map(([w, n]) => (
          <button key={n} role="radio" aria-checked={wert === w} onClick={() => onWahl(w)} className={`${knopf(wert === w)} text-center`}>{n}</button>
        ))}
      </div>
    )
  }
  if (teil.typ === 'mc') {
    return (
      <div className="mt-3 flex flex-col gap-2" role="radiogroup">
        {frage.optionen.map((o, i) => (
          <button key={i} role="radio" aria-checked={wert === i} onClick={() => onWahl(i)} className={`${knopf(wert === i)} flex gap-2`}>
            <span className="font-bold">{BUCHSTABEN[i]}</span><span>{o}</span>
          </button>
        ))}
      </div>
    )
  }
  return (
    <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup">
      {[...teil.texte.map((x) => x.id), '0'].map((id) => (
        <button key={id} role="radio" aria-checked={wert === id} onClick={() => onWahl(id)}
          className={`${knopf(wert === id)} w-11 text-center uppercase font-bold`}>{id}</button>
      ))}
    </div>
  )
}

// ---------- Abspielen: hoechstens zweimal, wie in der Pruefung ----------
function Abspieler({ id, zeilen, plays, gespielt, klein = false }) {
  const [laeuft, setLaeuft] = useState(false)
  const n = plays[id] || 0
  const rest = MAX_HOEREN - n
  useEffect(() => () => { if (laeuft) stillsein() }, [laeuft])

  if (!kannSprechen()) {
    return (
      <div className="p-3 rounded-xl bg-[var(--feld)] text-sm text-[var(--text)]">
        {zeilen.map(([wer, satz], i) => <p key={i}><b>{wer}:</b> {satz}</p>)}
      </div>
    )
  }
  return (
    <div className={`flex items-center gap-3 ${klein ? '' : 'p-4 rounded-2xl bg-[var(--karte)] border border-[var(--rand)]'}`}>
      <button
        onClick={() => {
          if (laeuft || rest <= 0) return
          gespielt(id)
          setLaeuft(true)
          dialogVorlesen(zeilen, { fertig: () => setLaeuft(false) })
        }}
        disabled={laeuft || rest <= 0}
        className={`shrink-0 flex items-center justify-center rounded-full transition ${klein ? 'w-11 h-11' : 'w-14 h-14'} ${
          rest <= 0 && !laeuft ? 'bg-[var(--feld)] text-[var(--text-schwach)]' : 'bg-[var(--knopf)] text-[var(--auf-knopf)] hover:scale-105'
        }`}
        aria-label={laeuft ? 'Wird abgespielt' : rest > 0 ? `Abspielen, noch ${rest}-mal` : 'Schon zweimal gehört'}
      >
        {laeuft ? (
          <span className="de-spricht flex items-center gap-[3px] h-4">
            <i className="block w-[3px] h-4 bg-current rounded" /><i className="block w-[3px] h-4 bg-current rounded" /><i className="block w-[3px] h-4 bg-current rounded" />
          </span>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
        )}
      </button>
      <span className="text-sm">
        <span className="block font-semibold text-[var(--text)]">{laeuft ? 'Hören …' : rest > 0 ? (n ? 'Noch einmal hören' : 'Text abspielen') : 'Zweimal gehört'}</span>
        <span className="block text-xs text-[var(--text-leise)]">{rest > 0 ? `noch ${rest}× möglich` : 'kein weiteres Abspielen'}</span>
      </span>
    </div>
  )
}

// ---------- Auswertung ----------
function Auswertung({ test, e, antworten, onNochmal }) {
  const gesamt = e.lesen + e.hoeren
  const max = e.lesenMax + e.hoerenMax
  const alles = e.bestanden.lesen && e.bestanden.hoeren
  const zeige = (teil, w) => {
    if (w === null || w === undefined) return '—'
    if (teil.typ === 'rf') return w ? 'richtig' : 'falsch'
    if (teil.typ === 'mc') return BUCHSTABEN[w]
    return w === '0' ? '0' : String(w).toUpperCase()
  }
  return (
    <section className="de-schritt mt-3">
      <div className={`p-5 sm:p-6 rounded-3xl border text-center ${alles ? 'bg-[var(--gruen-leise)] border-[var(--gruen)]' : 'bg-[var(--karte)] border-[var(--rand)]'}`}>
        <p className="text-4xl" aria-hidden="true">{alles ? '🎉' : '💪'}</p>
        <p className="mt-2 text-sm font-semibold text-[var(--text-mittel)]">{test.niveau} · {test.titel}</p>
        <p className="text-5xl font-extrabold text-[var(--text)] tabular-nums">{gesamt}/{max}</p>
        <p className="mt-1 font-bold text-[var(--text)]">{alles ? 'Bestanden!' : 'Noch nicht bestanden'}</p>
        <p className="text-xs text-[var(--text-leise)] mt-1">Dauer: {dauerText(e.sekunden)} · +{e.xp} XP</p>
        <div className="mt-5 grid grid-cols-2 gap-3 text-left">
          {[['Lesen', e.lesen, e.lesenMax, e.bestanden.lesen], ['Hören', e.hoeren, e.hoerenMax, e.bestanden.hoeren]].map(([n, a, b, ok]) => (
            <div key={n} className="p-3 rounded-2xl bg-[var(--karte)] border border-[var(--rand)]">
              <span className="flex justify-between text-sm font-bold text-[var(--text)]"><span>{n}</span><span className="tabular-nums">{prozent(a, b)} %</span></span>
              <span className="mt-2 block h-2 rounded-full bg-[var(--feld)] overflow-hidden relative">
                <span className={`block h-full rounded-full ${ok ? 'bg-[var(--gruen)]' : 'bg-[var(--rot)]'}`} style={{ width: `${prozent(a, b)}%`, transition: 'width 1s' }} />
                <span className="absolute top-0 bottom-0 w-0.5 bg-[var(--text-mittel)]" style={{ left: '60%' }} title="60 %" />
              </span>
              <span className="block mt-1 text-xs text-[var(--text-leise)]">{a} von {b} · {ok ? 'bestanden' : 'ab 60 % bestanden'}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button onClick={onNochmal} className="px-5 py-2.5 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-semibold">Noch einmal</button>
          <Link to="/deutsch/pruefung" className="px-5 py-2.5 rounded-xl bg-[var(--karte)] border border-[var(--rand)] text-sm font-semibold text-[var(--text-mittel)]">Andere Tests</Link>
        </div>
      </div>

      <h3 className="mt-8 mb-1 text-lg font-bold text-[var(--text)]">Auswertung</h3>
      <p className="text-xs text-[var(--text-leise)] mb-3">Her sorunun cevabı ve metinde nerede yazdığı.</p>
      {test.teile.map((t) => (
        <div key={t.id} className="mb-5">
          <h4 className="text-sm font-bold text-[var(--text-mittel)] mb-2">
            {t.titel} · {t.fragen.filter((f) => e.auswertung[f.id]?.richtig).length}/{t.fragen.length}
          </h4>
          <ol className="flex flex-col gap-2">
            {t.fragen.map((f) => {
              const a = e.auswertung[f.id]
              return (
                <li key={f.id} className={`p-3.5 rounded-2xl border ${a.richtig ? 'bg-[var(--karte)] border-[var(--rand)]' : 'bg-[var(--rot-flaeche)] border-[var(--rot-rand)]'}`}>
                  <p className="text-sm text-[var(--text)]">
                    <span className="mr-1.5" aria-hidden="true">{a.richtig ? '✅' : '❌'}</span>
                    <span className="mr-1.5 text-xs font-bold text-[var(--text-schwach)]">{f.id}</span>{f.text}
                  </p>
                  {t.typ === 'mc' && <p className="mt-1 text-xs text-[var(--text-mittel)]">{f.optionen.map((o, i) => `${BUCHSTABEN[i]}) ${o}`).join('  ·  ')}</p>}
                  <p className="mt-1.5 text-xs text-[var(--text-mittel)]">
                    Deine Antwort: <b>{zeige(t, antworten[f.id])}</b>
                    {!a.richtig && <> · Richtig: <b className="text-[var(--gruen-tief)]">{zeige(t, a.loesung)}</b></>}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-weich)]">💡 {a.erklaerung}</p>
                  {f.hoertext && <Transkript zeilen={f.hoertext} />}
                </li>
              )
            })}
          </ol>
          {t.hoertext && <Transkript zeilen={t.hoertext} />}
        </div>
      ))}
    </section>
  )
}

function Transkript({ zeilen }) {
  return (
    <details className="mt-2 text-xs">
      <summary className="cursor-pointer font-semibold text-[var(--text-mittel)]">Hörtext lesen</summary>
      <div className="mt-1.5 p-3 rounded-xl bg-[var(--feld)] flex flex-col gap-1 text-[13px] text-[var(--text)]">
        {zeilen.map(([wer, satz], i) => <p key={i}><b>{wer}:</b> {satz}</p>)}
      </div>
    </details>
  )
}
