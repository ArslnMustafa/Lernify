import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

const TABS = [
  { to: '/training', label: 'Training', icon: CapIcon },
  { to: '/karteikarten', label: 'Karteikarten', icon: CardsIcon },
  { to: '/vergleich', label: 'Vergleich', icon: CompareIcon },
  { to: '/', label: 'Probeklausur', icon: ExamIcon, end: true },
  { to: '/theorie', label: 'Theorie', icon: BookIcon },
]

export default function Nav() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-[#fdfaf4] border-b border-[#d9ccb6] sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2 sm:py-3 flex flex-col md:flex-row md:items-center gap-1.5 md:gap-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#3d372c] text-[#e9e0d2] flex items-center justify-center font-bold text-[10px] sm:text-xs">
            L
          </span>
          <span className="font-bold text-sm sm:text-base text-[#24211a]">Lernify</span>
          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#f1e9dc] border border-[#d9ccb6] text-[10px] sm:text-[11px] font-medium text-[#595042]">
            {user.name}
          </span>

          {/* On the phone the sign-out sits in the first row, so the tabs get one of their own. */}
          <button
            onClick={logout}
            className="md:hidden ml-auto text-[11px] font-medium text-[#948773] hover:text-[#24211a] transition"
          >
            Abmelden
          </button>
        </div>

        <nav className="flex items-center gap-0.5 sm:gap-1 md:ml-auto">
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-1 md:flex-none flex items-center justify-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-[#3d372c] text-[#e9e0d2]'
                    : 'text-[#595042] hover:bg-[#f1e9dc]'
                }`
              }
            >
              <span className="hidden md:inline">
                <Icon />
              </span>
              {label}
            </NavLink>
          ))}

          <button
            onClick={logout}
            className="hidden md:inline ml-2 text-xs font-medium text-[#948773] hover:text-[#24211a] transition"
          >
            Abmelden
          </button>
        </nav>
      </div>
    </header>
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
