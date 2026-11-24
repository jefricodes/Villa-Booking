
import { villas } from '#shared/data/villas'

import { demoBookings } from '#shared/data/demo-bookings'


// ======================================
// 1. MEMVALIDASI FORMAT TANGGAL
// ======================================

function isValidDateOnly(
  value: unknown
): value is string {

  // Harus berupa teks
  if (typeof value !== 'string') {
    return false
  }

  // Format harus YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  // Pecah tanggal menjadi angka
  const [year=0, month=1, day=1] = value
    .split('-')
    .map(Number)

  // Buat tanggal UTC
  const date = new Date(
    Date.UTC(year, month - 1, day)
  )

  // Pastikan tanggal benar-benar valid
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )

}


// ======================================
// 2. MENGHITUNG JUMLAH MALAM
// ======================================

function calculateNights(
  checkIn: string,
  checkOut: string
): number {

  const start = Date.parse(
    `${checkIn}T00:00:00.000Z`
  )

  const end = Date.parse(
    `${checkOut}T00:00:00.000Z`
  )

  return (end - start) / 86400000

}


// ======================================
// 3. MEMBUAT API HANDLER
// ======================================

export default defineEventHandler(async (event) => {


  // ----------------------------------
  // A. MEMBACA REQUEST BODY
  // ----------------------------------

  const body = await readBody<unknown>(event)


  // Pastikan body berbentuk object
  if (
    body === null ||
    typeof body !== 'object' ||
    Array.isArray(body)
  ) {

    throw createError({
      status: 400,
      statusText: 'Request body harus berupa JSON object.'
    })

  }


  // Mengubah body menjadi object
  const payload = body as Record<string, unknown>


  // Mengambil data dari request
  const villaId = payload.villaId

  const checkIn = payload.checkIn

  const checkOut = payload.checkOut


  // ----------------------------------
  // B. VALIDASI VILLA ID
  // ----------------------------------

  if (
    typeof villaId !== 'number' ||
    !Number.isSafeInteger(villaId)
  ) {

    throw createError({
      status: 400,
      statusMessage: 'Villa ID tidak valid.'
    })

  }


  // ----------------------------------
  // C. VALIDASI TANGGAL
  // ----------------------------------

  if (!isValidDateOnly(checkIn)) {

    throw createError({
      status: 400,
      statusMessage: 'Format check-in tidak valid.'
    })

  }


  if (!isValidDateOnly(checkOut)) {

    throw createError({
      status: 400,
      statusMessage: 'Format check-out tidak valid.'
    })

  }


  // Check-out harus setelah check-in
  if (checkOut <= checkIn) {

    throw createError({
      status: 400,
      statusMessage: 'Check-out harus setelah check-in.'
    })

  }


  // ----------------------------------
  // D. MENCARI DATA VILLA
  // ----------------------------------

  const villa = villas.find((item) => {

    return item.id === villaId

  })


  if (!villa) {

    throw createError({
      status: 404,
      statusMessage: 'Villa tidak ditemukan.'
    })

  }


  // ----------------------------------
  // E. MEMERIKSA BENTROK RESERVASI
  // ----------------------------------

  const conflict = demoBookings.find((booking) => {

    // Villa harus sama
    const sameVilla =
      booking.villaId === villaId


    // Hanya pending dan confirmed yang memblokir
    const activeBooking =
      booking.status === 'pending' ||
      booking.status === 'confirmed'


    // Pemeriksaan overlap
    const overlapping =

      booking.checkIn < checkOut &&
      booking.checkOut > checkIn


    return (
      sameVilla &&
      activeBooking &&
      overlapping
    )

  })


  // ----------------------------------
  // F. MENGHITUNG ESTIMASI HARGA
  // ----------------------------------

  const nights = calculateNights(
    checkIn,
    checkOut
  )

  const totalPrice =
    nights * villa.pricePerNight


  // ----------------------------------
  // G. MENGIRIM RESPONSE JSON
  // ----------------------------------

  return {

    success: true,

    available: !conflict,

    message: conflict
      ? 'Tanggal bertabrakan dengan reservasi lainnya.'
      : 'Tidak ditemukan bentrok pada data simulasi.',

    villa: {
      id: villa.id,
      name: villa.name
    },

    stay: {
      checkIn,
      checkOut,
      nights
    },

    price: {
      perNight: villa.pricePerNight,
      totalPrice
    },

    demoOnly: true

  }

})
