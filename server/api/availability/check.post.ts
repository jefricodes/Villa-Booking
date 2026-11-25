
import { z } from 'zod'

import { getD1 } from '../../utils/d1'


// ======================================
// 1. VALIDASI TANGGAL
// ======================================

function isValidDateOnly(value: string): boolean {

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const [year=0, month=1, day=1] = value
    .split('-')
    .map(Number)

  const date = new Date(
    Date.UTC(year, month - 1, day)
  )

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )

}


// ======================================
// 2. VALIDASI REQUEST BODY
// ======================================

const availabilitySchema = z.strictObject({

  villaId: z
    .number()
    .int()
    .positive(),

  checkIn: z
    .string()
    .refine(
      isValidDateOnly,
      'Tanggal check-in tidak valid.'
    ),

  checkOut: z
    .string()
    .refine(
      isValidDateOnly,
      'Tanggal check-out tidak valid.'
    )

})


// ======================================
// 3. TIPE DATA DATABASE
// ======================================

interface VillaPriceRow {

  id: number

  name: string

  capacity: number

  pricePerNight: number

}


// ======================================
// 4. API HANDLER
// ======================================

export default defineEventHandler(async (event) => {

  // Membaca request
  const body = await readBody<unknown>(event)


  // Menjalankan validasi
  const parsed = availabilitySchema.safeParse(body)


  if (!parsed.success) {

    throw createError({

      statusCode: 400,

      statusMessage: 'Data reservasi tidak valid.',

      data: {
        issues: parsed.error.issues
      }

    })

  }


  const {
    villaId,
    checkIn,
    checkOut
  } = parsed.data


  // Memastikan checkout setelah checkin
  if (checkOut <= checkIn) {

    throw createError({

      statusCode: 400,

      statusMessage:
        'Check-out harus setelah check-in.'

    })

  }


  // Mengambil database D1
  const db = getD1(event)


  // ==================================
  // 5. MENCARI VILLA
  // ==================================

  const villa = await db.prepare(`

    SELECT

      id,

      name,

      capacity,

      price_per_night AS pricePerNight

    FROM villas

    WHERE id = ?

      AND is_active = 1

  `)
    .bind(villaId)
    .first<VillaPriceRow>()


  if (!villa) {

    throw createError({

      statusCode: 404,

      statusMessage: 'Villa tidak ditemukan atau tidak aktif.'

    })

  }


  // ==================================
  // 6. MEMERIKSA BENTROK D1
  // ==================================

  const conflict = await db.prepare(`

    SELECT id

    FROM bookings

    WHERE villa_id = ?

      AND status IN ('pending', 'confirmed')

      AND check_in < ?

      AND check_out > ?

    LIMIT 1

  `)
    .bind(
      villaId,
      checkOut,
      checkIn
    )
    .first<{ id: number }>()


  // ==================================
  // 7. MENGHITUNG JUMLAH MALAM
  // ==================================

  const start = Date.parse(
    `${checkIn}T00:00:00.000Z`
  )

  const end = Date.parse(
    `${checkOut}T00:00:00.000Z`
  )

  const nights = (end - start) / 86400000


  // ==================================
  // 8. MENGHITUNG HARGA
  // ==================================

  const totalPrice =
    nights * villa.pricePerNight


  // ==================================
  // 9. RESPONSE
  // ==================================

  const available = !conflict

  return {

    success: true,

    available,

    message: available

      ? 'Tanggal tersedia berdasarkan data database.'
      : 'Tanggal bertabrakan dengan reservasi lain.',

    villa: {
      id: villa.id,
      name: villa.name,
      capacity: villa.capacity
    },

    stay: {
      checkIn,
      checkOut,
      nights
    },

    price: {
      perNight: villa.pricePerNight,
      totalPrice
    }

  }

})
