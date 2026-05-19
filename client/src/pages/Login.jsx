import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthScreen from '../components/auth/AuthScreen'
import TextField from '../components/ui/TextField'
import PixelButton from '../components/ui/PixelButton'
import { apiRequest } from '../services/api'

// Agent login screen.
function Login() {
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

    if (!form.username.trim() || !form.password) {
      setError('Enter your code name and password.')
      return
    }

    setLoading(true)
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      // Save the auth token so later API calls can be authenticated.
      if (data.token) localStorage.setItem('token', data.token)
      navigate('/cases')
    } catch {
      setError('Login failed. Check your details and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthScreen title="SCAM SQUAD" subtitle="AGENT LOGIN">
      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Username"
          id="username"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="enter your code name"
          autoComplete="username"
        />
        <TextField
          label="Password"
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="enter your password"
          autoComplete="current-password"
        />

        {error && (
          <p className="font-retro text-lg text-red-400 mb-3">{error}</p>
        )}

        <PixelButton type="submit" icon="▶" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </PixelButton>
      </form>

      <p className="font-pixel text-[0.6rem] tracking-widest text-slate-400 text-center mt-5">
        NO ACCOUNT?{' '}
        <Link to="/register" className="text-neon-cyan underline">
          CREATE ONE
        </Link>
      </p>
    </AuthScreen>
  )
}

export default Login
