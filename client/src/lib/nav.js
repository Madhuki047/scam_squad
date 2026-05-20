import {
  IconHome,
  IconDeviceGamepad2,
  IconHelpCircle,
  IconTrophy,
  IconShoppingCart,
  IconUsers,
  IconUser,
} from '@tabler/icons-react'

// Single source of truth for the in-app navigation. The Sidebar renders
// these as icon buttons; AppLayout uses the labels for the TopNav title.
// Icons are imported by name so the bundle only ships the ones used.
export const navItems = [
  { path: '/home', label: 'HOME', Icon: IconHome },
  { path: '/play', label: 'CASES', Icon: IconDeviceGamepad2 },
  { path: '/quiz', label: 'QUIZ', Icon: IconHelpCircle },
  { path: '/leaderboard', label: 'RANKS', Icon: IconTrophy },
  { path: '/shop', label: 'SHOP', Icon: IconShoppingCart },
  { path: '/friends', label: 'SQUAD', Icon: IconUsers },
  { path: '/profile', label: 'PROFILE', Icon: IconUser },
]

// TopNav heading for a route, formatted "--- HOME ---".
export function getPageTitle(pathname) {
  const item = navItems.find((n) => pathname.startsWith(n.path))
  const name = item
    ? item.label
    : pathname.startsWith('/settings')
      ? 'SETTINGS'
      : 'UNIT ZERO'
  return `--- ${name} ---`
}
