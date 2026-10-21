import { describe, expect, it } from 'vitest'
import { TOUR_STEPS, isDesktop, mobileHint, progressLabel, selectorsFor, shouldAutoStart } from '../tour'

describe('tour', () => {
  it('has 5 or 6 steps, each with English and Arabic text and selectors', () => {
    expect(TOUR_STEPS.length).toBeGreaterThanOrEqual(5)
    expect(TOUR_STEPS.length).toBeLessThanOrEqual(6)
    for (const s of TOUR_STEPS) {
      expect(s.title && s.titleAr && s.body && s.bodyAr).toBeTruthy()
      expect(s.desktop.length).toBeGreaterThan(0)
      expect(s.mobile.length).toBeGreaterThan(0)
    }
  })
  it('mentions login and newsletter', () => {
    const ids = TOUR_STEPS.map((s) => s.id)
    expect(ids).toContain('login')
    expect(ids).toContain('newsletter')
  })
  it('switches selectors by width', () => {
    expect(isDesktop(1024)).toBe(true)
    expect(isDesktop(500)).toBe(false)
    expect(selectorsFor(TOUR_STEPS[0], 1280)[0]).toContain('/products')
    expect(selectorsFor(TOUR_STEPS[0], 400)[0]).toContain('Toggle menu')
  })
  it('hints about the menu on mobile only (not for newsletter)', () => {
    expect(mobileHint(TOUR_STEPS[0], 400)).not.toBeNull()
    expect(mobileHint(TOUR_STEPS[0], 1280)).toBeNull()
    expect(mobileHint(TOUR_STEPS[5], 400)).toBeNull()
  })
  it('auto-starts only on the homepage and only once', () => {
    expect(shouldAutoStart('/', null)).toBe(true)
    expect(shouldAutoStart('/', '1')).toBe(false)
    expect(shouldAutoStart('/products', null)).toBe(false)
    expect(shouldAutoStart('/admin', null)).toBe(false)
  })
  it('formats progress', () => { expect(progressLabel(0, 6)).toBe('1 / 6') })
})
