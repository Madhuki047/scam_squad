// Socket.io client used for real-time co-op gameplay.
// The server URL is configured via the VITE_SOCKET_URL environment variable
// (see client/.env.example). autoConnect is disabled so the connection can be
// opened explicitly once a player joins a game session.

import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

export const socket = io(SOCKET_URL, {
  autoConnect: false,
})

export { SOCKET_URL }
