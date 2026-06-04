import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function VerifyOtp() {
  const { pendingAuth, verifyOtp, resendOtp } = useAuth()
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)

  if (!pendingAuth) return <Navigate to="/login" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
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

  async function handleResend() {
    setError('')
    setNotice('')
    setResending(true)
    try {
      await resendOtp()
      setNotice('Secure access PIN resent. Check your email uplink.')
    } catch (err) {
      setError(err.message)
    } finally {
      setResending(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <section className="ss-card w-full max-w-md p-8 flex flex-col gap-5">
        <div className="text-center">
          <p className="font-pixel text-sw-pink text-xs mb-2">
            UNIT ZERO ACCESS GATE
          </p>
          <h1 className="font-pixel text-sw-cyan text-glow text-base">
            Agent Verification Required
          </h1>
        </div>

        <div className="case4-transmission-panel">
          <div className="case4-transmission-header">
            <span>SECURE EMAIL PIN</span>
            <strong>LOCKED</strong>
          </div>
          <div className="case4-transmission-status">
            <span>
              A secure access PIN has been sent to your registered email.
            </span>
            <span>
              Destination:{' '}
              <strong className="text-sw-cyan">{pendingAuth.emailHint}</strong>
            </span>
            <span>Enter the code to unlock your Scam Squad dashboard.</span>
          </div>
          <div className="case4-packet-stream" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            className="ss-input text-center text-2xl tracking-[0.5em]"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="------"
            autoComplete="one-time-code"
            autoFocus
            required
          />

          {error && <p className="text-sw-red text-center">{error}</p>}
          {notice && <p className="text-sw-cyan text-center">{notice}</p>}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="ss-btn ss-btn-cyan flex-1"
              disabled={submitting || code.length < 6}
            >
              {submitting ? 'Verifying...' : 'Verify PIN'}
            </button>
            <button
              type="button"
              className="ss-btn ss-btn-pink flex-1"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? 'Resending...' : 'Resend PIN'}
            </button>
          </div>
        </form>

        <p className="text-sw-text3 text-center text-sm">
          PINs expire in 10 minutes. If mail is not configured in development,
          check the server console.
        </p>
        <Link to="/login" className="text-sw-text3 text-center text-sm underline">
          Cancel verification
        </Link>
      </section>
    </main>
  )
}
