// Central API client. Every network call to the backend goes through
// `request()` so auth headers and error handling live in one place.
//
// The base URL is configurable per environment via VITE_API_URL (see
// client/.env.example); it defaults to the local backend.

function normalizeApiUrl(value) {
  const trimmed = value.replace(/\/+$/, '')
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
}

const API_URL = normalizeApiUrl(
  import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
)

// Low-level helper. Throws an Error (with the backend's message, when
// present) on any non-2xx response, so callers can use try/catch.
async function request(path, { method = 'GET', body, token } = {}) {
  const url = `${API_URL}${path}`
  let res

  try {
    res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    console.error('[api] Network request failed', {
      url,
      method,
      message: error.message,
    })
    throw error
  }

  // The backend always replies with JSON; guard anyway (e.g. server down).
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    console.error('[api] Request failed', {
      url,
      method,
      status: res.status,
      message: data.message,
    })
    throw new Error(
      data.message || `Request failed (${res.status}) for ${method} ${url}`,
    )
  }
  return data
}

// Named endpoints, grouped by area. More are added in later phases.
export const api = {
  health: () => request('/health'),

  // --- auth ---
  register: (username, password, email) =>
    request('/auth/register', {
      method: 'POST',
      body: { username, password, ...(email ? { email } : {}) },
    }),
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: { username, password } }),
  verifyOtp: (pendingToken, code) =>
    request('/auth/verify-otp', {
      method: 'POST',
      body: { pendingToken, code },
    }),
  logout: (token) => request('/auth/logout', { method: 'POST', token }),

  // --- user ---
  getMe: (token) => request('/user/me', { token }),
  getProgress: (token) => request('/progress', { token }),
  completeIntro: (token) =>
    request('/progress/complete-intro', { method: 'POST', token }),
  updateMe: (token, body) => request('/user/me', { method: 'PATCH', token, body }),
  deleteMe: (token) => request('/user/me', { method: 'DELETE', token }),
  completeCase: (token, body) =>
    request('/progress/complete-case', { method: 'POST', token, body }),
  failAttempt: (token, body) =>
    request('/progress/fail-attempt', { method: 'POST', token, body }),
  getUser: (id) => request(`/user/${id}`),

  // --- lives ---
  getLives: (token) => request('/lives', { token }),
  useLife: (token) => request('/lives/use', { method: 'POST', token }),

  // --- quiz ---
  quizNext: (token) => request('/quiz/next', { token }),
  quizAnswer: (token, answerIndex) =>
    request('/quiz/answer', { method: 'POST', token, body: { answerIndex } }),
  quizComplete: (token) => request('/quiz/complete', { method: 'POST', token }),

  // --- activity ---
  getActivity: (token, limit) =>
    request(`/activity${limit ? `?limit=${limit}` : ''}`, { token }),

  // --- leaderboard ---
  getLeaderboard: (token, { limit = 20, offset = 0 } = {}) =>
    request(`/leaderboard?limit=${limit}&offset=${offset}`, { token }),
  getMyRank: (token) => request('/leaderboard/me', { token }),

  // --- friends ---
  getFriends: (token) => request('/friends', { token }),
  getFriendRequests: (token) => request('/friends/requests', { token }),
  getOutgoingFriendRequests: (token) => request('/friends/outgoing', { token }),
  searchPlayers: (token, q) =>
    request(`/friends/search?q=${encodeURIComponent(q)}`, { token }),
  sendFriendRequest: (token, userId) =>
    request(`/friends/request/${userId}`, { method: 'POST', token }),
  acceptFriendRequest: (token, userId) =>
    request(`/friends/accept/${userId}`, { method: 'POST', token }),
  declineFriendRequest: (token, userId) =>
    request(`/friends/decline/${userId}`, { method: 'POST', token }),
  removeFriend: (token, userId) =>
    request(`/friends/${userId}`, { method: 'DELETE', token }),

  // --- chat (history only; live delivery goes through the socket) ---
  getChatHistory: (token, peerId) => request(`/chat/${peerId}`, { token }),
  getChatUnreadSummary: (token) => request('/chat/unread/summary', { token }),
  markChatRead: (token, peerId) =>
    request(`/chat/${peerId}/read`, { method: 'POST', token }),
}

export { request, API_URL }
