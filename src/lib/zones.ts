// Bringo currently serves Pfarrkirchen only.
export const SERVICE_AREA = { name: 'Pfarrkirchen', zips: ['84347'] }

// Rough box around Pfarrkirchen, used to lock the map and the address search.
// Covers the town plus Reichenberg / Untergrasensee, and leaves out Postmünster to the west.
export const SERVICE_BOUNDS = { south: 48.410, west: 12.915, north: 48.452, east: 12.985 }
export const SERVICE_BBOX = `${SERVICE_BOUNDS.west},${SERVICE_BOUNDS.south},${SERVICE_BOUNDS.east},${SERVICE_BOUNDS.north}`

// Nearby towns are recognised so we can tell customers they're outside the area.
const CITY_KEYWORDS: { words: string[]; zip: string }[] = [
  { words: ['bad birnbach', 'birnbach'],     zip: '84364' },
  { words: ['eggenfelden'],                  zip: '84307' },
  { words: ['postmünster', 'postmuenster'],  zip: '84389' },
  { words: ['pfarrkirchen'],                 zip: '84347' },
]

export function detectPostcode(address: string): string | null {
  const explicit = address.match(/\b(\d{5})\b/)
  if (explicit) return explicit[1]
  const lower = address.toLowerCase()
  return CITY_KEYWORDS.find(e => e.words.some(w => lower.includes(w)))?.zip ?? null
}

/** true = inside, false = known to be outside, null = can't tell from the address. */
export function isInServiceArea(postcode: string | null): boolean | null {
  if (!postcode) return null
  return SERVICE_AREA.zips.includes(postcode)
}
