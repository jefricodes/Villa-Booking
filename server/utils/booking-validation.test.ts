
import { describe, it, expect } from 'vitest'

import {
  bookingCreateSchema,
  isValidDateOnly,
  calculateNights
} from './booking-validation'

const validBooking = {
  villaId: 1,
  guestName: 'Budi Santoso',
  guestEmail: 'budi@example.com',
  guestPhone: '081234567890',
  checkIn: '2026-12-10',
  checkOut: '2026-12-13',
  guestCount: 2
}

describe('bookingCreateSchema', () => {
  it('menerima data booking yang valid', () => {
    const result = bookingCreateSchema.safeParse(validBooking)

    expect(result.success).toBe(true)
  })

  it('menolak nama yang terlalu pendek', () => {
    const result = bookingCreateSchema.safeParse({
      ...validBooking,
      guestName: 'B'
    })

    expect(result.success).toBe(false)
  })

  it('menolak format email yang salah', () => {
    const result = bookingCreateSchema.safeParse({
      ...validBooking,
      guestEmail: 'email-salah'
    })

    expect(result.success).toBe(false)
  })

  it('menerima email kosong', () => {
    const result = bookingCreateSchema.safeParse({
      ...validBooking,
      guestEmail: ''
    })

    expect(result.success).toBe(true)
  })

  it('menolak data dengan properti tambahan', () => {
    const result = bookingCreateSchema.safeParse({
      ...validBooking,
      unknownField: 'tidak diizinkan'
    })

    expect(result.success).toBe(false)
  })
})

describe('isValidDateOnly', () => {
  it('menerima tanggal yang valid', () => {
    expect(isValidDateOnly('2026-12-10')).toBe(true)
  })

  it('menolak tanggal yang tidak ada di kalender', () => {
    expect(isValidDateOnly('2026-02-30')).toBe(false)
  })

  it('menolak format tanggal yang salah', () => {
    expect(isValidDateOnly('10-12-2026')).toBe(false)
  })
})

describe('calculateNights', () => {
  it('menghitung jumlah malam dengan benar', () => {
    expect(
      calculateNights('2026-12-10', '2026-12-13')
    ).toBe(3)
  })

  it('menghasilkan nol jika tanggal sama', () => {
    expect(
      calculateNights('2026-12-10', '2026-12-10')
    ).toBe(0)
  })
})


it('menolak tanggal check-in yang tidak valid', () => {
  const result = bookingCreateSchema.safeParse({
    ...validBooking,
    checkIn: '2026-02-30'
  })

  expect(result.success).toBe(false)
})

it('menolak check-out sebelum check-in', () => {
  const result = bookingCreateSchema.safeParse({
    ...validBooking,
    checkOut: '2026-12-09'
  })

  expect(result.success).toBe(false)
})

it('menolak check-in dan check-out pada tanggal yang sama', () => {
  const result = bookingCreateSchema.safeParse({
    ...validBooking,
    checkOut: validBooking.checkIn
  })

  expect(result.success).toBe(false)
})