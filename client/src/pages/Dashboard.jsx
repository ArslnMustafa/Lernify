import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth/AuthContext.jsx'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [exams, setExams] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .listExams()
      .then((data) => setExams(data.exams))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#f2eee9]">
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-10 border-b border-[#e8e2d5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#3d372c] text-[#f2eee9] flex items-center justify-center font-bold text-sm">
              L
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#24211a]">Lernify</h1>
              <p className="text-[11px] text-[#736856]">Hallo, {user.name}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-xs font-medium text-[#736856] hover:text-[#24211a] transition"
          >
            Abmelden
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-base font-bold text-[#24211a] mb-4">Meine Prüfungen</h2>

        {loading && <p className="text-sm text-[#736856]">Wird geladen...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && exams.length === 0 && (
          <p className="text-sm text-[#736856]">Dir wurde noch keine Prüfung zugewiesen.</p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {exams.map((exam) => (
            <Link
              key={exam.id}
              to={`/exams/${exam.id}`}
              className="bg-white border border-[#e8e2d5] rounded-2xl p-5 hover:shadow-sm transition"
            >
              <h3 className="text-sm font-bold text-[#24211a] mb-1">{exam.title}</h3>
              {exam.description && (
                <p className="text-xs text-[#736856] mb-3">{exam.description}</p>
              )}
              <div className="flex items-center justify-between text-[11px] text-[#948773]">
                <span>{exam.question_count} Fragen</span>
                {exam.best_score !== null && (
                  <span>Bestes Ergebnis: {exam.best_score}/{exam.question_count}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
