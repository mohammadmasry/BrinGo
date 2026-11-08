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
