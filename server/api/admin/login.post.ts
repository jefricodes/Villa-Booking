
import {
  createError,
  defineEventHandler,
  readBody,
  setCookie,
} from 'h3'

import { z } from 'zod'

import { findAdminByEmail } from '../../utils/admin-auth'
import { verifyPassword } from '../../utils/password'

import {
  generateSessionToken,
  hashSessionToken,
  getSessionExpiry,
  getSessionDuration,
} from '../../utils/admin-session'

import { getD1 } from '../../utils/d1'
import { requireSameOrigin } from '../../utils/admin-security'

import {
  getClientIp,
  consumeLoginAttempt,
  clearLoginAttempts,
} from '../../utils/login-rate-limit'

// Validasi data yang dikirim dari halaman login.
const loginSchema = z.object({
  email: z.string().trim().max(254),
  password: z.string().min(1).max(128),
})

const SESSION_COOKIE_NAME = 'villa_admin_session'

export default defineEventHandler(async (event) => {
  // 1. Pastikan request berasal dari aplikasi kita sendiri.
  requireSameOrigin(event)

  // 2. Membaca dan memvalidasi data login.
  const body = await readBody(event)
  const validation = loginSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email atau password tidak valid.',
    })
  }

  const { email, password } = validation.data

  // Normalisasi email agar konsisten ketika disimpan di D1.
  const normalizedEmail = email.trim().toLowerCase()

  // 3. Mengambil koneksi database dan IP pengunjung.
  const db = getD1(event)
  const ipAddress = getClientIp(event)

  // 4. Mencatat percobaan login.
  const isAllowed = await consumeLoginAttempt(
    db,
    normalizedEmail,
    ipAddress,
  )

  // 5. Menolak jika sudah melewati batas percobaan.
  if (!isAllowed) {
    throw createError({
      statusCode: 429,
      statusMessage:
        'Terlalu banyak percobaan login. Silakan coba lagi setelah 15 menit.',
    })
  }

  // 6. Mencari admin berdasarkan email.
  const admin = await findAdminByEmail(
    event,
    normalizedEmail,
  )

  // Pesan dibuat umum agar tidak membocorkan keberadaan email.
  if (!admin || admin.is_active !== 1) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Email atau password salah.',
    })
  }

  // 7. Memeriksa password.
  const passwordIsValid = await verifyPassword(
    password,
    admin.password_hash,
    admin.password_salt,
    admin.password_iterations,
  )

  if (!passwordIsValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Email atau password salah.',
    })
  }

  // 8. Membuat token session.
  const sessionToken = generateSessionToken()
  const tokenHash = await hashSessionToken(sessionToken)
  const expiresAt = getSessionExpiry()

  // 9. Menyimpan session ke D1.
  await db
    .prepare(`
      INSERT INTO admin_sessions (
        admin_id,
        token_hash,
        expires_at
      )
      VALUES (?, ?, ?)
    `)
    .bind(admin.id, tokenHash, expiresAt)
    .run()

  // 10. Memperbarui waktu login terakhir.
  await db
    .prepare(`
      UPDATE admin_users
      SET last_login_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .bind(admin.id)
    .run()

  // 11. Menghapus penghitung setelah login berhasil.
  await clearLoginAttempts(
    db,
    normalizedEmail,
    ipAddress,
  )

  // 12. Mengirim cookie session ke browser.
  const isProduction = !import.meta.dev

  setCookie(event, SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: getSessionDuration(),
  })

  // 13. Mengirim respons tanpa data sensitif.
  return {
    success: true,
    message: 'Login berhasil.',
    data: {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    },
  }
})
