import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'

export default function ExamTake() {
  const { id } = useParams()
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [current, setCurrent] = useState(0)
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

  function selectAnswer(index) {
    setAnswers((prev) => prev.map((a, i) => (i === current ? index : a)))
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
    return <Centered>Yükleniyor...</Centered>
  }

  if (error && !exam) {
    return <Centered>{error}</Centered>
  }

  if (result) {
    return (
      <div className="min-h-screen bg-[#f2eee9] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-[#e8e2d5] rounded-2xl p-8 text-center">
          <h1 className="text-sm font-bold text-[#736856] mb-2">{exam.title}</h1>
          <p className="text-4xl font-bold text-[#24211a] mb-1">
            {result.score}/{result.total}
          </p>
          <p className="text-xs text-[#948773] mb-6">
            {Math.round((result.score / result.total) * 100)}% doğru
          </p>
          <Link
            to="/"
            className="inline-block w-full py-2.5 rounded-xl bg-[#3d372c] text-[#f2eee9] text-sm font-medium hover:bg-[#24211a] transition"
          >
            Sınavlarıma dön
          </Link>
        </div>
      </div>
    )
  }

  const question = questions[current]
  const isLast = current === questions.length - 1
  const allAnswered = answers.every((a) => a !== null)

  return (
    <div className="min-h-screen bg-[#f2eee9] px-4 py-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="text-xs text-[#736856] hover:text-[#24211a]">
            ← Geri
          </Link>
          <span className="text-xs text-[#948773]">
            Soru {current + 1} / {questions.length}
          </span>
        </div>

        <div className="bg-white border border-[#e8e2d5] rounded-2xl p-6">
          <h2 className="text-sm font-bold text-[#24211a] mb-5">{question.text}</h2>

          {question.image_url && (
            <img
              src={question.image_url}
              alt=""
              className="w-full rounded-xl mb-5 object-cover max-h-64"
            />
          )}

          <div className="flex flex-col gap-2">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                className={`text-left px-4 py-3 rounded-xl text-sm border transition ${
                  answers[current] === i
                    ? 'bg-[#3d372c] text-[#f2eee9] border-[#3d372c]'
                    : 'bg-[#f5f2eb]/50 text-[#24211a] border-[#e8e2d5] hover:border-[#b8ab97]'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red-600 mt-3">{error}</p>}

        <div className="flex justify-between mt-5">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[#736856] disabled:opacity-40"
          >
            Önceki
          </button>

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="px-5 py-2.5 rounded-xl bg-[#3d372c] text-[#f2eee9] text-sm font-medium hover:bg-[#24211a] transition disabled:opacity-40"
            >
              {submitting ? 'Gönderiliyor...' : 'Sınavı bitir'}
            </button>
          ) : (
            <button
              onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
              disabled={answers[current] === null}
              className="px-5 py-2.5 rounded-xl bg-[#3d372c] text-[#f2eee9] text-sm font-medium hover:bg-[#24211a] transition disabled:opacity-40"
            >
              Sonraki
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Centered({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2eee9] text-sm text-[#736856]">
      {children}
    </div>
  )
}
