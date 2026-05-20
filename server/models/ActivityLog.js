import mongoose from 'mongoose'

// Append-only feed of meaningful things a player has done. Read back by
// GET /api/activity to power the Recent Activity panel on the Profile
// screen. Written to (best-effort) by quiz completion, life loss,
// case completion, badges and shop purchases as they land.
const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Free-form keyword - "quiz" | "life" | "case" | "badge" | "shop" | ...
    // Lets the UI pick an icon/colour without parsing the message.
    type: { type: String, required: true },
    // Short, human-readable description shown verbatim in the feed.
    message: { type: String, required: true },
    // Points awarded (positive) or spent (negative). 0 if not applicable.
    points: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export default mongoose.model('ActivityLog', activitySchema)
