import { useState } from 'react'

// Shared power-up logic for the multiple-choice quizzes. Each quiz is a list
// of { options, answer } where `answer` is the index of the correct option.
//
// The consumable power-ups are repurposed as quiz aids (no timed challenges
// or extra-clue content exist in these cases):
//   - Hint Token       -> cross out 1 wrong option on the open question
//   - Evidence Magnifier -> cross out 2 wrong options (stronger hint)
//   - Time Extender    -> cross out 1 wrong option (a second hint-style aid)
//   - Second Chance    -> forgive the next wrong answer
//
// The hook owns the *effect* state; the actual token spend (and the guard
// that the player owns one) lives in PowerUpBar via POST /api/shop/use.

const EMPTY = []

// `quiz` is the multiple-choice question list (for elimination effects). It
// defaults to empty so a decision-only scene (binary choices, where crossing
// out an option would just reveal the answer) can use the same instance for
// Second Chance alone.
export function useQuizPowerUps(quiz = EMPTY) {
  // questionIndex -> array of wrong option indices already crossed out.
  const [eliminated, setEliminated] = useState({})
  const [secondChanceArmed, setSecondChanceArmed] = useState(false)

  function reset() {
    setEliminated({})
    setSecondChanceArmed(false)
  }

  // Cross out up to `count` not-yet-eliminated wrong options on a question.
  function eliminateWrong(questionIndex, count) {
    const question = quiz[questionIndex]
    const already = eliminated[questionIndex] || EMPTY
    const pool = question.options
      .map((_, index) => index)
      .filter((index) => index !== question.answer && !already.includes(index))
    if (pool.length === 0) return
    const picked = []
    for (let k = 0; k < count && pool.length > 0; k += 1) {
      picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
    }
    setEliminated((current) => ({
      ...current,
      [questionIndex]: [...(current[questionIndex] || EMPTY), ...picked],
    }))
  }

  function armSecondChance() {
    setSecondChanceArmed(true)
  }

  // Call from the quiz's answer handler. Returns true once when a wrong
  // answer should be forgiven, consuming the armed Second Chance.
  function consumeForgiveOnWrong() {
    if (!secondChanceArmed) return false
    setSecondChanceArmed(false)
    return true
  }

  const eliminatedFor = (questionIndex) => eliminated[questionIndex] || EMPTY

  // The effect handlers PowerUpBar should expose for the open question. A
  // handler is omitted when it couldn't do anything (question answered, or no
  // wrong options left to remove) so a token is never spent on a no-op.
  function effectsFor(questionIndex, answered) {
    const question = quiz[questionIndex]
    const already = eliminated[questionIndex] || EMPTY
    const remainingWrong = question.options.filter(
      (_, index) => index !== question.answer && !already.includes(index),
    ).length
    const canEliminate = !answered && remainingWrong >= 1
    return {
      ...(canEliminate ? { hint: () => eliminateWrong(questionIndex, 1) } : {}),
      ...(canEliminate
        ? { magnifier: () => eliminateWrong(questionIndex, 2) }
        : {}),
      ...(canEliminate ? { time: () => eliminateWrong(questionIndex, 1) } : {}),
      ...(!answered && !secondChanceArmed ? { second: armSecondChance } : {}),
    }
  }

  // For binary decision points: offer only Second Chance (elimination would
  // just reveal the answer when there are two choices). `active` is whether
  // the current scene has a forgivable decision open.
  function secondChanceEffects(active) {
    return active && !secondChanceArmed ? { second: armSecondChance } : {}
  }

  return {
    reset,
    eliminatedFor,
    effectsFor,
    secondChanceEffects,
    armSecondChance,
    consumeForgiveOnWrong,
    secondChanceArmed,
    armed: { second: secondChanceArmed },
  }
}
