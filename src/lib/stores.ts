// Stores in Pfarrkirchen and Postmünster shown on the delivery map.
// Locations come from OpenStreetMap (© OpenStreetMap contributors, ODbL), queried Nov 2026.
// Badges use approximate brand colours with the store name as text. They are not the official logos.

export type StoreCategory = 'supermarket' | 'drugstore' | 'diy' | 'variety'

export interface Store {
  id: string
  name: string         // full name, used as pickup address
  label: string        // short text on the map badge
  category: StoreCategory
  lat: number
  lon: number
  bg: string           // badge background
  fg: string           // badge text colour
}

export const CATEGORY_ICON: Record<StoreCategory, string> = {
  supermarket: '🛒',
  drugstore: '🧴',
  diy: '🔨',
  variety: '🏷️',
}

export const STORES: Store[] = [
  // Supermarkets
  { id: 'kaufland', name: 'Kaufland Pfarrkirchen',     label: 'Kaufland', category: 'supermarket', lat: 48.41754, lon: 12.94238, bg: '#e10915', fg: '#ffffff' },
  { id: 'lidl',     name: 'Lidl Pfarrkirchen',         label: 'LIDL',     category: 'supermarket', lat: 48.41781, lon: 12.93959, bg: '#0050aa', fg: '#fff000' },
  { id: 'aldi',     name: 'Aldi Süd Pfarrkirchen',     label: 'ALDI',     category: 'supermarket', lat: 48.42529, lon: 12.94186, bg: '#00005f', fg: '#ffffff' },
  { id: 'norma',    name: 'Norma Pfarrkirchen',        label: 'NORMA',    category: 'supermarket', lat: 48.43153, lon: 12.93597, bg: '#ffffff', fg: '#d6001c' },
  { id: 'netto',    name: 'Netto Pfarrkirchen',        label: 'Netto',    category: 'supermarket', lat: 48.43252, lon: 12.95402, bg: '#ffe500', fg: '#d6001c' },
  { id: 'edeka',    name: 'Edeka Heizmann Pfarrkirchen', label: 'EDEKA',  category: 'supermarket', lat: 48.44228, lon: 12.93427, bg: '#ffd400', fg: '#1c4594' },
  { id: 'rewe',     name: 'REWE Pfarrkirchen',         label: 'REWE',     category: 'supermarket', lat: 48.44423, lon: 12.93380, bg: '#cc071e', fg: '#ffffff' },
  { id: 'penny',    name: 'PENNY Pfarrkirchen',        label: 'PENNY',    category: 'supermarket', lat: 48.44510, lon: 12.93352, bg: '#cd1414', fg: '#ffffff' },
  // Drugstores
  { id: 'dm',       name: 'dm Pfarrkirchen',           label: 'dm',       category: 'drugstore',   lat: 48.41925, lon: 12.94284, bg: '#ffffff', fg: '#002878' },
  { id: 'mueller',  name: 'Müller Pfarrkirchen',       label: 'Müller',   category: 'drugstore',   lat: 48.41881, lon: 12.94130, bg: '#f39200', fg: '#ffffff' },
  // Variety / department stores
  { id: 'tedi',     name: 'TEDi Pfarrkirchen',         label: 'TEDi',     category: 'variety',     lat: 48.41872, lon: 12.93979, bg: '#e2001a', fg: '#ffffff' },
  { id: 'action',   name: 'Action Pfarrkirchen',       label: 'Action',   category: 'variety',     lat: 48.43079, lon: 12.93228, bg: '#0072ce', fg: '#ffffff' },
  { id: 'woolworth', name: 'Woolworth Pfarrkirchen',   label: 'Woolworth', category: 'variety',    lat: 48.41767, lon: 12.94306, bg: '#ffffff', fg: '#003a70' },
  // DIY / Baumarkt
  { id: 'segl',     name: 'Baumarkt Segl Pfarrkirchen', label: 'Segl',    category: 'diy',         lat: 48.41608, lon: 12.93967, bg: '#1f2937', fg: '#ffffff' },
  { id: 'baywa',    name: 'BayWa Bau- & Gartenmarkt Pfarrkirchen', label: 'BayWa', category: 'diy', lat: 48.41698, lon: 12.93896, bg: '#00843d', fg: '#ffffff' },
  { id: 'sonderpreis', name: 'Sonderpreis Baumarkt Pfarrkirchen', label: 'Sonderpreis', category: 'diy', lat: 48.41890, lon: 12.94011, bg: '#ffd500', fg: '#1f2937' },
]
