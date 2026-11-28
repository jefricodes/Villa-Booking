
import {
  defineEventHandler,
  getCookie,
  deleteCookie,
} from 'h3'

import { getD1 } from '../../utils/d1'
import { hashSessionToken } from '../../utils/admin-session'

import { requireSameOrigin } from '../../utils/admin-security'

const SESSION_COOKIE_NAME = 'villa_admin_session'

export default defineEventHandler(async (event) => {
  // Pastikan permintaan berasal dari aplikasi kita sendiri.
  requireSameOrigin(event)

  const sessionToken = getCookie(event, SESSION_COOKIE_NAME)

  // 2. Jika cookie tersedia, hapus sesi dari database.
  if (sessionToken) {
    const tokenHash = await hashSessionToken(sessionToken)
    const db = getD1(event)

    await db
      .prepare(`
        DELETE FROM admin_sessions
        WHERE token_hash = ?
      `)
      .bind(tokenHash)
      .run()
  }

  // 3. Hapus cookie sesi dari browser.
  deleteCookie(event, SESSION_COOKIE_NAME, {
    path: '/',
  })

  return {
    success: true,
    message: 'Logout berhasil.',
  }
})
