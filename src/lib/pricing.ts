// Bringo pricing — shared shopping rounds in Pfarrkirchen.
//
// One courier serves 3–4 customers per round, so the courier cost per order
// is ~€7 instead of ~€14 for a dedicated trip. Urgent orders get a dedicated
// trip and are priced to cover it.

export const ROUND_PRICE = 8.50      // per order in a shared shopping round
export const URGENT_PRICE = 15.00    // dedicated trip, within ~45 min
export const EXTRA_STORE_FEE = 2.00  // per additional store (shopping only)
export const LARGE_ITEM_FEE = 1.50   // large / heavy item (delivery only)
export const MAX_STORES = 3

// Membership (shown as info; billed outside the app for now)
export const MEMBERSHIP_MONTHLY = { regular: 5.00, reduced: 3.00 }

export type Schedule = 'round' | 'urgent'
export type OrderType = 'shopping' | 'delivery'
export type RoundId = 'tue' | 'fri'

export interface ShoppingRound {
  id: RoundId
  weekday: number   // 0 = Sunday … 6 = Saturday
  start: number     // 24h hour
  end: number
}

export const ROUNDS: ShoppingRound[] = [
  { id: 'tue', weekday: 2, start: 9, end: 12 },
  { id: 'fri', weekday: 5, start: 9, end: 12 },
]

// Orders for a round close the evening before at this hour.
export const ORDER_CUTOFF_HOUR = 20

export interface UpcomingRound {
  id: RoundId
  dateIso: string   // local date, YYYY-MM-DD
  start: number
  end: number
  label: string     // "09:00 – 12:00"
  cutoff: Date
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Local calendar date as YYYY-MM-DD (toISOString would use UTC). */
export function localIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function roundLabel(r: { start: number; end: number }): string {
  return `${pad(r.start)}:00 – ${pad(r.end)}:00`
}

/** The next `count` rounds that can still be booked at `now`. */
export function getUpcomingRounds(now: Date = new Date(), count = 4): UpcomingRound[] {
  const result: UpcomingRound[] = []
  for (let i = 0; i < 28 && result.length < count; i++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)
    const round = ROUNDS.find(r => r.weekday === day.getDay())
    if (!round) continue
    const cutoff = new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1, ORDER_CUTOFF_HOUR)
    if (now >= cutoff) continue
    result.push({ id: round.id, dateIso: localIso(day), start: round.start, end: round.end, label: roundLabel(round), cutoff })
  }
  return result
}

export interface PriceBreakdown {
  base: number
  storesSurcharge: number
  largeSurcharge: number
  total: number
  isUrgent: boolean
}

export function calculatePrice(opts: {
  schedule: Schedule
  orderType: OrderType
  size?: 'S' | 'M' | 'L'
  stores?: number
}): PriceBreakdown {
  const isUrgent = opts.schedule === 'urgent'
  const base = isUrgent ? URGENT_PRICE : ROUND_PRICE
  const stores = Math.min(Math.max(opts.stores ?? 1, 1), MAX_STORES)
  const storesSurcharge = opts.orderType === 'shopping' ? (stores - 1) * EXTRA_STORE_FEE : 0
  const largeSurcharge = opts.orderType === 'delivery' && opts.size === 'L' ? LARGE_ITEM_FEE : 0
  return {
    base,
    storesSurcharge,
    largeSurcharge,
    total: Math.round((base + storesSurcharge + largeSurcharge) * 100) / 100,
    isUrgent,
  }
}

// Approximate GPS coords for preset Pfarrkirchen addresses (used for courier ETA)
const COORDS: Record<string, [number, number]> = {
  'CAMPUS Pfarrkirchen, Petersbogen 1':    [48.4247, 12.9398],
  'Bahnhof Pfarrkirchen, Bahnhofstr. 1':   [48.4320, 12.9307],
  'Edeka, Griesbacher Str. 3':             [48.4298, 12.9345],
  'Stadtplatz 1, 84347 Pfarrkirchen':      [48.4307, 12.9378],
  'Stadtplatz 12, 84347 Pfarrkirchen':     [48.4307, 12.9380],
  'Ludwigstraße 8, 84347 Pfarrkirchen':    [48.4315, 12.9365],
  'Ringstraße 44, 84347 Pfarrkirchen':     [48.4290, 12.9340],
  'Kirchgasse 5, 84347 Pfarrkirchen':      [48.4312, 12.9371],
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function pseudoKm(a: string, b: string): number {
  const str = a + b
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) & 0xffffff
  return 0.5 + (hash % 25) / 10 // 0.5–2.9 km (Pfarrkirchen is small)
}

export function estimateKm(pickup: string, dropoff: string): number {
  const c1 = COORDS[pickup]
  const c2 = COORDS[dropoff]
  if (c1 && c2) return haversineKm(c1[0], c1[1], c2[0], c2[1])
  return pseudoKm(pickup, dropoff)
}
