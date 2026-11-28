import { z } from 'zod'

export const bookingCreateSchema = z
  .strictObject({
    villaId: z.number().int().positive(),

    guestName: z
      .string()
      .trim()
      .min(2, 'Nama minimal 2 karakter.')
      .max(100, 'Nama maksimal 100 karakter.'),

    guestEmail: z
      .string()
      .trim()
      .max(254, 'Email terlalu panjang.')
      .refine(
        (value) => value === '' || z.email().safeParse(value).success,
        'Format email tidak valid.'
      ),

    guestPhone: z
      .string()
      .trim()
      .min(8, 'Nomor telepon minimal 8 karakter.')
      .max(20, 'Nomor telepon maksimal 20 karakter.'),

    checkIn: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format check-in harus YYYY-MM-DD.')
      .refine(isValidDateOnly, 'Tanggal check-in tidak valid.'),

    checkOut: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format check-out harus YYYY-MM-DD.')
      .refine(isValidDateOnly, 'Tanggal check-out tidak valid.'),

    guestCount: z.number().int().positive(),

    specialRequest: z
      .string()
      .trim()
      .max(1000, 'Permintaan khusus maksimal 1000 karakter.')
      .nullable()
      .optional()
  })
  .refine(
    (data) => calculateNights(data.checkIn, data.checkOut) > 0,
    {
      message: 'Tanggal check-out harus setelah check-in.',
      path: ['checkOut']
    }
  )

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>

export function isValidDateOnly(value: string): boolean {
  const date = new Date(`${value}T00:00:00.000Z`)

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  )
}

export function calculateNights(
  checkIn: string,
  checkOut: string
): number {
  const start = Date.parse(`${checkIn}T00:00:00.000Z`)
  const end = Date.parse(`${checkOut}T00:00:00.000Z`)

  return (end - start) / (1000 * 60 * 60 * 24)
}
