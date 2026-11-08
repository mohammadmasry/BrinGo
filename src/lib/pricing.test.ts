import { describe, it, expect } from 'vitest'
import { calculatePrice, getUpcomingRounds, localIso, ROUND_PRICE, URGENT_PRICE } from './pricing'

describe('calculatePrice', () => {
  it('shopping round costs €8.50', () => {
    expect(calculatePrice({ schedule: 'round', orderType: 'shopping' }).total).toBe(8.5)
  })
  it('urgent order costs €15.00', () => {
    const r = calculatePrice({ schedule: 'urgent', orderType: 'shopping' })
    expect(r.total).toBe(15)
    expect(r.isUrgent).toBe(true)
  })
  it('adds €2 per extra store for shopping', () => {
    expect(calculatePrice({ schedule: 'round', orderType: 'shopping', stores: 2 }).total).toBe(10.5)
    expect(calculatePrice({ schedule: 'round', orderType: 'shopping', stores: 3 }).total).toBe(12.5)
  })
  it('caps stores at 3', () => {
    expect(calculatePrice({ schedule: 'round', orderType: 'shopping', stores: 9 }).storesSurcharge).toBe(4)
  })
  it('ignores stores for deliveries', () => {
    expect(calculatePrice({ schedule: 'round', orderType: 'delivery', stores: 3 }).storesSurcharge).toBe(0)
  })
  it('adds €1.50 for large deliveries only', () => {
    expect(calculatePrice({ schedule: 'round', orderType: 'delivery', size: 'L' }).total).toBe(10)
    expect(calculatePrice({ schedule: 'round', orderType: 'delivery', size: 'M' }).total).toBe(ROUND_PRICE)
    expect(calculatePrice({ schedule: 'round', orderType: 'shopping', size: 'L' }).total).toBe(ROUND_PRICE)
  })
  it('total equals sum of components', () => {
    const r = calculatePrice({ schedule: 'urgent', orderType: 'delivery', size: 'L' })
    expect(r.total).toBe(URGENT_PRICE + r.largeSurcharge)
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
