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
    <div className="min-h-screen bg-[#e9e0d2]">
      <Nav />

      <main className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <h2 className="text-sm sm:text-base font-bold text-[#24211a] mb-3 sm:mb-4">Probeklausur</h2>

        {loading && <p className="text-sm text-[#736856]">Wird geladen...</p>}
        {error && <p className="text-sm text-[#8c4b3f]">{error}</p>}
        {!loading && exams.length === 0 && (
          <p className="text-sm text-[#736856]">Dir wurde noch keine Prüfung zugewiesen.</p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {exams.map((exam) => (
            <Link
              key={exam.id}
              to={`/exams/${exam.id}`}
              className="bg-[#fdfaf4] border border-[#d9ccb6] rounded-2xl p-5 hover:shadow-sm transition"
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
