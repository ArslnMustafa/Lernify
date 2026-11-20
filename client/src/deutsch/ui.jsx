// Gemeinsame Bausteine fuer Deutsch: Vorlesen, Funken, Tagesziel-Ring, Artikel-Farben.
import { useEffect, useState } from 'react'
import './deutsch.css'

// ---------- Vorlesen (Sprachausgabe des Browsers, kostenlos, auch offline) ----------
let stimme = null
function deutscheStimme() {
  if (stimme || !window.speechSynthesis) return stimme
  const alle = window.speechSynthesis.getVoices()
  stimme = alle.find((v) => v.lang === 'de-DE' && /Google|Anna|Helena|Katja|Markus/i.test(v.name)) ||
    alle.find((v) => v.lang === 'de-DE') || alle.find((v) => v.lang?.startsWith('de')) || null
  return stimme
}
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => { stimme = null; deutscheStimme() }
}
export const kannSprechen = () => typeof window !== 'undefined' && Boolean(window.speechSynthesis)

export function sprechen(text, { langsam = false, fertig } = {}) {
  if (!kannSprechen()) return
  const synth = window.speechSynthesis
  synth.cancel()
  // "…" und Klammern nicht vorlesen
  const u = new SpeechSynthesisUtterance(text.replace(/…|\(.*?\)/g, ' ').trim())
  u.lang = 'de-DE'
  const v = deutscheStimme()
  if (v) u.voice = v
  u.rate = langsam ? 0.7 : 0.92
  if (fertig) { u.onend = fertig; u.onerror = fertig }
  synth.speak(u)
}

/** Lautsprecher-Knopf. Zweimal tippen = langsam. */
export function Hoeren({ text, klein = false, className = '' }) {
  const [an, setAn] = useState(false)
  const [mal, setMal] = useState(0)
  if (!kannSprechen()) return null
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        setAn(true)
        setMal((m) => m + 1)
        sprechen(text, { langsam: mal % 2 === 1, fertig: () => setAn(false) })
      }}
      aria-label={`Vorlesen: ${text}`}
      title="Anhören (nochmal tippen: langsam)"
      className={`inline-flex items-center justify-center shrink-0 rounded-full border border-[var(--rand)] bg-[var(--karte)] text-[var(--text-mittel)] hover:text-[var(--text)] hover:border-[var(--rand-stark)] transition ${klein ? 'w-7 h-7' : 'w-9 h-9'} ${className}`}
    >
      {an ? (
        <span className="de-spricht flex items-center gap-[2px] h-3">
          <i className="block w-[2px] h-3 bg-current rounded" />
          <i className="block w-[2px] h-3 bg-current rounded" />
          <i className="block w-[2px] h-3 bg-current rounded" />
        </span>
      ) : (
        <svg width={klein ? 13 : 15} height={klein ? 13 : 15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H3v6h3l5 4z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
      )}
    </button>
  )
}

// ---------- Funken + Punkte ----------
const FARBEN = ['var(--gold)', 'var(--der)', 'var(--die)', 'var(--das)', 'var(--gruen)']
/** Kleine Explosion an einem Element (oder Bildschirmmitte) und "+10" darueber. */
export function feiern(el, xp) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const r = el?.getBoundingClientRect?.() || { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 }
  const x = r.left + r.width / 2, y = r.top + r.height / 2
  const box = document.createElement('div')
  box.className = 'de-funken'
  for (let i = 0; i < 22; i++) {
    const f = document.createElement('i')
    f.className = 'de-funke'
    const w = (Math.PI * 2 * i) / 22 + Math.random() * 0.4
    const d = 50 + Math.random() * 70
    f.style.left = x + 'px'
    f.style.top = y + 'px'
    f.style.background = FARBEN[i % FARBEN.length]
    f.style.setProperty('--dx', Math.cos(w) * d + 'px')
    f.style.setProperty('--dy', Math.sin(w) * d - 20 + 'px')
    f.style.setProperty('--rot', Math.random() * 360 + 'deg')
    box.appendChild(f)
  }
  document.body.appendChild(box)
  if (xp) {
    const t = document.createElement('div')
    t.className = 'de-xp'
    t.textContent = '+' + xp
    t.style.left = x + 'px'
    t.style.top = r.top - 10 + 'px'
    document.body.appendChild(t)
    setTimeout(() => t.remove(), 1000)
  }
  setTimeout(() => box.remove(), 950)
}

// ---------- Tagesziel ----------
export function ZielRing({ wert, ziel, groesse = 92 }) {
  const [an, setAn] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setAn(Math.min(1, wert / ziel)), 80)
    return () => clearTimeout(t)
  }, [wert, ziel])
  const r = 40, C = 2 * Math.PI * r
  return (
    <svg className="de-ring" width={groesse} height={groesse} viewBox="0 0 100 100" aria-hidden="true">
      <circle className="bg" cx="50" cy="50" r={r} />
      <circle className="fg" cx="50" cy="50" r={r} strokeDasharray={C} strokeDashoffset={C * (1 - an)} transform="rotate(-90 50 50)" />
    </svg>
  )
}

/** Zahl, die hochzaehlt. */
export function Zaehler({ wert, dauer = 900 }) {
  const [z, setZ] = useState(0)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setZ(wert); return }
    let raf, t0
    const step = (t) => {
      if (!t0) t0 = t
      const k = Math.min(1, (t - t0) / dauer)
      setZ(Math.round(wert * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [wert, dauer])
  return z
}

// ---------- Artikel farbig ----------
/** "die Wohnung" -> Artikel in seiner Farbe */
export function MitArtikel({ text }) {
  const m = /^(der|die|das) (.*)$/.exec(text || '')
  if (!m) return text
  return (
    <>
      <span className={`de-${m[1]}`}>{m[1]}</span> {m[2]}
    </>
  )
}
