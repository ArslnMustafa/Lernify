import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Nav from '../components/Nav.jsx'

export default function Dashboard() {
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
    <div className="min-h-screen bg-[var(--flaeche)]">
      <Nav />

      <main className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <h2 className="text-sm sm:text-base font-bold text-[var(--text)] mb-3 sm:mb-4">Probeklausur</h2>

        {loading && <p className="text-sm text-[var(--text-leise)]">Wird geladen...</p>}
        {error && <p className="text-sm text-[var(--rot)]">{error}</p>}
        {!loading && exams.length === 0 && (
          <p className="text-sm text-[var(--text-leise)]">Dir wurde noch keine Prüfung zugewiesen.</p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {exams.map((exam) => (
            <Link
              key={exam.id}
              to={`/exams/${exam.id}`}
              className="bg-[var(--karte)] border border-[var(--rand)] rounded-2xl p-5 hover:shadow-sm transition"
            >
              <h3 className="text-sm font-bold text-[var(--text)] mb-1">{exam.title}</h3>
              {exam.description && (
                <p className="text-xs text-[var(--text-leise)] mb-3">{exam.description}</p>
              )}
              <div className="flex items-center justify-between text-[11px] text-[var(--text-schwach)]">
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
