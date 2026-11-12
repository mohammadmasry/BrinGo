// Bringo currently serves Pfarrkirchen and Postmünster.
export const SERVICE_AREA = { name: 'Pfarrkirchen', zips: ['84347', '84389'] }

// Rough box around Pfarrkirchen, used to lock the map and the address search.
// Covers the town, Reichenberg / Untergrasensee and Postmünster to the west.
export const SERVICE_BOUNDS = { south: 48.405, west: 12.885, north: 48.458, east: 12.995 }
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
  // Whole words only, so street names like "Eggenfeldener Straße" don't count as the town
  const hasWord = (w: string) => new RegExp(`(?<![a-zäöüß])${w}(?![a-zäöüß])`).test(lower)
  return CITY_KEYWORDS.find(e => e.words.some(hasWord))?.zip ?? null
}

/** true = inside, false = known to be outside, null = can't tell from the address. */
export function isInServiceArea(postcode: string | null): boolean | null {
  if (!postcode) return null
  return SERVICE_AREA.zips.includes(postcode)
}
