import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'

// Adaptive MCQ quiz: 5 questions, server tracks streak + difficulty.
// 4/5 correct earns +1 life.
//
// UI state machine:
//   loading      -> first /next call in flight
//   question     -> showing a question, awaiting an answer
//   feedback     -> showing the correct answer (and the player's miss)
//   completing   -> /complete in flight after the 5th answer
//   summary      -> final score + life-award screen
export default function Quiz() {
  const { token, refreshUser, setUser } = useAuth()

  const [question, setQuestion] = useState(null)
  const [level, setLevel] = useState('easy')
  const [progress, setProgress] = useState({ answered: 0, correct: 0, total: 5 })

  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null) // { correct, correctIndex }
  const [finishedSession, setFinishedSession] = useState(false)
  const [summary, setSummary] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Load the first question on mount, and any time the player starts a
  // fresh session via "Play again".
  async function loadNext() {
    setError('')
    setSelected(null)
    setResult(null)
    setQuestion(null)
    try {
      const data = await api.quizNext(token)
      setQuestion(data.question)
      setLevel(data.level)
      setProgress(data.progress)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadNext()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Submit an answer, then show feedback.
  async function submitAnswer(idx) {
    if (selected !== null || submitting) return
    setSelected(idx)
    setSubmitting(true)
    try {
      const data = await api.quizAnswer(token, idx)
      setResult({ correct: data.correct, correctIndex: data.correctIndex })
      setLevel(data.nextLevel)
      setProgress(data.progress)
      if (!data.correct && Number.isInteger(data.livesRemaining)) {
        setUser((current) =>
          current
            ? {
                ...current,
                livesRemaining: data.livesRemaining,
                lastLifeRegen: data.lastLifeRegen,
              }
            : current,
        )
      }
      if (data.finished) setFinishedSession(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Once the 5th answer is submitted, finalise the session.
  useEffect(() => {
    if (!finishedSession || summary || error) return
    let cancelled = false
    api
      .quizComplete(token)
      .then((data) => {
        if (cancelled) return
        setSummary(data)
        // Refresh the user so TopNav reflects any awarded life.
        refreshUser()
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishedSession])

  function restart() {
    setSummary(null)
    setFinishedSession(false)
    setProgress({ answered: 0, correct: 0, total: 5 })
    loadNext()
  }

  // --- render --------------------------------------------------------

  if (error) {
    return (
      <div className="max-w-xl mx-auto ss-card p-8 text-center flex flex-col gap-3">
        <p className="text-sw-red">{error}</p>
        <Link to="/home" className="ss-btn ss-btn-cyan self-center">
          Back to Home
        </Link>
      </div>
    )
  }

  if (summary) {
    return (
      <div className="max-w-xl mx-auto ss-card p-10 text-center flex flex-col gap-4">
        <h2 className="font-pixel text-sw-cyan text-glow text-base">
          QUIZ COMPLETE
        </h2>
        <p className="text-sw-text2 text-3xl">
          {summary.correctCount} / {summary.total}
        </p>
        {summary.awardedLife ? (
          <p className="text-sw-green">
            +1 LIFE awarded — you now have {summary.newLives}.
          </p>
        ) : (
          <p className="text-sw-text3">
            Score 4 out of 5 next time to earn a life.
          </p>
        )}
        <div className="flex gap-3 justify-center mt-3">
          <Link to="/home" className="ss-btn ss-btn-cyan">
            Home
          </Link>
          <button onClick={restart} className="ss-btn ss-btn-pink">
            Play again
          </button>
        </div>
      </div>
    )
  }

  if (!question) {
    return <p className="text-sw-text3 text-center">Loading…</p>
  }

  // Display the question number relative to whether the answer has been
  // submitted (then progress.answered already counts this one).
  const questionNumber = result ? progress.answered : progress.answered + 1

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <div className="flex justify-between items-center text-sw-text3">
        <span>
          Question {questionNumber} / {progress.total}
        </span>
        <span className="text-sw-cyan uppercase">{level}</span>
        <span className="text-sw-yellow">{progress.correct} correct</span>
      </div>

      <div className="ss-card p-6">
        <p className="text-sw-text text-xl mb-5">{question.text}</p>
        <div className="flex flex-col gap-3">
          {question.options.map((opt, i) => {
            // Default to a translucent card; switch ring colour after a
            // result so the right answer is green and a wrong pick red.
            let ring = ''
            if (result) {
              if (i === result.correctIndex) ring = 'ring-2 ring-sw-green'
              else if (i === selected && !result.correct)
                ring = 'ring-2 ring-sw-red'
            } else if (selected === i) ring = 'ring-2 ring-sw-cyan'
            return (
              <button
                key={i}
                type="button"
                disabled={selected !== null || submitting}
                onClick={() => submitAnswer(i)}
                className={`ss-card p-3 text-left transition-colors ${
                  selected === null ? 'hover:border-sw-cyan cursor-pointer' : ''
                } ${ring}`}
              >
                <span className="text-sw-cyan mr-3 font-pixel text-xs">
                  {String.fromCharCode(65 + i)}.
                </span>
                <span className="text-sw-text">{opt}</span>
              </button>
            )
          })}
        </div>
      </div>

      {result && !finishedSession && (
        <button onClick={loadNext} className="ss-btn ss-btn-cyan self-center">
          Next question →
        </button>
      )}
      {finishedSession && !summary && (
        <p className="text-sw-text3 text-center">Tallying your score…</p>
      )}
    </div>
  )
}
