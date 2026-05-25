import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";

import { createCorsOptions } from "./config/cors.js";
import connectDB from "./config/db.js";
import { connectRedis } from "./services/redisService.js";
import { attachChatSocket } from "./services/chatSocket.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import livesRoutes from "./routes/livesRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import friendsRoutes from "./routes/friendsRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const corsOptions = createCorsOptions();

// Allow the frontend (Vite dev server) to call the API.
app.use(cors(corsOptions));
app.use(express.json());

// Simple health check - useful to confirm the server is running.
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    routes: {
      progress: "/api/progress",
      progressPing: "/api/progress/ping",
    },
  });
});

// Feature routes.
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/lives", livesRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/chat", chatRoutes);

app.use("/api", (req, res) => {
  console.warn(`[api] 404 ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central error handler (must be registered last).
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

// Socket.io shares the same HTTP server as Express, so realtime traffic
// and REST traffic terminate on the same port. The chat handlers (auth,
// chat:send, chat:typing, disconnect bookkeeping) are wired up in
// services/chatSocket.js.
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: corsOptions,
});
attachChatSocket(io);

// Connect to MongoDB (required), bring Redis up if configured (optional,
// non-blocking), then start listening.
connectDB().then(() => {
  connectRedis();
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
