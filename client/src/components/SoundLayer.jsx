import { useEffect } from 'react'
import { useSettings } from '../context/SettingsContext.jsx'
import { playSfx, setSfxMuted, unlockAudio } from '../lib/sound.js'

export default function SoundLayer() {
  const { settings } = useSettings()

  useEffect(() => {
    setSfxMuted(settings.sfx === false)
  }, [settings.sfx])

  useEffect(() => {
    function unlock() {
      unlockAudio()
    }

    function click(event) {
      if (event.target.closest('button, a, [role="button"]')) {
        playSfx('click')
      }
    }

    function hover(event) {
      const target = event.target.closest('button, a, [role="button"]')
      if (target && !target.contains(event.relatedTarget)) {
        playSfx('hover')
      }
    }

    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    document.addEventListener('click', click)
    document.addEventListener('mouseover', hover)

    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      document.removeEventListener('click', click)
      document.removeEventListener('mouseover', hover)
    }
  }, [])

  return null
}
