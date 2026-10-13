import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import Nav from '../components/Nav.jsx'
import StudyImage from '../components/StudyImage.jsx'

const BOXES = [
  { box: 1, label: 'Noch nicht gelernt' },
  { box: 2, label: 'Teilweise gelernt' },
  { box: 3, label: 'Gelernt' },
]

const boxLabel = (box) => BOXES.find((item) => item.box === box)?.label

// What a card's new box means for when it comes back.
function wiederText(tage) {
  if (!tage) return 'kommt gleich wieder'
  return tage === 1 ? 'wieder morgen' : `wieder in ${tage} Tagen`
}

export default function Training() {
  const [stapel, setStapel] = useState(1)
  const [stats, setStats] = useState({
    counts: { 1: 0, 2: 0, 3: 0 },
    faellig: 0,
    fehler: 0,
    themen: [],
  })
  const counts = stats.counts
  const [question, setQuestion] = useState(null)
  const [picked, setPicked] = useState(null)
  const [result, setResult] = useState(null)
  const [hintShown, setHintShown] = useState(false)
  const [error, setError] = useState('')

  const loadQuestion = useCallback(async (ziel) => {
    setPicked(null)
    setResult(null)
    setHintShown(false)
    setError('')
    try {
      const [{ question }, neueStats] = await Promise.all([
        api.trainerNext(ziel),
        api.trainerStats(),
      ])
      setQuestion(question)
      setStats(neueStats)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    loadQuestion(stapel)
  }, [stapel, loadQuestion])

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
      setStats(await api.trainerStats())
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--flaeche)]">
      <Nav />

      <main className="max-w-2xl mx-auto px-3 sm:px-6 py-3 sm:py-8">
        <h2 className="hidden sm:block text-sm sm:text-base font-bold text-[var(--text)] mb-2 sm:mb-4">
          Führerschein-Modus
        </h2>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-1.5 sm:mb-3">
          {BOXES.map((item) => (
            <button
              key={item.box}
              onClick={() => setStapel(item.box)}
              className={`px-2.5 py-1.5 sm:px-3 sm:py-3 rounded-xl border text-left transition ${
                stapel === item.box
                  ? 'bg-[var(--knopf)] text-[var(--auf-knopf)] border-[var(--knopf)]'
                  : 'bg-[var(--karte)] text-[var(--text)] border-[var(--rand)] hover:border-[var(--rand-stark)]'
              }`}
            >
              <span className="block text-[15px] sm:text-lg font-bold leading-snug">
                {counts[item.box]}
              </span>
              <span
                className={`block text-[10px] sm:text-[11px] leading-tight ${
                  stapel === item.box ? 'text-[var(--auf-knopf-leise)]' : 'text-[var(--text-schwach)]'
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Two stacks that cut across the boxes: what is due, and what keeps
            going wrong. */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-2 sm:mb-6">
          {[
            { id: 'faellig', label: 'Heute fällig', wert: stats.faellig },
            { id: 'fehler', label: 'Meine Fehler', wert: stats.fehler },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStapel(item.id)}
              disabled={item.wert === 0}
              className={`px-3 py-1.5 rounded-xl border text-left transition disabled:opacity-45 ${
                stapel === item.id
                  ? 'bg-[var(--gruen)] text-[var(--auf-farbe)] border-[var(--gruen)]'
                  : 'bg-[var(--karte)] text-[var(--text)] border-[var(--rand)] hover:border-[var(--rand-stark)]'
              }`}
            >
              <span className="text-[13px] sm:text-sm font-bold">{item.wert}</span>
              <span
                className={`ml-2 text-[11px] ${
                  stapel === item.id ? 'text-[var(--gruen-leise)]' : 'text-[var(--text-schwach)]'
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-[var(--rot)]">{error}</p>}

        {!error && !question && (
          <div className="bg-[var(--karte)] border border-[var(--rand)] rounded-2xl p-6 sm:p-8 text-center">
            <p className="text-sm text-[var(--text-leise)]">
              {stapel === 'faellig'
                ? 'Heute ist nichts fällig. Du kannst trotzdem in einem Kasten weiterüben.'
                : stapel === 'fehler'
                  ? 'Keine Karte, die schon einmal falsch war.'
                  : 'In diesem Stapel ist gerade nichts zu üben.'}
            </p>
          </div>
        )}

        {question && (
          <div className="bg-[var(--karte)] border border-[var(--rand)] rounded-2xl p-3.5 sm:p-6">
            <h3 className="text-[15px] sm:text-sm font-bold text-[var(--text)] mb-3 sm:mb-5">{question.text}</h3>

            <StudyImage src={question.image} />

            {question.hint?.length > 0 && (
              <div className="mb-3 sm:mb-4">
                {hintShown ? (
                  <div className="bg-[var(--feld)]/60 border border-[var(--rand)] rounded-xl px-3 py-2 sm:px-4 sm:py-3">
                    <p className="text-[10px] uppercase tracking-wide text-[var(--text-schwach)] mb-0.5 sm:mb-1">
                      Tipp
                    </p>
                    <ul className="text-[13px] sm:text-xs text-[var(--text-weich)] flex flex-col gap-0.5 sm:gap-1">
                      {question.hint.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setHintShown(true)}
                    className="text-[13px] sm:text-xs text-[var(--text-leise)] border border-[var(--rand)] rounded-lg px-3 py-1.5 hover:border-[var(--rand-stark)]"
                  >
                    Tipp anzeigen
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1.5 sm:gap-2">
              {question.options.map((option) => {
                const isAnswer = result && option === result.correctAnswer
                const isWrongPick = result && option === picked && !result.correct

                let tone = 'bg-[var(--feld)]/50 text-[var(--text)] border-[var(--rand)]'
                if (isAnswer) tone = 'bg-[var(--gruen)] text-[var(--auf-farbe)] border-[var(--gruen)]'
                else if (isWrongPick) tone = 'bg-[var(--rot)] text-[var(--auf-farbe)] border-[var(--rot)]'
                else if (!result) tone += ' hover:border-[var(--rand-stark)]'

                return (
                  <button
                    key={option}
                    onClick={() => answer(option)}
                    disabled={!!result}
                    className={`text-left px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl text-[15px] sm:text-sm border transition ${tone}`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>

            {result && (
              <div className="mt-3 sm:mt-5 flex items-center justify-between gap-3">
                <p className="text-[13px] sm:text-xs text-[var(--text-leise)]">
                  {result.correct ? 'Richtig.' : 'Leider falsch.'}{' '}
                  {result.toBox !== result.fromBox && (
                    <>
                      Verschoben nach{' '}
                      <strong className="text-[var(--text)]">{boxLabel(result.toBox)}</strong>,{' '}
                    </>
                  )}
                  {wiederText(result.wiederIn)}.
                </p>
                <button
                  onClick={() => loadQuestion(stapel)}
                  className="px-5 py-2.5 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-medium hover:bg-[var(--knopf-tief)] transition whitespace-nowrap"
                >
                  Nächste Frage
                </button>
              </div>
            )}
          </div>
        )}
        <Fortschritt stats={stats} />
      </main>
    </div>
  )
}

// Where the gaps are: the topics with the worst ratio come first, which is the
// answer to "what should I study next".
function Fortschritt({ stats }) {
  const [offen, setOffen] = useState(false)

  if (stats.themen.length === 0) return null

  return (
    <div className="mt-3 sm:mt-5 bg-[var(--karte)] border border-[var(--rand)] rounded-2xl p-4">
      <button
        onClick={() => setOffen((value) => !value)}
        className="text-[13px] sm:text-xs font-semibold text-[var(--text-mittel)] hover:text-[var(--text)]"
      >
        {offen ? 'Fortschritt ausblenden' : 'Fortschritt nach Thema'}
      </button>

      {offen && (
        <div className="mt-3 flex flex-col gap-2">
          {stats.themen.map((thema) => {
            const prozent = Math.round(thema.quote * 100)
            return (
              <div key={thema.thema}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] sm:text-xs text-[var(--text-weich)]">{thema.thema}</span>
                  <span className="text-[11px] text-[var(--text-schwach)] whitespace-nowrap">
                    {prozent}% · {thema.richtig + thema.falsch} Antworten
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded bg-[var(--flaeche)] overflow-hidden">
                  <div
                    className={`h-full rounded ${
                      prozent >= 80
                        ? 'bg-[var(--gruen)]'
                        : prozent >= 50
                          ? 'bg-[var(--mittel)]'
                          : 'bg-[var(--rot)]'
                    }`}
                    style={{ width: `${Math.max(prozent, 3)}%` }}
                  />
                </div>
              </div>
            )
          })}
          <p className="text-[11px] text-[var(--text-schwach)] mt-1">
            Schwächste Themen zuerst, ab drei Antworten.
          </p>
        </div>
      )}
    </div>
  )
}
