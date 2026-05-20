import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import { connectRedis } from "./services/redisService.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import livesRoutes from "./routes/livesRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// Allow the frontend (Vite dev server) to call the API.
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

// Simple health check - useful to confirm the server is running.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Feature routes.
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/lives", livesRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/activity", activityRoutes);

// Central error handler (must be registered last).
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

// Connect to MongoDB (required), bring Redis up if configured (optional,
// non-blocking), then start listening.
connectDB().then(() => {
  connectRedis();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
