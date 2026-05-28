import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'

// Power-up shop. The catalog (names, prices, types) comes from the server
// so prices can't be tampered with client-side; this screen only renders
// what it's given and posts purchase intents.
export default function Shop() {
  const { token, refreshUser } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(null) // id of the item being bought
  const [notice, setNotice] = useState(null) // { ok, text }

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
          const disabled = busy === item.id || owned || !affordable

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
                  onClick={() => buy(item)}
                  className="ss-btn ss-btn-pink text-sm"
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
    </div>
  )
}
