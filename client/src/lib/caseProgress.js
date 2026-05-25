const STORAGE_KEY = 'ss_case_progress'

const INITIAL_PROGRESS = {
  completed: {},
  badges: [],
  points: 0,
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

export function completeCaseMode(caseId, difficulty, badge, pointsAwarded = 0) {
  const progress = readProgress()
  const nextBadges = new Set(progress.badges)
  const badgeName = typeof badge === 'string' ? badge : badge?.name
  if (badgeName) nextBadges.add(badgeName)
  const alreadyComplete = Boolean(progress.completed[caseKey(caseId, difficulty)])

  return writeProgress({
    ...progress,
    completed: {
      ...progress.completed,
      [caseKey(caseId, difficulty)]: true,
    },
    badges: Array.from(nextBadges),
    points: progress.points + (alreadyComplete ? 0 : pointsAwarded),
  })
}
