
import { describe, it, expect } from 'vitest'

import {
  generateSessionToken,
  hashSessionToken,
  getSessionExpiry,
  getSessionDuration,
} from './admin-session'

describe('Admin Session', () => {
  it('berhasil membuat session token', () => {
    const token = generateSessionToken()

    expect(token).toBeTruthy()
    expect(typeof token).toBe('string')
  })

  it('menghasilkan token dengan format Base64 URL-safe', () => {
    const token = generateSessionToken()

    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('menghasilkan token berbeda setiap kali dibuat', () => {
    const firstToken = generateSessionToken()
    const secondToken = generateSessionToken()

    expect(firstToken).not.toBe(secondToken)
  })

  it('menghasilkan hash yang konsisten untuk token yang sama', async () => {
    const token = generateSessionToken()

    const firstHash = await hashSessionToken(token)
    const secondHash = await hashSessionToken(token)

    expect(firstHash).toBe(secondHash)
  })

  it('menghasilkan hash berbeda untuk token berbeda', async () => {
    const firstToken = generateSessionToken()
    const secondToken = generateSessionToken()

    const firstHash = await hashSessionToken(firstToken)
    const secondHash = await hashSessionToken(secondToken)

    expect(firstHash).not.toBe(secondHash)
  })

  it('menghasilkan session dengan masa berlaku tujuh hari', () => {
    expect(getSessionDuration()).toBe(7 * 24 * 60 * 60)
  })

  it('menghasilkan waktu kedaluwarsa yang benar', () => {
    const before = Date.now()

    const expiry = getSessionExpiry()

    const after = Date.now()

    const expiryTime = new Date(expiry).getTime()

    const sevenDays = 7 * 24 * 60 * 60 * 1000

    expect(expiryTime).toBeGreaterThanOrEqual(before + sevenDays)
    expect(expiryTime).toBeLessThanOrEqual(after + sevenDays)
  })
})
