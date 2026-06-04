import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'
import { playSfx } from '../lib/sound.js'

// Consumable power-ups, in the order they appear in the bar. `field` is the
// matching key on user.inventory (mirrors SHOP_CATALOG on the server). The
// help text must match the actual effect applied in useQuizPowerUps; `where`
// tells the player which screens a power-up can be used on, shown in the
// tooltip when it can't act on the current scene.
const CONSUMABLES = [
  { id: 'hint', field: 'hint', label: 'Hint', icon: '?', help: 'Cross out one wrong answer', where: 'Use it on a multiple-choice quiz question.' },
  { id: 'magnifier', field: 'magnifier', label: 'Magnifier', icon: '%', help: 'Cross out two wrong answers', where: 'Use it on a multiple-choice quiz question.' },
  { id: 'time', field: 'time', label: 'Time Ext.', icon: '#', help: 'Cross out one wrong answer', where: 'Use it on a multiple-choice quiz question.' },
  { id: 'second', field: 'second', label: '2nd Chance', icon: '!', help: 'Retry one wrong answer', where: 'Use it on a quiz or decision question.' },
]

// Header bar of owned power-ups, shared across every case.
//
// `effects` maps a power-up id to the handler that applies its in-game
// effect for the CURRENT scene. A handler that is missing (undefined) means
// the power-up does nothing here, so its button is disabled - we never spend
// a token on a no-op. `armed` is a set of ids already active this scene
// (e.g. a hint already used on the open question) so they can't be re-used.
//
// The bar owns the spend: it calls POST /api/shop/use, decrements the
// player's inventory in shared auth state, then runs the scene's effect.
export default function PowerUpBar({ effects = {}, armed = {} }) {
  const { token, user, setUser } = useAuth()
  const [busy, setBusy] = useState(null) // id mid-spend
  const [error, setError] = useState('')
  const inventory = user?.inventory || {}

  // Nothing owned at all -> render nothing rather than an empty shell.
  // When the player owns at least one power-up we always show the bar, even
  // on scenes where nothing is usable: the chips render disabled with a
  // tooltip pointing to where they work, so a purchase never looks lost.
  const ownedAny = CONSUMABLES.some((item) => (inventory[item.field] || 0) > 0)
  if (!ownedAny) return null

  async function use(item) {
    setBusy(item.id)
    setError('')
    try {
      const res = await api.useItem(token, item.id)
      // Reflect the spend everywhere reading auth state (shop count, etc.).
      setUser((prev) =>
        prev ? { ...prev, points: res.points, inventory: res.inventory } : prev,
      )
      playSfx('click')
      effects[item.id]?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="powerup-bar">
      <span className="powerup-bar-label font-pixel text-sw-text3 text-[10px]">
        POWER-UPS
      </span>
      <div className="powerup-bar-items">
        {CONSUMABLES.map((item) => {
          const count = inventory[item.field] || 0
          const usableHere = typeof effects[item.id] === 'function'
          const isArmed = Boolean(armed[item.id])
          const disabled =
            count < 1 || !usableHere || isArmed || busy === item.id
          const title = !usableHere
            ? `${item.help}. ${item.where} (not available on this screen)`
            : isArmed
              ? `${item.label} already active`
              : item.help
          return (
            <button
              key={item.id}
              type="button"
              className={`powerup-chip ${isArmed ? 'powerup-chip-armed' : ''}`}
              onClick={() => use(item)}
              disabled={disabled}
              title={title}
            >
              <span className="powerup-chip-icon">{item.icon}</span>
              <span className="powerup-chip-label">{item.label}</span>
              <span className="powerup-chip-count">x{count}</span>
            </button>
          )
        })}
      </div>
      {error && <span className="text-sw-red text-xs">{error}</span>}
    </div>
  )
}
