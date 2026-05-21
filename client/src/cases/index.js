// All five scripted cases keyed by case id. Play.jsx routes to
// /case/:id, which uses this map to load the right script.

import case1 from './case-1-bait.js'
import case2 from './case-2-network.js'
import case3 from './case-3-insider.js'
import case4 from './case-4-hotspot.js'
import case5 from './case-5-mirage.js'

const CASES = { 1: case1, 2: case2, 3: case3, 4: case4, 5: case5 }

export function getCase(id) {
  return CASES[String(id)] || null
}

export default CASES
