import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function VerifyEmail() {
  const { pendingAuth, addEmailForVerification } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!pendingAuth) return <Navigate to="/login" replace />
  if (pendingAuth.purpose !== 'add_email') {
    return <Navigate to="/verify-otp" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await addEmailForVerification(email.trim())
      navigate('/verify-otp')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <section className="ss-card w-full max-w-md p-8 flex flex-col gap-5">
        <div className="text-center">
          <p className="font-pixel text-sw-pink text-xs mb-2">
            LEGACY PROFILE UPGRADE
          </p>
          <h1 className="font-pixel text-sw-cyan text-glow text-base">
            Agent Email Required
          </h1>
        </div>

        <div className="case4-transmission-panel">
          <div className="case4-transmission-header">
            <span>SECURE VERIFICATION SETUP</span>
            <strong>EMAIL NEEDED</strong>
          </div>
          <div className="case4-transmission-status">
            <span>
              Your old agent profile needs an email before secure verification
              can be enabled.
            </span>
            <span>Add your email to continue.</span>
            <span>
              Your lives, coins, badges, progress, friends, and messages stay on
              this account.
            </span>
          </div>
          <div className="case4-packet-stream" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sw-text3">Email address</span>
            <input
              className="ss-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@unitzero.gov"
              autoComplete="email"
              required
            />
          </label>

          {error && <p className="text-sw-red text-center">{error}</p>}

          <button
            type="submit"
            className="ss-btn ss-btn-cyan"
            disabled={submitting}
          >
            {submitting ? 'Sending PIN...' : 'Send Verification PIN'}
          </button>
        </form>

        <Link to="/login" className="text-sw-text3 text-center text-sm underline">
          Cancel and return to sign in
        </Link>
      </section>
    </main>
  )
}
