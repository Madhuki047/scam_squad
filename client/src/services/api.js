// Thin wrapper around fetch for talking to the backend REST API.
// The base URL is configured via the VITE_API_URL environment variable
// (see client/.env.example).

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

/**
 * Make a JSON request to the backend.
 * @param {string} path - API path, e.g. "/auth/login"
 * @param {object} [options] - standard fetch options (method, body, headers)
 * @returns {Promise<any>} parsed JSON response
 */
export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`API ${response.status}: ${message || response.statusText}`)
  }

  return response.json()
}

export { API_URL }
