import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Player account. This phase covers identity + email-based 2FA only; the
// game-state fields (points, lives, progression, badges, inventory,
// social graph, preferences) are added in the gameplay phase, with
// defaults that keep the existing controllers calling User.create()
// unchanged.
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
    // sparse so the many accounts WITHOUT an email do not collide on the
    // unique index - only accounts that actually set one are checked.
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    lastLogin: { type: Date, default: Date.now },
  },
  { timestamps: true }, // adds createdAt + updatedAt
)

// Hash the password before saving, but only when it has changed, so
// updating other fields does not re-hash it.
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
