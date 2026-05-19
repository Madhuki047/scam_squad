import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthScreen from '../components/auth/AuthScreen'
import TextField from '../components/ui/TextField'
import PixelButton from '../components/ui/PixelButton'
import { apiRequest } from '../services/api'

// New agent registration screen.
function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.username.trim()) {
      setError('Pick a code name.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      // Save the auth token so the new agent is signed in straight away.
      if (data.token) localStorage.setItem('token', data.token)
      navigate('/cases')
    } catch {
      setError('Could not create the account. Try a different code name.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthScreen title="NEW AGENT" subtitle="JOIN THE UNIT">
      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Username"
          id="username"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="pick a code name"
          autoComplete="username"
        />
        <TextField
          label="Password"
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="at least 8 characters"
          autoComplete="new-password"
        />

        {error && (
          <p className="font-retro text-lg text-red-400 mb-3">{error}</p>
        )}

        <PixelButton type="submit" icon="▶" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </PixelButton>
      </form>

      <p className="font-pixel text-[0.6rem] tracking-widest text-slate-400 text-center mt-5">
        ALREADY AN AGENT?{' '}
        <Link to="/login" className="text-neon-cyan underline">
          SIGN IN
        </Link>
      </p>
    </AuthScreen>
  )
}

export default Register
