import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import TopNav from './TopNav.jsx'
import SoundLayer from './SoundLayer.jsx'
import { getPageTitle } from '../lib/nav.js'
import { useAuth } from '../context/AuthContext.jsx'
import { SocialNotificationsProvider } from '../context/SocialNotificationsContext.jsx'

// Frame for every signed-in screen: a fixed Sidebar and TopNav, with the
// routed page rendered in the scrolling content area. Used as a layout
// route in App.jsx, so child routes render through <Outlet />.
export default function AppLayout() {
  const { pathname } = useLocation()
  const { user } = useAuth()

  // Neon Skin cosmetic: while the player owns it, tag <html> so the
  // [data-skin="neon"] palette override in index.css takes effect app-wide.
  const neonSkin = Boolean(user?.inventory?.skinOwned)
  useEffect(() => {
    const root = document.documentElement
    if (neonSkin) root.dataset.skin = 'neon'
    else delete root.dataset.skin
    return () => {
      delete root.dataset.skin
    }
  }, [neonSkin])

  return (
    <SocialNotificationsProvider>
      <div className="flex h-screen overflow-hidden">
        <SoundLayer />
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <TopNav title={getPageTitle(pathname)} />
          <main className="flex-1 p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SocialNotificationsProvider>
  )
}
