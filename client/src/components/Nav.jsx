import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

const TABS = [
  { to: '/training', label: 'Training', icon: CapIcon },
  { to: '/vergleich', label: 'Vergleich', icon: CompareIcon },
  { to: '/schreiben', label: 'Schreiben', icon: PenIcon },
  { to: '/karteikarten', label: 'Karteikarten', icon: CardsIcon },
  { to: '/simulation', label: 'Simulation', icon: TimerIcon },
  { to: '/probeklausur', label: 'Probeklausur', icon: ExamIcon },
  { to: '/theorie', label: 'Theorie', icon: BookIcon },
]

export default function Nav() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-[#fdfaf4] border-b border-[#d9ccb6] sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-2 sm:gap-3">
        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#3d372c] text-[#e9e0d2] flex items-center justify-center font-bold text-[11px] sm:text-xs">
          L
        </span>
        <span className="font-bold text-[15px] sm:text-base text-[#24211a]">Lernify</span>
        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#f1e9dc] border border-[#d9ccb6] text-[11px] font-medium text-[#595042]">
          {user.name}
        </span>

        {/* Wide screens show the sections as tabs, the phone keeps one button. */}
        <nav className="hidden md:flex items-center gap-1 ml-auto">
          {TABS.map((tab) => (
            <Tab key={tab.to} tab={tab} />
          ))}
          <button
            onClick={logout}
            className="ml-2 text-xs font-medium text-[#948773] hover:text-[#24211a] transition"
          >
            Abmelden
          </button>
        </nav>

        <button
          onClick={() => setOpen((value) => !value)}
          aria-label="Menü"
          aria-expanded={open}
          className="md:hidden ml-auto w-9 h-9 -mr-1 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-[#f1e9dc] transition"
        >
          <span className="block w-5 h-[2px] rounded bg-[#3d372c]" />
          <span className="block w-5 h-[2px] rounded bg-[#3d372c]" />
          <span className="block w-5 h-[2px] rounded bg-[#3d372c]" />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#d9ccb6] bg-[#fdfaf4] px-3 pb-3 pt-2 flex flex-col gap-1">
          {TABS.map((tab) => (
            <Tab key={tab.to} tab={tab} onPick={() => setOpen(false)} wide />
          ))}
          <button
            onClick={logout}
            className="text-left px-3 py-2.5 text-sm font-medium text-[#948773] hover:text-[#24211a] transition"
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
        } ${isActive ? 'bg-[#3d372c] text-[#e9e0d2]' : 'text-[#595042] hover:bg-[#f1e9dc]'}`
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

function PenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
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

function ExamIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
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
