import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

const TABS = [
  { to: '/training', label: 'Training', icon: CapIcon },
  { to: '/vergleich', label: 'Vergleich', icon: CompareIcon },
  { to: '/karteikarten', label: 'Karteikarten', icon: CardsIcon },
  { to: '/simulation', label: 'Simulation', icon: TimerIcon },
  { to: '/theorie', label: 'Theorie', icon: BookIcon },
  { to: '/verwalten', label: 'Verwalten', icon: GearIcon },
]

// Light or dark, remembered per device; without a choice the phone decides.
const SPEICHER = 'lernify_thema'

function gespeichertesThema() {
  try {
    return localStorage.getItem(SPEICHER)
  } catch {
    return null
  }
}

export default function Nav() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [thema, setThema] = useState(() => gespeichertesThema() || 'system')

  useEffect(() => {
    const wurzel = document.documentElement
    if (thema === 'system') delete wurzel.dataset.theme
    else wurzel.dataset.theme = thema
    try {
      if (thema === 'system') localStorage.removeItem(SPEICHER)
      else localStorage.setItem(SPEICHER, thema)
    } catch {
      /* without storage the choice lasts for this visit */
    }
  }, [thema])

  const dunkel =
    thema === 'dunkel' ||
    (thema === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)

  return (
    <header className="bg-[var(--karte)] border-b border-[var(--rand)] sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-2 sm:gap-3">
        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--knopf)] text-[var(--auf-knopf)] flex items-center justify-center font-bold text-[11px] sm:text-xs">
          L
        </span>
        <span className="font-bold text-[15px] sm:text-base text-[var(--text)]">Lernify</span>
        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[var(--feld)] border border-[var(--rand)] text-[11px] font-medium text-[var(--text-mittel)]">
          {user.name}
        </span>

        {/* Wide screens show the sections as tabs, the phone keeps one button. */}
        <nav className="hidden md:flex items-center gap-1 ml-auto">
          {TABS.map((tab) => (
            <Tab key={tab.to} tab={tab} />
          ))}
          <button
            onClick={logout}
            className="ml-2 text-xs font-medium text-[var(--text-schwach)] hover:text-[var(--text)] transition"
          >
            Abmelden
          </button>
        </nav>

        <button
          onClick={() => setThema(dunkel ? 'hell' : 'dunkel')}
          aria-label={dunkel ? 'Helles Design' : 'Dunkles Design'}
          className="ml-auto md:ml-2 md:order-last w-9 h-9 flex items-center justify-center rounded-lg text-[var(--text-mittel)] hover:bg-[var(--feld)] transition"
        >
          {dunkel ? <SunIcon /> : <MoonIcon />}
        </button>

        <button
          onClick={() => setOpen((value) => !value)}
          aria-label="Menü"
          aria-expanded={open}
          className="md:hidden w-9 h-9 -mr-1 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-[var(--feld)] transition"
        >
          <span className="block w-5 h-[2px] rounded bg-[var(--knopf)]" />
          <span className="block w-5 h-[2px] rounded bg-[var(--knopf)]" />
          <span className="block w-5 h-[2px] rounded bg-[var(--knopf)]" />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--rand)] bg-[var(--karte)] px-3 pb-3 pt-2 flex flex-col gap-1">
          {TABS.map((tab) => (
            <Tab key={tab.to} tab={tab} onPick={() => setOpen(false)} wide />
          ))}
          <button
            onClick={logout}
            className="text-left px-3 py-2.5 text-sm font-medium text-[var(--text-schwach)] hover:text-[var(--text)] transition"
          >
            Abmelden
          </button>
        </div>
      )}
    </header>
  )
}

function Tab({ tab: { to, label, icon: Icon, end }, onPick, wide }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onPick}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-lg font-semibold whitespace-nowrap transition ${
          wide ? 'px-3 py-2.5 text-sm' : 'px-3 py-1.5 text-xs'
        } ${isActive ? 'bg-[var(--knopf)] text-[var(--auf-knopf)]' : 'text-[var(--text-mittel)] hover:bg-[var(--feld)]'}`
      }
    >
      <Icon />
      {label}
    </NavLink>
  )
}

function CapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 9 12 5 2 9l10 4z" />
      <path d="M6 11v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
    </svg>
  )
}

function TimerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5M9 2h6" />
    </svg>
  )
}

function CompareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="7" height="14" rx="1" />
      <rect x="14" y="5" width="7" height="14" rx="1" />
    </svg>
  )
}

function CardsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="7" width="14" height="12" rx="2" />
      <path d="M7 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v0c.3.6.9 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 19a2 2 0 0 1 2-2h13" />
    </svg>
  )
}
