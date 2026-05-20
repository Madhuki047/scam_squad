import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import TopNav from './TopNav.jsx'
import { getPageTitle } from '../lib/nav.js'

// Frame for every signed-in screen: a fixed Sidebar and TopNav, with the
// routed page rendered in the scrolling content area. Used as a layout
// route in App.jsx, so child routes render through <Outlet />.
export default function AppLayout() {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav title={getPageTitle(pathname)} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
