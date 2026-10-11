import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

const TABS = [
  { to: '/training', label: 'Training', icon: CapIcon },
  { to: '/karteikarten', label: 'Karteikarten', icon: CardsIcon },
  { to: '/', label: 'Probeklausur', icon: ExamIcon, end: true },
  { to: '/theorie', label: 'Theorie', icon: BookIcon },
]

export default function Nav() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white border-b border-[#e8e2d5] sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[#3d372c] text-[#f2eee9] flex items-center justify-center font-bold text-xs">
            L
          </span>
          <span className="font-bold text-[#24211a]">Lernify</span>
          <span className="px-2.5 py-1 rounded-full bg-[#f5f2eb] border border-[#e8e2d5] text-[11px] font-medium text-[#595042]">
            {user.name}
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-1 md:ml-auto">
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#3d372c] text-[#f2eee9]'
                    : 'text-[#595042] hover:bg-[#f5f2eb]'
                }`
              }
            >
              <Icon />
              {label}
            </NavLink>
          ))}

          <button
            onClick={logout}
            className="ml-2 text-xs font-medium text-[#948773] hover:text-[#24211a] transition"
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
