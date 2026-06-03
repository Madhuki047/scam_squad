import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'

// Power-up shop. The catalog (names, prices, types) comes from the server
// so prices can't be tampered with client-side; this screen only renders
// what it's given and posts purchase intents.
export default function Shop() {
  const { token, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(null) // id of the item being bought
  const [notice, setNotice] = useState(null) // { ok, text }
  const [toast, setToast] = useState(null) // { text, action } - transient
  const toastTimer = useRef(null)

  // Show a transient toast that clears itself after a few seconds.
  function showToast(text) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ text })
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  useEffect(() => {
    let cancelled = false
    api
      .getShop(token)
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  // Owned-state for an item: a count for consumables, a boolean for
  // cosmetics (inventory key is `<id>Owned` for those).
  function ownedInfo(item, inventory) {
    if (item.type === 'cosmetic') {
      return { owned: Boolean(inventory?.[`${item.id}Owned`]), count: null }
    }
    return { owned: false, count: inventory?.[item.id] || 0 }
  }

  // Gate the purchase on the click. When the player can't afford the item
  // we don't disable the button (a disabled button can't explain itself) -
  // instead we nudge them toward the quiz, where points are earned.
  function handleBuyClick(item) {
    if (data.points < item.price) {
      showToast('Not enough points - play the quiz to earn extra points.')
      return
    }
    buy(item)
  }

  async function buy(item) {
    setBusy(item.id)
    setNotice(null)
    try {
      const res = await api.buyItem(token, item.id)
      setData((prev) => ({
        ...prev,
        points: res.points,
        inventory: res.inventory,
      }))
      setNotice({ ok: true, text: `Purchased ${item.name}.` })
      refreshUser?.() // keep the TopNav points counter in sync
    } catch (e) {
      setNotice({ ok: false, text: e.message })
    } finally {
      setBusy(null)
    }
  }

  if (error) {
    return <p className="text-sw-red text-center">{error}</p>
  }
  if (!data) {
    return <p className="text-sw-text3 text-center">Loading…</p>
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-pixel text-sw-cyan text-glow text-base">
            POWER-UP SHOP
          </h2>
          <p className="text-sw-text3 mt-1">Spend your points on an edge.</p>
        </div>
        <span className="font-pixel text-sw-yellow text-sm">
          {data.points} PTS
        </span>
      </div>

      {notice && (
        <p className={notice.ok ? 'text-sw-green' : 'text-sw-red'}>
          {notice.text}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.items.map((item) => {
          const { owned, count } = ownedInfo(item, data.inventory)
          const affordable = data.points >= item.price
          // Unaffordable items stay clickable so the tap can surface the
          // "play the quiz" toast; only owned/in-flight items are disabled.
          const disabled = busy === item.id || owned

          return (
            <div key={item.id} className="ss-card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <span className="font-pixel text-sw-cyan text-sm">
                  {item.name}
                </span>
                {item.type === 'cosmetic' ? (
                  owned && (
                    <span className="text-sw-green text-xs font-pixel">
                      OWNED
                    </span>
                  )
                ) : (
                  count > 0 && (
                    <span className="text-sw-text3 text-xs">x{count}</span>
                  )
                )}
              </div>
              <p className="text-sw-text2 text-sm flex-1">{item.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-sw-yellow">{item.price} PTS</span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleBuyClick(item)}
                  className={`ss-btn text-sm ${
                    affordable ? 'ss-btn-pink' : 'ss-btn-cyan opacity-70'
                  }`}
                >
                  {owned
                    ? 'Owned'
                    : busy === item.id
                      ? '…'
                      : affordable
                        ? 'Buy'
                        : 'Locked'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {toast && (
        <div className="ss-toast" role="status">
          <span>{toast.text}</span>
          <button
            type="button"
            className="ss-btn ss-btn-cyan text-xs"
            onClick={() => navigate('/quiz')}
          >
            Play Quiz
          </button>
        </div>
      )}
    </div>
  )
}
