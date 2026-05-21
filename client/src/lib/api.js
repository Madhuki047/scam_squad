// Central API client. Every network call to the backend goes through
// `request()` so auth headers and error handling live in one place.
//
// The base URL is configurable per environment via VITE_API_URL (see
// client/.env.example); it defaults to the local backend.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Low-level helper. Throws an Error (with the backend's message, when
// present) on any non-2xx response, so callers can use try/catch.
async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  // The backend always replies with JSON; guard anyway (e.g. server down).
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`)
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
  updateMe: (token, body) => request('/user/me', { method: 'PATCH', token, body }),
  deleteMe: (token) => request('/user/me', { method: 'DELETE', token }),
  getUser: (id) => request(`/user/${id}`),

  // --- lives ---
  getLives: (token) => request('/lives', { token }),
  useLife: (token) => request('/lives/use', { method: 'POST', token }),

  // --- quiz ---
  quizNext: (token) => request('/quiz/next', { token }),
  quizAnswer: (token, answerIndex) =>
    request('/quiz/answer', { method: 'POST', token, body: { answerIndex } }),
  quizComplete: (token) => request('/quiz/complete', { method: 'POST', token }),
  quizReset: (token) => request('/quiz/reset', { method: 'POST', token }),

  // --- activity ---
  getActivity: (token, limit) =>
    request(`/activity${limit ? `?limit=${limit}` : ''}`, { token }),

  // --- cases ---
  getCaseProgress: (token) => request('/cases/progress', { token }),
  completeCase: (token, caseId) =>
    request(`/cases/${caseId}/complete`, { method: 'POST', token }),

  // --- leaderboard ---
  getLeaderboard: (token) => request('/leaderboard', { token }),

  // --- shop ---
  getShop: (token) => request('/shop', { token }),
  buyItem: (token, itemId) =>
    request(`/shop/buy/${itemId}`, { method: 'POST', token }),

  // --- friends / squad ---
  getFriends: (token) => request('/friends', { token }),
  searchFriends: (token, q) =>
    request(`/friends/search?q=${encodeURIComponent(q)}`, { token }),
  sendFriendRequest: (token, id) =>
    request(`/friends/request/${id}`, { method: 'POST', token }),
  acceptFriend: (token, id) =>
    request(`/friends/accept/${id}`, { method: 'POST', token }),
  declineFriend: (token, id) =>
    request(`/friends/decline/${id}`, { method: 'POST', token }),
  removeFriend: (token, id) =>
    request(`/friends/remove/${id}`, { method: 'POST', token }),
}

export { request, API_URL }
