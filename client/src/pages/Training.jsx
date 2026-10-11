import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import Nav from '../components/Nav.jsx'
import StudyImage from '../components/StudyImage.jsx'

const BOXES = [
  { box: 1, label: 'Noch nicht gelernt' },
  { box: 2, label: 'Teilweise gelernt' },
  { box: 3, label: 'Gelernt' },
]

export default function Training() {
  const [box, setBox] = useState(1)
  const [counts, setCounts] = useState({ 1: 0, 2: 0, 3: 0 })
  const [question, setQuestion] = useState(null)
  const [picked, setPicked] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const loadQuestion = useCallback(async (targetBox) => {
    setPicked(null)
    setResult(null)
    setError('')
    try {
      const [{ question }, { counts }] = await Promise.all([
        api.trainerNext(targetBox),
        api.trainerStats(),
      ])
      setQuestion(question)
      setCounts(counts)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    loadQuestion(box)
  }, [box, loadQuestion])

  async function answer(option) {
    if (result) return
    setPicked(option)
    try {
      const data = await api.trainerAnswer({
        itemKey: question.itemKey,
        kind: question.kind,
        answer: option,
      })
      setResult(data)
      setCounts((await api.trainerStats()).counts)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#f2eee9]">
      <Nav />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-base font-bold text-[#24211a] mb-4">Führerschein-Modus</h2>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {BOXES.map((item) => (
            <button
              key={item.box}
              onClick={() => setBox(item.box)}
              className={`px-3 py-3 rounded-xl border text-left transition ${
                box === item.box
                  ? 'bg-[#3d372c] text-[#f2eee9] border-[#3d372c]'
                  : 'bg-white text-[#24211a] border-[#e8e2d5] hover:border-[#b8ab97]'
              }`}
            >
              <span className="block text-lg font-bold">{counts[item.box]}</span>
              <span
                className={`block text-[11px] leading-tight ${
                  box === item.box ? 'text-[#d9cfbe]' : 'text-[#948773]'
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {!error && !question && (
          <div className="bg-white border border-[#e8e2d5] rounded-2xl p-8 text-center">
            <p className="text-sm text-[#736856]">
              In diesem Stapel ist gerade nichts zu üben.
            </p>
          </div>
        )}

        {question && (
          <div className="bg-white border border-[#e8e2d5] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-[#24211a] mb-5">{question.text}</h3>

            <StudyImage src={question.image} />

            <div className="flex flex-col gap-2">
              {question.options.map((option) => {
                const isAnswer = result && option === result.correctAnswer
                const isWrongPick = result && option === picked && !result.correct

                let tone = 'bg-[#f5f2eb]/50 text-[#24211a] border-[#e8e2d5]'
                if (isAnswer) tone = 'bg-emerald-700 text-white border-emerald-700'
                else if (isWrongPick) tone = 'bg-[#8c4b3f] text-white border-[#8c4b3f]'
                else if (!result) tone += ' hover:border-[#b8ab97]'

                return (
                  <button
                    key={option}
                    onClick={() => answer(option)}
                    disabled={!!result}
                    className={`text-left px-4 py-3 rounded-xl text-sm border transition ${tone}`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>

            {result && (
              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="text-xs text-[#736856]">
                  {result.correct ? 'Richtig.' : 'Leider falsch.'}{' '}
                  {result.toBox !== result.fromBox && (
                    <>
                      Verschoben nach{' '}
                      <strong className="text-[#24211a]">
                        {BOXES.find((b) => b.box === result.toBox).label}
                      </strong>
                      .
                    </>
                  )}
                </p>
                <button
                  onClick={() => loadQuestion(box)}
                  className="px-5 py-2.5 rounded-xl bg-[#3d372c] text-[#f2eee9] text-sm font-medium hover:bg-[#24211a] transition whitespace-nowrap"
                >
                  Nächste Frage
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
