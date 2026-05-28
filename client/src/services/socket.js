import { io } from 'socket.io-client'

// Same origin as the REST API by default. The SOCKET URL targets the
// HTTP server root (Socket.io handles the /socket.io/ path itself); the
// REST base URL has /api on the end, so derive one from the other.
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:3001')

// Open a socket connection authenticated with the given JWT. The token is
// sent in the handshake `auth` payload (not as a header) so it travels
// with both websocket and polling transports. Callers own the lifecycle:
// they must call .disconnect() when finished.
export function createSocket(token) {
  return io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  })
}

export { SOCKET_URL }
