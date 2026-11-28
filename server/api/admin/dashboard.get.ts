
import { defineEventHandler } from 'h3'

import { getD1 } from '../../utils/d1'
import { requireAdmin } from '../../utils/admin-session-auth'

interface DashboardStatsRow {
  totalVillas: number
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
}

export default defineEventHandler(async (event) => {
  // 1. Pastikan pengguna sudah login sebagai admin.
  await requireAdmin(event)

  // 2. Ambil koneksi Cloudflare D1.
  const db = getD1(event)

  // 3. Ambil semua statistik dalam satu query.
  const stats = await db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM villas) AS totalVillas,

      (SELECT COUNT(*) FROM bookings) AS totalBookings,

      (
        SELECT COUNT(*)
        FROM bookings
        WHERE status = 'pending'
      ) AS pendingBookings,

      (
        SELECT COUNT(*)
        FROM bookings
        WHERE status = 'confirmed'
      ) AS confirmedBookings
  `).first<DashboardStatsRow>()

  // 4. Pastikan database mengembalikan hasil.
  if (!stats) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Gagal mengambil statistik dashboard.',
    })
  }

  // 5. Kirim hasil statistik ke frontend.
  return {
    success: true,
    data: {
      totalVillas: stats.totalVillas,
      totalBookings: stats.totalBookings,
      pendingBookings: stats.pendingBookings,
      confirmedBookings: stats.confirmedBookings,
    },
  }
})
