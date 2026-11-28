
import { createError, getCookie } from 'h3'
import type { H3Event } from 'h3'

import { getD1 } from './d1'
import { hashSessionToken } from './admin-session'

// Nama cookie harus sama dengan yang digunakan saat login.
const SESSION_COOKIE_NAME = 'villa_admin_session'

export interface AuthenticatedAdmin {
  id: number
  email: string
  role: string
}

/**
 * Memeriksa apakah admin memiliki sesi login yang masih valid.
 * Jika valid, kembalikan data admin.
 * Jika tidak valid, kembalikan error 401.
 */
export async function requireAdmin(
  event: H3Event,
): Promise<AuthenticatedAdmin> {
  // 1. Ambil token dari cookie browser.
  const sessionToken = getCookie(event, SESSION_COOKIE_NAME)

  if (!sessionToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Silakan login terlebih dahulu.',
    })
  }

  // 2. Hash token agar pencarian sesuai dengan token_hash di D1.
  const tokenHash = await hashSessionToken(sessionToken)

  // 3. Hubungkan ke database D1.
  const db = getD1(event)

  // 4. Cari sesi yang belum kedaluwarsa dan admin yang masih aktif.
  const admin = await db
    .prepare(`
      SELECT
        admin_users.id,
        admin_users.email,
        admin_users.role
      FROM admin_sessions
      INNER JOIN admin_users
        ON admin_users.id = admin_sessions.admin_id
      WHERE admin_sessions.token_hash = ?
        AND datetime(admin_sessions.expires_at) > datetime('now')
        AND admin_users.is_active = 1
      LIMIT 1
    `)
    .bind(tokenHash)
    .first<AuthenticatedAdmin>()

  // 5. Jika sesi tidak ditemukan, admin belum terautentikasi.
  if (!admin) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Sesi login tidak valid atau sudah kedaluwarsa.',
    })
  }

  return admin
}
