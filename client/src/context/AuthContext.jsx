import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api.js'

// Auth state shared across the whole app.
//
// Only the JWT is persisted (localStorage). The full player record is
// always loaded fresh from GET /api/user/me - so a refresh re-verifies
// the token with the server rather than trusting cached data.
//
// 2FA: a password-verified login that still needs an OTP returns a
// `pendingAuth` instead of a session; the VerifyOtp screen completes it.

const TOKEN_KEY = 'ss_token'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  // True while the stored token is being verified on first load.
  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem(TOKEN_KEY)),
  )
  // { pendingToken, emailHint } between login and OTP verification.
  const [pendingAuth, setPendingAuth] = useState(null)

  // On first load, verify any stored token and fetch the player record.
  useEffect(() => {
    if (!token) return
    let cancelled = false

    api
      .getMe(token)
      .then((data) => {
        if (!cancelled) setUser(data.user)
      })
      .catch(() => {
        // Token invalid or expired - drop it.
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY)
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // Runs once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Store a session token and load the full user behind it.
  async function completeSession(sessionToken) {
    localStorage.setItem(TOKEN_KEY, sessionToken)
    setToken(sessionToken)
    const data = await api.getMe(sessionToken)
    setUser(data.user)
    setPendingAuth(null)
  }

  async function register(username, password, email) {
    const data = await api.register(username, password, email)
    await completeSession(data.token)
  }

  // Returns { otpRequired } so the Login screen knows whether to route
  // to the OTP step or straight to Home.
  async function login(username, password) {
    const data = await api.login(username, password)
    if (data.otpRequired) {
      setPendingAuth({
        pendingToken: data.pendingToken,
        emailHint: data.emailHint,
      })
      return { otpRequired: true }
    }
    await completeSession(data.token)
    return { otpRequired: false }
  }

  async function verifyOtp(code) {
    if (!pendingAuth) {
      throw new Error('No sign-in in progress. Please log in again.')
    }
    const data = await api.verifyOtp(pendingAuth.pendingToken, code)
    await completeSession(data.token)
  }

  async function logout() {
    if (token) {
      try {
        await api.logout(token)
      } catch {
        // Best-effort - the client clears its session regardless.
      }
    }
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    setPendingAuth(null)
  }

  // Re-fetch the player record (e.g. after a settings change).
  async function refreshUser() {
    if (!token) return
    const data = await api.getMe(token)
    setUser(data.user)
  }

  const value = {
    token,
    user,
    loading,
    pendingAuth,
    isAuthenticated: Boolean(token && user),
    register,
    login,
    verifyOtp,
    logout,
    refreshUser,
    setUser, // lets a screen apply the user returned by a PATCH directly
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside an <AuthProvider>')
  }
  return ctx
}
