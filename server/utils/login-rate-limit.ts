
import type { H3Event } from 'h3'
import { getRequestHeader } from 'h3'

// Maksimal percobaan login.
const MAX_LOGIN_ATTEMPTS = 5

// Durasi pembatasan: 15 menit.
const WINDOW_SECONDS = 15 * 60

export function getClientIp(event: H3Event): string {
  const ip = getRequestHeader(event, 'cf-connecting-ip')?.trim()

  // Gunakan IP dari Cloudflare jika tersedia.
  if (ip && ip.length <= 64) {
    return ip
  }

  // Fallback khusus untuk lingkungan development.
  if (import.meta.dev) {
    return '127.0.0.1'
  }

  // Fallback jika IP tidak tersedia di production.
  return 'unknown'
}

/**
 * Mencatat satu percobaan login secara atomik.
 *
 * Mengembalikan true jika percobaan masih diizinkan.
 */
export async function consumeLoginAttempt(
  db: D1Database,
  email: string,
  ipAddress: string,
): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - WINDOW_SECONDS

  const result = await db
    .prepare(`
      INSERT INTO admin_login_rate_limits (
        email,
        ip_address,
        window_started_at,
        attempts
      )
      VALUES (?, ?, ?, 1)

      ON CONFLICT(email, ip_address)
      DO UPDATE SET
        window_started_at = CASE
          WHEN admin_login_rate_limits.window_started_at <= ?
          THEN excluded.window_started_at
          ELSE admin_login_rate_limits.window_started_at
        END,

        attempts = CASE
          WHEN admin_login_rate_limits.window_started_at <= ?
          THEN 1
          ELSE admin_login_rate_limits.attempts + 1
        END

      RETURNING attempts
    `)
    .bind(
      email.trim().toLowerCase(),
      ipAddress,
      now,
      windowStart,
      windowStart,
    )
    .first<{ attempts: number }>()

  if (!result) {
    throw new Error('Gagal mencatat percobaan login.')
  }

  return result.attempts <= MAX_LOGIN_ATTEMPTS
}

/**
 * Menghapus penghitung setelah login berhasil.
 */
export async function clearLoginAttempts(
  db: D1Database,
  email: string,
  ipAddress: string,
): Promise<void> {
  await db
    .prepare(`
      DELETE FROM admin_login_rate_limits
      WHERE email = ? AND ip_address = ?
    `)
    .bind(
      email.trim().toLowerCase(),
      ipAddress,
    )
    .run()
}
