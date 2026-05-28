import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../lib/api.js'

// Power-up shop. Two groups: consumables (counts) and cosmetics (owned
// booleans). Both come from a single GET /api/shop so the player's
// current balance and inventory stay in sync with the catalog.
export default function Shop() {
  const { token, refreshUser } = useAuth()
  const [state, setState] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')

  async function load() {
    try {
      setState(await api.getShop(token))
    } catch (err) {
      setError(err.message)
    }
  }
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function handleBuy(itemId) {
    setBusyId(itemId)
    setError('')
    try {
      const data = await api.buyItem(token, itemId)
      setState((s) => ({ ...s, points: data.points, inventory: data.inventory }))
      // Sync points + inventory on the global user record (TopNav etc.).
      refreshUser?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (!state) {
    return (
      <p className="text-sw-text3 text-center mt-10">
        {error || 'Loading…'}
      </p>
    )
  }

  const consumables = state.items.filter((i) => i.kind === 'consumable')
  const cosmetics = state.items.filter((i) => i.kind === 'cosmetic')

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <div className="ss-card p-5 flex items-center justify-between">
        <div>
          <h2 className="font-pixel text-sw-cyan text-glow text-base mb-1">
            POWER-UP SHOP
          </h2>
          <p className="text-sw-text3">
            Spend earned points on consumables or cosmetic upgrades.
          </p>
        </div>
        <div className="text-right">
          <div className="font-pixel text-sw-yellow text-sm">
            {state.points}
          </div>
          <div className="text-sw-text3 text-xs">POINTS</div>
        </div>
      </div>

      {error && (
        <div className="ss-card p-4 text-sw-red text-center">{error}</div>
      )}

      <Section title="CONSUMABLES">
        <Grid>
          {consumables.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              owned={state.inventory[item.id] || 0}
              ownedLabel={`x${state.inventory[item.id] || 0}`}
              canAfford={state.points >= item.price}
              busy={busyId === item.id}
              onBuy={() => handleBuy(item.id)}
            />
          ))}
        </Grid>
      </Section>

      <Section title="COSMETICS">
        <Grid>
          {cosmetics.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              owned={Boolean(state.inventory[item.inventoryField])}
              ownedLabel="Owned"
              canAfford={state.points >= item.price}
              busy={busyId === item.id}
              onBuy={() => handleBuy(item.id)}
            />
          ))}
        </Grid>
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="ss-card p-5">
      <h3 className="font-pixel text-sw-pink text-sm mb-4">{title}</h3>
      {children}
    </div>
  )
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  )
}

function ItemCard({ item, owned, ownedLabel, canAfford, busy, onBuy }) {
  // Cosmetics already owned are disabled; consumables can always be
  // re-bought to stack the count.
  const isCosmeticOwned = item.kind === 'cosmetic' && owned
  const disabled = busy || isCosmeticOwned || !canAfford
  return (
    <div
      className="rounded p-4 flex flex-col gap-2"
      style={{
        background: 'rgba(13,0,30,.5)',
        border: '1.5px solid var(--line2)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sw-cyan">{item.name}</span>
        <span className="text-sw-text3 text-xs">{ownedLabel}</span>
      </div>
      <p className="text-sw-text3 text-sm leading-tight">{item.description}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="font-pixel text-sw-yellow text-sm">
          {item.price}
        </span>
        <button
          type="button"
          className="ss-btn ss-btn-pink"
          disabled={disabled}
          onClick={onBuy}
        >
          {isCosmeticOwned ? 'Owned' : busy ? '…' : 'Buy'}
        </button>
      </div>
    </div>
  )
}
