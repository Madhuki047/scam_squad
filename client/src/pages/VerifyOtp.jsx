import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Second step of 2FA sign-in: enter the 6-digit code emailed after a
// password-verified login.
export default function VerifyOtp() {
  const { pendingAuth, verifyOtp } = useAuth()
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Reached with no login in progress (e.g. a page refresh lost the
  // pending state) - send the player back to start over.
  if (!pendingAuth) return <Navigate to="/login" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await verifyOtp(code.trim())
      navigate('/home')
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
        <h1 className="font-pixel text-sw-cyan text-glow text-base text-center mb-2">
          VERIFY
        </h1>
        <p className="text-sw-text2 text-center -mt-1">
          We sent a 6-digit code to{' '}
          <span className="text-sw-cyan">{pendingAuth.emailHint}</span>
        </p>

        <input
          className="ss-input text-center text-2xl tracking-[0.5em]"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="------"
          autoFocus
          required
        />

        {error && <p className="text-sw-red text-center">{error}</p>}

        <button
          type="submit"
          className="ss-btn ss-btn-cyan"
          disabled={submitting || code.length < 6}
        >
          {submitting ? 'Verifying...' : 'Verify'}
        </button>

        <p className="text-sw-text3 text-center text-sm">
          The code expires in 5 minutes. If email isn't configured, check
          the server console for it.
        </p>
      </form>
    </main>
  )
}
