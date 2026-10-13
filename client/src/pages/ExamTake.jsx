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
  const [checks, setChecks] = useState({})
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

  // A choice is final: it is answered, shown as right or wrong, and stays that way.
  async function chooseOption(index) {
    if (checks[current]) return
    selectAnswer(index)
    try {
      const data = await api.pruefeAntwort(id, questions[current].id, index)
      setChecks((prev) => ({ ...prev, [current]: data }))
    } catch (err) {
      setError(err.message)
    }
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
      <div className="min-h-screen bg-[var(--flaeche)] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[var(--karte)] border border-[var(--rand)] rounded-2xl p-8 text-center">
          <h1 className="text-sm font-bold text-[var(--text-leise)] mb-2">{exam.title}</h1>
          <p className="text-4xl font-bold text-[var(--text)] mb-1">
            {result.score}/{result.total}
          </p>
          <p className="text-xs text-[var(--text-schwach)] mb-6">
            {Math.round((result.score / result.total) * 100)}% richtig
          </p>
          <Link
            to="/probeklausur"
            className="inline-block w-full py-2.5 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-medium hover:bg-[var(--knopf-tief)] transition"
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
    <div className="min-h-screen bg-[var(--flaeche)] px-3 sm:px-6 py-4 sm:py-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link to="/probeklausur" className="text-xs text-[var(--text-leise)] hover:text-[var(--text)]">
            ← Übersicht
          </Link>
          <span className="text-xs text-[var(--text-schwach)]">
            Frage {current + 1} / {questions.length}
          </span>
        </div>

        <div className="bg-[var(--karte)] border border-[var(--rand)] rounded-2xl p-4 sm:p-6">
          <h2 className="text-[15px] sm:text-sm font-bold text-[var(--text)] mb-3 sm:mb-5">{question.text}</h2>

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
              {question.options.map((option, i) => {
                const geprueft = checks[current]
                const istLoesung = geprueft && i === geprueft.correctIndex
                const falschGewaehlt = geprueft && i === answers[current] && !geprueft.correct

                let tone = 'bg-[var(--feld)]/50 text-[var(--text)] border-[var(--rand)]'
                if (istLoesung) tone = 'bg-[var(--gruen)] text-[var(--auf-farbe)] border-[var(--gruen)]'
                else if (falschGewaehlt) tone = 'bg-[var(--rot)] text-[var(--auf-farbe)] border-[var(--rot)]'
                else if (!geprueft && answers[current] === i)
                  tone = 'bg-[var(--knopf)] text-[var(--auf-knopf)] border-[var(--knopf)]'
                else if (!geprueft) tone += ' hover:border-[var(--rand-stark)]'

                return (
                  <button
                    key={i}
                    onClick={() => chooseOption(i)}
                    disabled={!!geprueft}
                    className={`text-left px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl text-[15px] sm:text-sm border transition ${tone}`}
                  >
                    {option}
                  </button>
                )
              })}

              {checks[current] && (
                <p className="text-[13px] sm:text-xs text-[var(--text-leise)] mt-1">
                  {checks[current].correct
                    ? 'Richtig.'
                    : `Leider falsch — richtig ist: ${question.options[checks[current].correctIndex]}`}
                </p>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-[var(--rot)] mt-3">{error}</p>}

        <div className="flex justify-between mt-5">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-leise)] disabled:opacity-40"
          >
            Vorherige
          </button>

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="px-5 py-2.5 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-medium hover:bg-[var(--knopf-tief)] transition disabled:opacity-40"
            >
              {submitting ? 'Wird gesendet...' : 'Prüfung beenden'}
            </button>
          ) : (
            <button
              onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
              disabled={answers[current] === null}
              className="px-5 py-2.5 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-medium hover:bg-[var(--knopf-tief)] transition disabled:opacity-40"
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
        className="w-full p-3.5 bg-[var(--feld)]/50 border border-[var(--rand)] rounded-xl text-sm outline-none text-[var(--text)] focus:ring-1 focus:ring-[var(--knopf)] transition resize-none"
      />

      {!revealed ? (
        <button
          onClick={onReveal}
          className="self-start px-4 py-2 rounded-xl bg-[var(--feld)] border border-[var(--rand)] text-xs font-medium text-[var(--text-mittel)] hover:border-[var(--rand-stark)] transition"
        >
          Musterlösung anzeigen
        </button>
      ) : (
        <>
          <div className="p-4 bg-[var(--feld)] border border-[var(--rand)] rounded-xl">
            <p className="text-[11px] font-semibold text-[var(--text-schwach)] uppercase tracking-wider mb-2">
              Musterlösung
            </p>
            {/* Seeded course material, authored in the reference catalogue with inline <i>/<b> markup. */}
            <div
              className="text-sm text-[var(--knopf)] leading-relaxed [&_b]:font-semibold [&_i]:italic"
              dangerouslySetInnerHTML={{ __html: question.answer_text }}
            />
          </div>

          <div>
            <p className="text-xs text-[var(--text-leise)] mb-2">Bewerte dich selbst:</p>
            <div className="flex gap-2">
              <button
                onClick={() => onSelfRate(true)}
                className={`px-4 py-2 rounded-xl text-sm border transition ${
                  selfRating === true
                    ? 'bg-[var(--gruen)] text-[var(--auf-farbe)] border-[var(--gruen)]'
                    : 'bg-[var(--feld)]/50 text-[var(--text)] border-[var(--rand)] hover:border-[var(--rand-stark)]'
                }`}
              >
                Gewusst
              </button>
              <button
                onClick={() => onSelfRate(false)}
                className={`px-4 py-2 rounded-xl text-sm border transition ${
                  selfRating === false
                    ? 'bg-[var(--rot)] text-[var(--auf-farbe)] border-[var(--rot)]'
                    : 'bg-[var(--feld)]/50 text-[var(--text)] border-[var(--rand)] hover:border-[var(--rand-stark)]'
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--flaeche)] text-sm text-[var(--text-leise)]">
      {children}
    </div>
  )
}
