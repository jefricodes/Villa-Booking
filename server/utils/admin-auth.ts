
import type { H3Event } from 'h3'
import { getD1 } from '../utils/d1'

/**
 * Bentuk data admin yang dibutuhkan untuk proses login.
 */
export interface AdminAuthRecord {
  id: number
  email: string
  password_hash: string
  password_salt: string
  password_iterations: number
  role: string
  is_active: number
}

/**
 * Mencari admin berdasarkan email.
 */
export async function findAdminByEmail(
  event: H3Event,
  email: string,
): Promise<AdminAuthRecord | null> {
  const db = getD1(event)

  const normalizedEmail = email.trim().toLowerCase()

  const admin = await db
    .prepare(`
      SELECT
        id,
        email,
        password_hash,
        password_salt,
        password_iterations,
        role,
        is_active
      FROM admin_users
      WHERE email = ? COLLATE NOCASE
      LIMIT 1
    `)
    .bind(normalizedEmail)
    .first<AdminAuthRecord>()

  return admin
}
