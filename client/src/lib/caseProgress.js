const DIFFICULTIES = ['rookie', 'veteran']

function caseModeKey(caseId, difficulty) {
  return `${Number(caseId)}:${difficulty}`
}

function completedSet(user) {
  return new Set(
    (user?.completedCases || []).map((entry) =>
      caseModeKey(entry.caseId, entry.difficulty),
    ),
  )
}

export function getCaseProgress(user) {
  return {
    completedCases: user?.completedCases || [],
    badges: user?.badges || [],
    points: user?.points ?? 0,
  }
}

export function isCaseModeComplete(user, caseId, difficulty) {
  return completedSet(user).has(caseModeKey(caseId, difficulty))
}

export function isCaseComplete(user, caseId) {
  return DIFFICULTIES.every((difficulty) =>
    isCaseModeComplete(user, caseId, difficulty),
  )
}

export function isCaseUnlocked(user, caseId) {
  if (Number(caseId) === 1) return true
  return isCaseComplete(user, Number(caseId) - 1)
}

export function isCaseModeUnlocked(user, caseId, difficulty) {
  if (!isCaseUnlocked(user, caseId)) return false
  if (difficulty === 'rookie') return true
  if (difficulty === 'veteran') return isCaseModeComplete(user, caseId, 'rookie')
  return false
}
