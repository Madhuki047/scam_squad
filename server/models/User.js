import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// A player account ("agent"). This is the central document for the whole
// game: identity, currency, lives, progression stats and social graph all
// live here. Game-specific collections (Score, ActivityLog) reference it
// by _id.
//
// Phase 1 only uses username + password. Every other field has a default
// so the auth controller can keep calling User.create({ username, password })
// unchanged. Later phases fill these in:
//   - email            -> set during the Phase 2 email/2FA flow
//   - lives / points   -> Phase 3 game systems
//   - friends / badges -> Phase 4 social + economy
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    // Stored hashed by the pre-save hook below. Named "password" (not
    // "passwordHash") to stay consistent with the existing auth controller.
    password: {
      type: String,
      required: true,
    },
    // Optional. When set, logins require an emailed OTP (2FA). Indexed
    // `sparse` so the many accounts WITHOUT an email do not collide on
    // the unique index - only accounts that actually set one are checked.
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },

    // --- Currency -----------------------------------------------------
    points: { type: Number, default: 0, min: 0 },

    // --- Lives system (cooldown timestamp tracked in Redis, mirrored
    //     here so the value survives a Redis flush) ----------------------
    livesRemaining: { type: Number, default: 5, min: 0, max: 5 },
    lastLifeRegen: { type: Date, default: Date.now },

    // --- Progression stats -------------------------------------------
    totalScore: { type: Number, default: 0, min: 0 },
    casesSolved: { type: Number, default: 0, min: 0 },
    // String ids of the cases the player has finished (e.g. "1", "2"),
    // tracked so the /complete endpoint can stay idempotent.
    completedCases: [{ type: String }],
    accuracy: { type: Number, default: 0, min: 0, max: 100 },
    dayStreak: { type: Number, default: 0, min: 0 },
    rank: { type: Number, default: 0 },
    level: { type: Number, default: 1, min: 1 },
    xp: { type: Number, default: 0, min: 0 },

    // --- Badges -------------------------------------------------------
    badges: [
      {
        _id: false,
        id: { type: String, required: true },
        earnedAt: { type: Date, default: Date.now },
      },
    ],

    // --- Shop inventory ----------------------------------------------
    // Consumable boosts hold a count; cosmetics hold a boolean (owned).
    inventory: {
      magnifier: { type: Number, default: 0, min: 0 },
      time: { type: Number, default: 0, min: 0 },
      second: { type: Number, default: 0, min: 0 },
      hint: { type: Number, default: 0, min: 0 },
      skinOwned: { type: Boolean, default: false },
      badgeOwned: { type: Boolean, default: false },
      titleOwned: { type: Boolean, default: false },
    },

    // --- Social graph -------------------------------------------------
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // --- Preferences --------------------------------------------------
    // Only settings that affect SERVER behaviour live here (whether to
    // send push notifications). Device-local prefs - audio, accessibility
    // - are kept in the browser instead (see client SettingsContext).
    settings: {
      notifications: {
        lifeRegen: { type: Boolean, default: true },
        squadInvites: { type: Boolean, default: true },
        dailyQuiz: { type: Boolean, default: true },
      },
    },

    lastLogin: { type: Date, default: Date.now },
  },
  { timestamps: true }, // adds createdAt + updatedAt
)

// Hash the password before saving, but only when it has changed, so
// updating other fields (points, lives, ...) does not re-hash it.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare a plain-text password against the stored hash.
userSchema.methods.comparePassword = function comparePassword(plainText) {
  return bcrypt.compare(plainText, this.password)
}

export default mongoose.model('User', userSchema)
