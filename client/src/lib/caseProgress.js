const STORAGE_PREFIX = 'ss_case_progress'

const INITIAL_PROGRESS = {
  completed: {},
  badges: [],
  points: 0,
}

function userKey(user) {
  if (!user) return 'anonymous'
  return user._id || user.id || user.username || 'anonymous'
}

function storageKey(user) {
  return `${STORAGE_PREFIX}:${userKey(user)}`
}

function readProgress(user) {
  try {
    const raw = localStorage.getItem(storageKey(user))
    return raw ? { ...INITIAL_PROGRESS, ...JSON.parse(raw) } : { ...INITIAL_PROGRESS }
  } catch {
    return { ...INITIAL_PROGRESS }
  }
}

function writeProgress(user, progress) {
  localStorage.setItem(storageKey(user), JSON.stringify(progress))
  return progress
}

function caseKey(caseId, difficulty) {
  return `case-${caseId}-${difficulty}`
}

function backendCaseComplete(user, caseId, difficulty) {
  return Boolean(
    user?.completedCases?.some(
      (entry) =>
        Number(entry.caseId) === Number(caseId) &&
        entry.difficulty === difficulty,
    ),
  )
}

export function getCaseProgress(user) {
  return readProgress(user)
}

export function isCaseModeComplete(user, caseId, difficulty) {
  return (
    backendCaseComplete(user, caseId, difficulty) ||
    Boolean(readProgress(user).completed[caseKey(caseId, difficulty)])
  )
}

export function isCaseComplete(user, caseId) {
  return (
    isCaseModeComplete(user, caseId, 'rookie') ||
    isCaseModeComplete(user, caseId, 'veteran')
  )
}

export function isCaseUnlocked(user, caseId) {
  if (caseId === 1) return true
  return isCaseComplete(user, caseId - 1)
}

export function completeCaseMode(user, caseId, difficulty, badge, pointsAwarded = 0) {
  const progress = readProgress(user)
  const nextBadges = new Set(progress.badges)
  const badgeName = typeof badge === 'string' ? badge : badge?.name
  if (badgeName) nextBadges.add(badgeName)
  const alreadyComplete = isCaseModeComplete(user, caseId, difficulty)

  return writeProgress(user, {
    ...progress,
    completed: {
      ...progress.completed,
      [caseKey(caseId, difficulty)]: true,
    },
    badges: Array.from(nextBadges),
    points: progress.points + (alreadyComplete ? 0 : pointsAwarded),
  })
}
