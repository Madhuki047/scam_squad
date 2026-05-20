import { createContext, useContext, useEffect, useState } from 'react'

// Device-local player preferences: audio + accessibility. These live in
// the browser (localStorage), NOT on the server, because they are
// per-device choices. Server-stored prefs (push notifications) live on
// the User document instead.

const STORAGE_KEY = 'ss_device_settings'

const DEFAULTS = {
  music: true,
  sfx: true,
  reduceMotion: false,
  highContrast: false,
  largerText: false,
}

const SettingsContext = createContext(null)

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings)

  // Persist on change, and reflect the accessibility choices as classes
  // on <html> so the CSS in index.css can respond app-wide.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    const root = document.documentElement
    root.classList.toggle('ss-reduce-motion', settings.reduceMotion)
    root.classList.toggle('ss-high-contrast', settings.highContrast)
    root.classList.toggle('ss-large-text', settings.largerText)
  }, [settings])

  function toggle(key) {
    setSettings((s) => ({ ...s, [key]: !s[key] }))
  }

  return (
    <SettingsContext.Provider value={{ settings, toggle }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    throw new Error('useSettings must be used inside a <SettingsProvider>')
  }
  return ctx
}
