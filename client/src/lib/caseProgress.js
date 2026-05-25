const STORAGE_KEY = 'ss_case_progress'

const INITIAL_PROGRESS = {
  completed: {},
  badges: [],
}

function readProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...INITIAL_PROGRESS, ...JSON.parse(raw) } : INITIAL_PROGRESS
  } catch {
    return INITIAL_PROGRESS
  }
}

function writeProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  return progress
}

function caseKey(caseId, difficulty) {
  return `case-${caseId}-${difficulty}`
}

export function getCaseProgress() {
  return readProgress()
}

export function isCaseModeComplete(caseId, difficulty) {
  return Boolean(readProgress().completed[caseKey(caseId, difficulty)])
}

export function isCaseComplete(caseId) {
  return (
    isCaseModeComplete(caseId, 'rookie') ||
    isCaseModeComplete(caseId, 'veteran')
  )
}

export function isCaseUnlocked(caseId) {
  if (caseId === 1) return true
  return isCaseComplete(caseId - 1)
}

export function completeCaseMode(caseId, difficulty, badge) {
  const progress = readProgress()
  const nextBadges = new Set(progress.badges)
  if (badge) nextBadges.add(badge)

  return writeProgress({
    ...progress,
    completed: {
      ...progress.completed,
      [caseKey(caseId, difficulty)]: true,
    },
    badges: Array.from(nextBadges),
  })
}
