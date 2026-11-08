// Bringo currently serves Pfarrkirchen only.
export const SERVICE_AREA = { name: 'Pfarrkirchen', zips: ['84347'] }

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
