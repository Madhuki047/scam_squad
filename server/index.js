import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import errorHandler from './middleware/errorHandler.js'

const app = express()

// Allow the frontend (Vite dev server) to call the API.
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json())

// Simple health check - useful to confirm the server is running.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Feature routes.
app.use('/api/auth', authRoutes)

// Central error handler (must be registered last).
app.use(errorHandler)

const PORT = process.env.PORT || 3001

// Connect to the database, then start listening.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
})
