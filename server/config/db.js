import mongoose from 'mongoose'

// Connects to MongoDB using the MONGODB_URI from the environment.
// The process exits if the connection cannot be established, so the
// server never runs without a database.
async function connectDB() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.error('MONGODB_URI is not set. Add it to server/.env')
    process.exit(1)
  }

  try {
    await mongoose.connect(uri)
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  }
}

export default connectDB
