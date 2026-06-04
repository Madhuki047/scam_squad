import User from '../models/User.js'
import { logActivity } from '../services/activityService.js'

// Server-side item catalog, locked here so the client can't invent its
// own prices (mirrors CASE_CATALOG in the cases controller). Each `field`
// maps to a key on user.inventory:
//   - consumable -> a counter (how many the player holds)
//   - cosmetic   -> a boolean (owned or not), bought once
const SHOP_CATALOG = {
  magnifier: {
    name: 'Evidence Magnifier',
    desc: 'Cross out two wrong answers on a quiz question.',
    price: 150,
    type: 'consumable',
    field: 'magnifier',
  },
  time: {
    name: 'Time Extender',
    desc: 'Cross out one wrong answer on a quiz question.',
    price: 120,
    type: 'consumable',
    field: 'time',
  },
  second: {
    name: 'Second Chance',
    desc: 'Retry one wrong answer without penalty.',
    price: 200,
    type: 'consumable',
    field: 'second',
  },
  hint: {
    name: 'Hint Token',
    desc: 'Cross out one wrong answer on a quiz question.',
    price: 100,
    type: 'consumable',
    field: 'hint',
  },
  skin: {
    name: 'Neon Skin',
    desc: 'A cyber-neon theme for your profile.',
    price: 500,
    type: 'cosmetic',
    field: 'skinOwned',
  },
  badge: {
    name: 'Elite Badge',
    desc: 'An exclusive badge on your profile.',
    price: 400,
    type: 'cosmetic',
    field: 'badgeOwned',
  },
  title: {
    name: 'Custom Title',
    desc: 'Display a custom agent title.',
    price: 600,
    type: 'cosmetic',
    field: 'titleOwned',
  },
}

// Public shape of the catalog (no internal `field`).
function catalogList() {
  return Object.entries(SHOP_CATALOG).map(([id, item]) => ({
    id,
    name: item.name,
    desc: item.desc,
    price: item.price,
    type: item.type,
  }))
}

// GET /api/shop - the catalog plus the player's balance and inventory so
// the client can render owned/affordable state without a second call.
export async function getShop(req, res, next) {
  try {
    const user = await User.findById(req.userId).select('points inventory')
    if (!user) return res.status(404).json({ message: 'Account not found.' })
    res.json({
      items: catalogList(),
      points: user.points || 0,
      inventory: user.inventory,
    })
  } catch (error) {
    next(error)
  }
}

// POST /api/shop/buy/:itemId - deduct the price and grant the item.
// Validates funds and (for cosmetics) prior ownership server-side.
export async function buyItem(req, res, next) {
  try {
    const itemId = String(req.params.itemId)
    const item = SHOP_CATALOG[itemId]
    if (!item) return res.status(404).json({ message: 'Unknown item.' })

    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'Account not found.' })

    // Cosmetics are one-time purchases.
    if (item.type === 'cosmetic' && user.inventory[item.field]) {
      return res.status(400).json({ message: 'You already own this item.' })
    }
    if ((user.points || 0) < item.price) {
      return res.status(400).json({ message: 'Not enough points.' })
    }

    user.points -= item.price
    if (item.type === 'cosmetic') {
      user.inventory[item.field] = true
    } else {
      user.inventory[item.field] = (user.inventory[item.field] || 0) + 1
    }
    user.markModified('inventory')
    await user.save()
    await logActivity(req.userId, 'shop', `Bought ${item.name}`, -item.price)

    res.json({ ok: true, points: user.points, inventory: user.inventory })
  } catch (error) {
    next(error)
  }
}

// POST /api/shop/use/:itemId - consume one of a held consumable power-up.
// Cosmetics can't be "used"; consumables decrement their counter and must
// have at least one in stock. The effect itself is applied client-side
// during gameplay; this endpoint is the authoritative ledger so a player
// can't spend a power-up they don't own.
export async function useItem(req, res, next) {
  try {
    const itemId = String(req.params.itemId)
    const item = SHOP_CATALOG[itemId]
    if (!item) return res.status(404).json({ message: 'Unknown item.' })
    if (item.type !== 'consumable') {
      return res.status(400).json({ message: 'This item cannot be used.' })
    }

    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'Account not found.' })

    if ((user.inventory[item.field] || 0) < 1) {
      return res.status(400).json({ message: `No ${item.name} left to use.` })
    }

    user.inventory[item.field] -= 1
    user.markModified('inventory')
    await user.save()
    await logActivity(req.userId, 'shop', `Used ${item.name}`, 0)

    res.json({ ok: true, points: user.points, inventory: user.inventory })
  } catch (error) {
    next(error)
  }
}
