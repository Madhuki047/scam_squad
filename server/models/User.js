import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// A player account. Game progression fields (score, badges, case progress)
// can be added to this schema later.
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
)

// Hash the password before saving, but only when it has changed.
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
