export const MAX_LIVES = 3

export const CASE_REWARDS = {
  rookie: 300,
  veteran: 500,
}

export function pointsForDifficulty(difficulty) {
  return CASE_REWARDS[difficulty] || 0
}
