import User from '../models/User.js'
import { logActivity } from '../services/activityService.js'

// Shop catalog. Locked to the inventory schema on User: consumables share
// their id with the inventory field, cosmetics map to a *Owned boolean.
// Defined here (not in the DB) because the set is small and curated -
// any change is a code change that goes through review.
export const CATALOG = [
  {
    id: 'magnifier',
    name: 'Magnifier',
    kind: 'consumable',
    price: 100,
    description: 'Remove one wrong answer from a quiz question.',
  },
  {
    id: 'time',
    name: 'Extra Time',
    kind: 'consumable',
    price: 80,
    description: 'Add 30 seconds to a timed case.',
  },
  {
    id: 'second',
    name: 'Second Chance',
    kind: 'consumable',
    price: 150,
    description: 'Replay one failed case attempt.',
  },
  {
    id: 'hint',
    name: 'Hint Token',
    kind: 'consumable',
    price: 60,
    description: 'Reveal a hint on the current case.',
  },
  {
    id: 'skin',
    name: 'Neon Skin',
    kind: 'cosmetic',
    price: 1000,
    description: 'Cyber-neon avatar skin.',
    inventoryField: 'skinOwned',
  },
  {
    id: 'badge',
    name: 'Founder Badge',
    kind: 'cosmetic',
    price: 800,
    description: 'Limited-edition profile badge.',
    inventoryField: 'badgeOwned',
  },
  {
    id: 'title',
    name: 'Director Title',
    kind: 'cosmetic',
    price: 1200,
    description: 'Show "Director" next to your name.',
    inventoryField: 'titleOwned',
  },
]

const BY_ID = new Map(CATALOG.map((item) => [item.id, item]))

// GET /api/shop - returns the catalog along with the signed-in player's
// current points balance and inventory, so the client can render the
// grid in a single request.
export async function getCatalog(req, res, next) {
  try {
    const user = await User.findById(req.userId).select('points inventory')
    if (!user) return res.status(404).json({ message: 'Account not found.' })
    res.json({
      items: CATALOG,
      points: user.points || 0,
      inventory: user.inventory || {},
    })
  } catch (error) {
    next(error)
  }
}

// POST /api/shop/buy/:itemId - spend points, then increment a consumable
// count or flip a cosmetic boolean. Refuses cosmetics already owned and
// any purchase the player can't afford.
export async function buyItem(req, res, next) {
  try {
    const item = BY_ID.get(req.params.itemId)
    if (!item) return res.status(404).json({ message: 'Unknown item.' })

    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'Account not found.' })

    if (item.kind === 'cosmetic' && user.inventory?.[item.inventoryField]) {
      return res.status(409).json({ message: 'You already own that.' })
    }
    if ((user.points || 0) < item.price) {
      return res.status(402).json({ message: 'Not enough points.' })
    }

    user.points -= item.price
    if (item.kind === 'cosmetic') {
      user.inventory[item.inventoryField] = true
    } else {
      user.inventory[item.id] = (user.inventory[item.id] || 0) + 1
    }
    await user.save()
    await logActivity(
      req.userId,
      'shop',
      `Bought ${item.name}`,
      -item.price,
    )

    res.json({
      ok: true,
      points: user.points,
      inventory: user.inventory,
    })
  } catch (error) {
    next(error)
  }
}
