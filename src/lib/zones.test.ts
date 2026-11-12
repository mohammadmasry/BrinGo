import { describe, it, expect } from 'vitest'
import { detectPostcode, isInServiceArea } from './zones'

describe('detectPostcode', () => {
  it('extracts explicit 5-digit zip from address string', () => {
    expect(detectPostcode('Musterstraße 1, 84347 Pfarrkirchen')).toBe('84347')
  })
  it('detects Pfarrkirchen by city keyword', () => {
    expect(detectPostcode('Stadtplatz, Pfarrkirchen')).toBe('84347')
  })
  it('detects nearby towns by keyword', () => {
    expect(detectPostcode('Kurstraße 5, Bad Birnbach')).toBe('84364')
    expect(detectPostcode('Eggenfelden')).toBe('84307')
    expect(detectPostcode('Postmünster')).toBe('84389')
  })
  it('prefers explicit zip over keyword match', () => {
    expect(detectPostcode('84364 Pfarrkirchen')).toBe('84364')
  })
  it('returns null for unknown address', () => {
    expect(detectPostcode('Ringstraße 44')).toBeNull()
  })
  it('ignores town names inside street names', () => {
    expect(detectPostcode('Eggenfeldener Str. 6, Pfarrkirchen')).toBe('84347')
    expect(detectPostcode('Birnbacher Straße 2')).toBeNull()
  })
  it('accepts every store and food place on the map', async () => {
    const { STORES } = await import('./stores')
    for (const s of STORES) expect(isInServiceArea(detectPostcode(s.name)), s.name).not.toBe(false)
  })
  it('is case-insensitive', () => {
    expect(detectPostcode('BAD BIRNBACH')).toBe('84364')
  })
})

describe('isInServiceArea', () => {
  it('accepts Pfarrkirchen and Postmünster', () => {
    expect(isInServiceArea('84347')).toBe(true)
    expect(isInServiceArea('84389')).toBe(true)
  })
  it('rejects other towns', () => {
    expect(isInServiceArea('84364')).toBe(false)
    expect(isInServiceArea('84307')).toBe(false)
  })
  it('returns null when unknown', () => {
    expect(isInServiceArea(null)).toBeNull()
  })
})
