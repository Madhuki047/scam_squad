import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Sign-in screen. Password validation is followed by email PIN verification.
export default function Login() {
  const { isAuthenticated, loading, login } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Don't flash the form while a stored token is being verified.
  if (loading) return null
  if (isAuthenticated) return <Navigate to="/home" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { otpRequired, requiresEmailSetup } = await login(
        username.trim(),
        password,
      )
      if (requiresEmailSetup) {
        navigate('/verify-email')
        return
      }
      navigate(otpRequired ? '/verify-otp' : '/home')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="ss-card w-full max-w-sm p-8 flex flex-col gap-4"
      >
        <h1 className="font-pixel text-sw-cyan text-glow text-lg text-center mb-2">
          SCAM SQUAD
        </h1>
        <p className="text-sw-text2 text-center -mt-2">Agent sign-in</p>

        <label className="flex flex-col gap-1">
          <span className="text-sw-text3">Code name</span>
          <input
            className="ss-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sw-text3">Password</span>
          <input
            className="ss-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="text-sw-red text-center">{error}</p>}

        <button
          type="submit"
          className="ss-btn ss-btn-cyan mt-2"
          disabled={submitting}
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="text-sw-text3 text-center">
          New recruit?{' '}
          <Link to="/register" className="text-sw-pink underline">
            Enlist here
          </Link>
        </p>
      </form>
    </main>
  )
}
