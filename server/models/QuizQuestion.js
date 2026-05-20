import mongoose from 'mongoose'

// Five game themes - mirror the five case files.
export const CATEGORIES = [
  'phishing', // Case 1: The Bait
  'cyberbullying', // Case 2: The Network
  'social', // Case 3: The Insider
  'wifi', // Case 4: The Hotspot
  'ai', // Case 5: The Mirage
]

export const DIFFICULTIES = ['easy', 'medium', 'hard']

// A single multiple-choice quiz question. The adaptive engine picks
// questions by `difficulty` (and avoids repeats by `_id`); the case
// theming lives in `category`.
const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 4,
        message: 'A question must have exactly 4 options.',
      },
    },
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    difficulty: {
      type: String,
      required: true,
      enum: DIFFICULTIES,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: CATEGORIES,
      index: true,
    },
  },
  { timestamps: true },
)

export default mongoose.model('QuizQuestion', quizQuestionSchema)
