import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import StudyImage from '../components/StudyImage.jsx'

export default function ExamTake() {
  const { id } = useParams()
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [current, setCurrent] = useState(0)
  const [revealed, setRevealed] = useState({})
  const [drafts, setDrafts] = useState({})
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api
      .getExam(id)
      .then((data) => {
        setExam(data.exam)
        setQuestions(data.questions)
        setAnswers(new Array(data.questions.length).fill(null))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  function selectAnswer(value) {
    setAnswers((prev) => prev.map((a, i) => (i === current ? value : a)))
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    try {
      const data = await api.submitExam(id, answers)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Centered>Wird geladen...</Centered>
  }

  if (error && !exam) {
    return <Centered>{error}</Centered>
  }

  if (result) {
    return (
      <div className="min-h-screen bg-[#e9e0d2] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[#fdfaf4] border border-[#d9ccb6] rounded-2xl p-8 text-center">
          <h1 className="text-sm font-bold text-[#736856] mb-2">{exam.title}</h1>
          <p className="text-4xl font-bold text-[#24211a] mb-1">
            {result.score}/{result.total}
          </p>
          <p className="text-xs text-[#948773] mb-6">
            {Math.round((result.score / result.total) * 100)}% richtig
          </p>
          <Link
            to="/"
            className="inline-block w-full py-2.5 rounded-xl bg-[#3d372c] text-[#e9e0d2] text-sm font-medium hover:bg-[#24211a] transition"
          >
            Zurück zu meinen Prüfungen
          </Link>
        </div>
      </div>
    )
  }

  const question = questions[current]
  const isLast = current === questions.length - 1
  const allAnswered = answers.every((a) => a !== null)

  return (
    <div className="min-h-screen bg-[#e9e0d2] px-3 sm:px-6 py-4 sm:py-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="text-xs text-[#736856] hover:text-[#24211a]">
            ← Übersicht
          </Link>
          <span className="text-xs text-[#948773]">
            Frage {current + 1} / {questions.length}
          </span>
        </div>

        <div className="bg-[#fdfaf4] border border-[#d9ccb6] rounded-2xl p-4 sm:p-6">
          <h2 className="text-sm font-bold text-[#24211a] mb-3 sm:mb-5">{question.text}</h2>

          <StudyImage src={question.image_url} />

          {question.type === 'open' ? (
            <OpenQuestion
              question={question}
              draft={drafts[current] || ''}
              onDraftChange={(value) =>
                setDrafts((prev) => ({ ...prev, [current]: value }))
              }
              revealed={!!revealed[current]}
              onReveal={() => setRevealed((prev) => ({ ...prev, [current]: true }))}
              selfRating={answers[current]}
              onSelfRate={selectAnswer}
            />
          ) : (
            <div className="flex flex-col gap-1.5 sm:gap-2">
              {question.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  className={`text-left px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl text-[13px] sm:text-sm border transition ${
                    answers[current] === i
                      ? 'bg-[#3d372c] text-[#e9e0d2] border-[#3d372c]'
                      : 'bg-[#f1e9dc]/50 text-[#24211a] border-[#d9ccb6] hover:border-[#b8ab97]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-[#8c4b3f] mt-3">{error}</p>}

        <div className="flex justify-between mt-5">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[#736856] disabled:opacity-40"
          >
            Vorherige
          </button>

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="px-5 py-2.5 rounded-xl bg-[#3d372c] text-[#e9e0d2] text-sm font-medium hover:bg-[#24211a] transition disabled:opacity-40"
            >
              {submitting ? 'Wird gesendet...' : 'Prüfung beenden'}
            </button>
          ) : (
            <button
              onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
              disabled={answers[current] === null}
              className="px-5 py-2.5 rounded-xl bg-[#3d372c] text-[#e9e0d2] text-sm font-medium hover:bg-[#24211a] transition disabled:opacity-40"
            >
              Weiter
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function OpenQuestion({
  question,
  draft,
  onDraftChange,
  revealed,
  onReveal,
  selfRating,
  onSelfRate,
}) {
  return (
    <div className="flex flex-col gap-4">
      <textarea
        rows={4}
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        placeholder="Schreib deine Antwort hier..."
        className="w-full p-3.5 bg-[#f1e9dc]/50 border border-[#d9ccb6] rounded-xl text-sm outline-none text-[#24211a] focus:ring-1 focus:ring-[#3d372c] transition resize-none"
      />

      {!revealed ? (
        <button
          onClick={onReveal}
          className="self-start px-4 py-2 rounded-xl bg-[#f1e9dc] border border-[#d9ccb6] text-xs font-medium text-[#595042] hover:border-[#b8ab97] transition"
        >
          Musterlösung anzeigen
        </button>
      ) : (
        <>
          <div className="p-4 bg-[#f1e9dc] border border-[#d9ccb6] rounded-xl">
            <p className="text-[11px] font-semibold text-[#948773] uppercase tracking-wider mb-2">
              Musterlösung
            </p>
            {/* Seeded course material, authored in the reference catalogue with inline <i>/<b> markup. */}
            <div
              className="text-sm text-[#3d372c] leading-relaxed [&_b]:font-semibold [&_i]:italic"
              dangerouslySetInnerHTML={{ __html: question.answer_text }}
            />
          </div>

          <div>
            <p className="text-xs text-[#736856] mb-2">Bewerte dich selbst:</p>
            <div className="flex gap-2">
              <button
                onClick={() => onSelfRate(true)}
                className={`px-4 py-2 rounded-xl text-sm border transition ${
                  selfRating === true
                    ? 'bg-[#6b7250] text-[#f7f4ef] border-[#6b7250]'
                    : 'bg-[#f1e9dc]/50 text-[#24211a] border-[#d9ccb6] hover:border-[#b8ab97]'
                }`}
              >
                Gewusst
              </button>
              <button
                onClick={() => onSelfRate(false)}
                className={`px-4 py-2 rounded-xl text-sm border transition ${
                  selfRating === false
                    ? 'bg-[#8c4b3f] text-[#f7f4ef] border-[#8c4b3f]'
                    : 'bg-[#f1e9dc]/50 text-[#24211a] border-[#d9ccb6] hover:border-[#b8ab97]'
                }`}
              >
                Nicht gewusst
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Centered({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e9e0d2] text-sm text-[#736856]">
      {children}
    </div>
  )
}
