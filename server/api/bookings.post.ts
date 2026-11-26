
import { createError, defineEventHandler, readBody } from 'h3'
import { bookingCreateSchema, calculateNights, isValidDateOnly } from '../utils/booking-validation'
import { getD1 } from '../utils/d1'

interface VillaRow {
  id: number
  name: string
  price_per_night: number
  capacity: number
  is_active: number
}

interface InsertedBooking {
  id: number
  booking_code: string
}

export default defineEventHandler(async (event) => {
  const body: unknown = await readBody(event)

  // 1. Validasi bentuk dan tipe data.
  const parsed = bookingCreateSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Data reservasi tidak valid.',
      data: {
        fieldErrors: parsed.error.flatten().fieldErrors
      }
    })
  }

  const input = parsed.data

  // 2. Validasi tanggal kalender.
  if (
    !isValidDateOnly(input.checkIn) ||
    !isValidDateOnly(input.checkOut)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tanggal reservasi tidak valid.'
    })
  }

  const nights = calculateNights(input.checkIn, input.checkOut)

  if (nights < 1 || !Number.isInteger(nights)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Check-out harus setelah check-in.'
    })
  }

  // 3. Ambil database D1 dari binding Cloudflare.
  const db = getD1(event)

  // 4. Ambil data villa dari D1.
  const villa = await db.prepare(`
    SELECT
      id,
      name,
      price_per_night,
      capacity,
      is_active
    FROM villas
    WHERE id = ?
    LIMIT 1
  `)
    .bind(input.villaId)
    .first<VillaRow>()

  if (!villa || villa.is_active !== 1) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Villa tidak ditemukan atau tidak aktif.'
    })
  }

  // 5. Pastikan jumlah tamu sesuai kapasitas.
  if (input.guestCount > villa.capacity) {
    throw createError({
      statusCode: 400,
      statusMessage: `Kapasitas villa maksimal ${villa.capacity} orang.`
    })
  }

  // 6. Harga selalu dihitung dari database.
  const totalPrice = villa.price_per_night * nights

  // 7. Buat kode reservasi unik.
  const bookingCode = `VILLA-${crypto.randomUUID()
    .replaceAll('-', '')
    .slice(0, 12)
    .toUpperCase()}`

  const now = new Date().toISOString()

  // 8. Insert hanya jika tidak ada booking yang bertabrakan.
  //
  // Kondisi bentrokan:
  // booking lama check_in < check_out baru
  // DAN booking lama check_out > check_in baru.
  //
  // Satu statement INSERT ... SELECT ini membuat pemeriksaan
  // dan penulisan berlangsung sebagai satu operasi database.
  const inserted = await db.prepare(`
    INSERT INTO bookings (
      booking_code,
      villa_id,
      guest_name,
      guest_email,
      guest_phone,
      check_in,
      check_out,
      guest_count,
      special_request,
      total_price,
      status,
      created_at,
      updated_at
    )
    SELECT
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      'pending', ?, ?
    WHERE NOT EXISTS (
      SELECT 1
      FROM bookings
      WHERE villa_id = ?
        AND status IN ('pending', 'confirmed')
        AND check_in < ?
        AND check_out > ?
    )
    RETURNING id, booking_code
  `)
    .bind(
      bookingCode,
      villa.id,
      input.guestName,
      input.guestEmail,
      input.guestPhone,
      input.checkIn,
      input.checkOut,
      input.guestCount,
      input.specialRequest ?? null,
      totalPrice,
      now,
      now,
      villa.id,
      input.checkOut,
      input.checkIn
    )
    .first<InsertedBooking>()

  // 9. Jika INSERT tidak menghasilkan baris,
  // berarti tanggal sudah dipesan.
  if (!inserted) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Maaf, villa sudah dipesan pada tanggal tersebut. Silakan pilih tanggal lain.'
    })
  }

  // 10. Kembalikan data reservasi.
  return {
    success: true,
    message: 'Reservasi berhasil dibuat.',
    data: {
      id: inserted.id,
      bookingCode: inserted.booking_code,
      villaId: villa.id,
      villaName: villa.name,
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      guestPhone: input.guestPhone,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      nights,
      guestCount: input.guestCount,
      specialRequest: input.specialRequest ?? null,
      totalPrice,
      status: 'pending',
      createdAt: now
    }
  }
})
