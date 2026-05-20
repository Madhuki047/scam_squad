import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Layout route guard for screens that require a signed-in player.
// While the stored token is being verified on first load it shows a
// loader; once that resolves, signed-out visitors go to /login.
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-pixel text-sw-cyan text-glow text-sm animate-pulse">
          LOADING...
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
