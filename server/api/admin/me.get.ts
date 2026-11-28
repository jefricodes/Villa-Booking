
import { defineEventHandler } from 'h3'
import { requireAdmin } from '../../utils/admin-session-auth'

export default defineEventHandler(async (event) => {
  // Periksa apakah sesi admin masih valid.
  const admin = await requireAdmin(event)

  // Kembalikan informasi admin yang sedang login.
  return {
    success: true,
    data: {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    },
  }
})
