import ActivityLog from '../models/ActivityLog.js'

// Best-effort activity logging. Called from controllers when something
// noteworthy happens (quiz completed, life used, ...). A failure here
// must never break the parent request, so the write is wrapped in a
// catch that just warns.
export async function logActivity(userId, type, message, points = 0) {
  try {
    await ActivityLog.create({ userId, type, message, points })
  } catch (error) {
    console.warn('[activityService] Failed to log activity:', error.message)
  }
}
