import { describe, it, expect } from 'vitest'
import { calculatePrice, getUpcomingRounds, localIso } from './pricing'

describe('calculatePrice', () => {
  it('order in a shopping round costs €8.50', () => {
    const r = calculatePrice({ schedule: 'round' })
    expect(r.total).toBe(8.5)
    expect(r.isUrgent).toBe(false)
  })
  it('urgent order costs €15.00', () => {
    const r = calculatePrice({ schedule: 'urgent' })
    expect(r.total).toBe(15)
    expect(r.isUrgent).toBe(true)
  })
  it('total equals the base price (no surcharges)', () => {
    const r = calculatePrice({ schedule: 'round' })
    expect(r.total).toBe(r.base)
  })
})

describe('getUpcomingRounds', () => {
  it('only returns Tuesday and Friday rounds', () => {
    const rounds = getUpcomingRounds(new Date(2026, 10, 8, 10), 6) // Sun 8 Nov 2026
    rounds.forEach(r => expect([2, 5]).toContain(new Date(r.dateIso + 'T12:00:00').getDay()))
  })
  it('lists the next round first', () => {
    const [first] = getUpcomingRounds(new Date(2026, 10, 8, 10)) // Sunday
    expect(first.dateIso).toBe('2026-11-10') // Tuesday
    expect(first.id).toBe('tue')
  })
  it('closes a round at 20:00 the evening before', () => {
    const before = getUpcomingRounds(new Date(2026, 10, 9, 19, 59)) // Mon 19:59
    const after = getUpcomingRounds(new Date(2026, 10, 9, 20, 0))   // Mon 20:00
    expect(before[0].dateIso).toBe('2026-11-10')
    expect(after[0].dateIso).toBe('2026-11-13') // Friday
  })
  it('returns the requested number of rounds', () => {
    expect(getUpcomingRounds(new Date(2026, 10, 8), 4)).toHaveLength(4)
  })
})

describe('localIso', () => {
  it('uses the local date, not UTC', () => {
    expect(localIso(new Date(2026, 0, 1, 0, 30))).toBe('2026-01-01')
  })
})
