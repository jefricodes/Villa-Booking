
import { describe, it, expect } from 'vitest'

import {
  createPasswordHash,
  verifyPassword,
} from './password'

describe('Password Hash', () => {
  it('berhasil membuat password hash', async () => {
    const result = await createPasswordHash(
      'VillaAdmin2026!',
    )

    expect(result.hash).toBeTruthy()
    expect(result.salt).toBeTruthy()
    expect(result.iterations).toBeGreaterThan(0)
  })

  it('berhasil memverifikasi password yang benar', async () => {
    const password = 'VillaAdmin2026!'

    const result = await createPasswordHash(password)

    const isValid = await verifyPassword(
      password,
      result.hash,
      result.salt,
      result.iterations,
    )

    expect(isValid).toBe(true)
  })

  it('menolak password yang salah', async () => {
    const result = await createPasswordHash(
      'VillaAdmin2026!',
    )

    const isValid = await verifyPassword(
      'PasswordYangSalah!',
      result.hash,
      result.salt,
      result.iterations,
    )

    expect(isValid).toBe(false)
  })

  it('menghasilkan hash berbeda untuk password yang sama', async () => {
    const password = 'VillaAdmin2026!'

    const first = await createPasswordHash(password)
    const second = await createPasswordHash(password)

    expect(first.salt).not.toBe(second.salt)
    expect(first.hash).not.toBe(second.hash)
  })

  it('menolak password kosong', async () => {
    await expect(
      createPasswordHash(''),
    ).rejects.toThrow('Password tidak boleh kosong.')
  })

  it('menolak password yang hanya berisi spasi', async () => {
    await expect(
      createPasswordHash('   '),
    ).rejects.toThrow('Password tidak boleh kosong.')
  })
})
