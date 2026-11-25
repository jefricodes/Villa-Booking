
import { connect } from 'cloudflare:sockets'
import { getD1 } from '../../utils/d1'


export default defineEventHandler(async (event) => {

  // Mengambil D1 binding
  const db = getD1(event)

  const ping = await db.prepare('SELECT 1 AS ok').first<{ok: number}>()

  // Menghitung villa
  const villaCount = await db.prepare(`
    SELECT COUNT(*) AS total
    FROM villas
  `).first<{ total: number }>()


  // Menghitung booking
  const bookingCount = await db.prepare(`
    SELECT COUNT(*) AS total
    FROM bookings
  `).first<{ total: number }>()


  return {

    success: true,

    message: 'Cloudflare D1 connected successfully.',

    database: {
      engine: 'Cloudflare D1',
      connect: ping?.ok === 1
    },

    tables: {
      villas: villaCount?.total ?? 0,
      bookings: bookingCount?.total ?? 0
    }

  }

})
