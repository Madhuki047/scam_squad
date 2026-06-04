import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Account creation. Username, email and password are required; the emailed
// PIN must be verified before the first session is issued.
// The backend enforces the real rules (username >= 3, password >= 8).
export default function Register() {
  const { isAuthenticated, loading, register } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return null
  if (isAuthenticated) return <Navigate to="/home" replace />

  // Returns an error string, or '' when the form is valid.
  function validate() {
    if (username.trim().length < 3) {
      return 'Code name must be at least 3 characters.'
    }
    if (!email.trim()) {
      return 'Email is required for Agent Verification.'
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return 'That email address looks invalid.'
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters.'
    }
    if (password !== confirm) {
      return 'Passwords do not match.'
    }
    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setSubmitting(true)
    try {
      await register(username.trim(), password, email.trim())
      navigate('/verify-otp')
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
          ENLIST
        </h1>
        <p className="text-sw-text2 text-center -mt-2">
          Join Unit Zero as an intern
        </p>

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
          <span className="text-sw-text3">Email for Agent Verification</span>
          <input
            className="ss-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
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
            autoComplete="new-password"
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sw-text3">Confirm password</span>
          <input
            className="ss-input"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        {error && <p className="text-sw-red text-center">{error}</p>}

        <button
          type="submit"
          className="ss-btn ss-btn-pink mt-2"
          disabled={submitting}
        >
          {submitting ? 'Enlisting...' : 'Create account'}
        </button>

        <p className="text-sw-text3 text-center">
          Already an agent?{' '}
          <Link to="/login" className="text-sw-cyan underline">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  )
}
