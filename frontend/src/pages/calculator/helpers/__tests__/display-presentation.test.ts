import { describe, expect, it } from 'vitest'

import {
  getDisplayPresentation,
  getHistoryPresentation,
} from '@/pages/calculator/helpers/display-presentation'

describe('display presentation', () => {
  it('returns short values unchanged', () => {
    expect(getDisplayPresentation('123.45')).toBe('123.45')
  })

  it('truncates decimals to 5 places', () => {
    expect(getDisplayPresentation('0.14285714285714285')).toBe('0.14285')
    expect(getDisplayPresentation('1.999999999')).toBe('1.99999')
  })

  it('returns integers unchanged regardless of length', () => {
    expect(getDisplayPresentation('123456789012345')).toBe('123456789012345')
  })

  it('returns expressions and scientific notation unchanged', () => {
    expect(getDisplayPresentation('1 + 2.1234567')).toBe('1 + 2.1234567')
    expect(getDisplayPresentation('1.234567e+8')).toBe('1.234567e+8')
  })

  it('returns 0 for empty string', () => {
    expect(getDisplayPresentation('')).toBe('0')
  })

  it('trims long history strings from the left', () => {
    expect(getHistoryPresentation('123456789012 + 9876543210 =')).toBe(
      '…789012 + 9876543210',
    )
  })

  it('strips trailing equals from history', () => {
    expect(getHistoryPresentation('5 + 3 =')).toBe('5 + 3')
  })

  it('returns empty string for null resolved expression', () => {
    expect(getHistoryPresentation(null)).toBe('')
  })
})
