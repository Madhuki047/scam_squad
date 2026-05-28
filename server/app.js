import express from "express";
import cors from "cors";

import { createCorsOptions } from "./config/cors.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import livesRoutes from "./routes/livesRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import friendsRoutes from "./routes/friendsRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import shopRoutes from "./routes/shopRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

// Builds the Express app without DB connection or .listen(). Both the
// long-running server (index.js) and the test harness import this so they
// hit the exact same middleware + routing.
export default function createApp() {
  const app = express();
  app.use(cors(createCorsOptions()));
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      routes: {
        progress: "/api/progress",
        progressPing: "/api/progress/ping",
      },
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/progress", progressRoutes);
  app.use("/api/lives", livesRoutes);
  app.use("/api/quiz", quizRoutes);
  app.use("/api/activity", activityRoutes);
  app.use("/api/leaderboard", leaderboardRoutes);
  app.use("/api/friends", friendsRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/shop", shopRoutes);

  app.use("/api", (req, res) => {
    console.warn(`[api] 404 ${req.method} ${req.originalUrl}`);
    res.status(404).json({
      message: `API route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  app.use(errorHandler);

  return app;
}
