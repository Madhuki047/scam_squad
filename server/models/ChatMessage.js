import mongoose from 'mongoose'

// 1:1 text messages between two players. Per-friendship conversations are
// derived at read time by filtering on the (from, to) pair in either
// direction; there is no separate "conversation" collection.
const chatMessageSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: { type: String, required: true, maxlength: 1000 },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
)

// Compound index: serves the "history between A and B, newest first"
// query the chat history endpoint runs.
chatMessageSchema.index({ from: 1, to: 1, createdAt: -1 })

export default mongoose.model('ChatMessage', chatMessageSchema)
