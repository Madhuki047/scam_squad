import "dotenv/config";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

import { createCorsOptions } from "./config/cors.js";
import connectDB from "./config/db.js";
import { connectRedis } from "./services/redisService.js";
import { attachChatSocket } from "./services/chatSocket.js";
import createApp from "./app.js";

const app = createApp();
const PORT = process.env.PORT || 3001;

// Socket.io shares the same HTTP server as Express, so realtime traffic
// and REST traffic terminate on the same port. The chat handlers (auth,
// chat:send, chat:typing, disconnect bookkeeping) are wired up in
// services/chatSocket.js.
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: createCorsOptions(),
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
