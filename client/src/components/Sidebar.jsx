import { NavLink, useNavigate } from 'react-router-dom'
import { IconSettings, IconLogout } from '@tabler/icons-react'
import { navItems } from '../lib/nav.js'
import { useAuth } from '../context/AuthContext.jsx'

// Fixed 64px vertical nav, shown on every in-app screen. The active
// route's icon turns pink (handled by NavLink's isActive).
export default function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await logout()
    navigate('/login')
  }

  // Shared icon-button styling; pink when the route is active.
  const linkClass = ({ isActive }) =>
    [
      'flex items-center justify-center w-10 h-10 rounded transition-colors',
      isActive ? 'text-sw-pink' : 'text-sw-text3 hover:text-sw-cyan',
    ].join(' ')

  return (
    <nav
      className="w-16 shrink-0 flex flex-col items-center py-4 gap-1"
      style={{
        background: 'rgba(13,0,30,.9)',
        borderRight: '1.5px solid var(--line)',
      }}
    >
      {/* Vertical "SQUAD" wordmark. */}
      <div
        className="font-pixel text-sw-cyan text-[10px] mb-5 tracking-widest"
        style={{ writingMode: 'vertical-rl' }}
      >
        SQUAD
      </div>

      {navItems.map(({ path, label, Icon }) => (
        <NavLink key={path} to={path} className={linkClass} title={label}>
          <Icon size={22} stroke={1.5} />
        </NavLink>
      ))}

      {/* Push the bottom group down. */}
      <div className="flex-1" />

      <NavLink to="/settings" className={linkClass} title="Settings">
        <IconSettings size={22} stroke={1.5} />
      </NavLink>
      <button
        type="button"
        onClick={handleSignOut}
        title="Sign out"
        className="flex items-center justify-center w-10 h-10 rounded text-sw-text3 hover:text-sw-red transition-colors"
      >
        <IconLogout size={22} stroke={1.5} />
      </button>
    </nav>
  )
}
