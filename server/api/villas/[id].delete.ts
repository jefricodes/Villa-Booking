
import { createError } from 'h3'

import { getD1 } from '../../utils/d1'

import {
  parseVillaId
} from '../../utils/parse-villa-id'


import {
  isD1ForeignKeyError
} from '../../utils/d1-errors'

import { requireAdmin } from '../../utils/admin-session-auth'

import { requireSameOrigin } from '../../utils/admin-security'


interface VillaIdentity {
  id: number
  name: string
}


export default defineEventHandler(async (event) => {

// Pastikan request berasal dari website kita sendiri.
requireSameOrigin(event)

// Pastikan pengguna sudah login sebagai admin.
await requireAdmin(event)


  // 2. Membaca ID
  const rawId = getRouterParam(event, 'id')

  const id = parseVillaId(rawId)


  // 3. Mengambil D1
  const db = getD1(event)


  // 4. Memastikan villa tersedia
  const villa = await db.prepare(`

    SELECT id, name

    FROM villas

    WHERE id = ?

    LIMIT 1

  `)
    .bind(id)
    .first<VillaIdentity>()


  if (!villa) {

    throw createError({
      statusCode: 404,
      statusMessage: 'Villa tidak ditemukan.'
    })

  }


  // 5. Memeriksa riwayat booking
  const bookingCount = await db.prepare(`

    SELECT COUNT(*) AS total

    FROM bookings

    WHERE villa_id = ?

  `)
    .bind(id)
    .first<{ total: number }>()


  if ((bookingCount?.total ?? 0) > 0) {

    throw createError({

      statusCode: 409,

      statusMessage:
        'Villa mempunyai riwayat reservasi dan tidak boleh dihapus.',

      data: {
        bookingCount: bookingCount?.total ?? 0,
        suggestion: 'Gunakan PATCH untuk menonaktifkan villa.'
      }

    })

  }


  // 6. Hapus villa
  try {

    const result = await db.prepare(`

      DELETE FROM villas

      WHERE id = ?

        AND NOT EXISTS (

          SELECT 1

          FROM bookings

          WHERE bookings.villa_id = villas.id

        )

    `)
      .bind(id)
      .run()


    if (result.meta.changes !== 1) {

      // Memeriksa apakah booking muncul
      // sebelum proses DELETE diselesaikan
      const latestBooking = await db.prepare(`

        SELECT COUNT(*) AS total

        FROM bookings

        WHERE villa_id = ?

      `)
        .bind(id)
        .first<{ total: number }>()


      if ((latestBooking?.total ?? 0) > 0) {

        throw createError({

          statusCode: 409,

          statusMessage:
            'Villa memiliki riwayat reservasi dan tidak boleh dihapus.'

        })

      }

      throw createError({

        statusCode: 404,

        statusMessage: 'Villa tidak ditemukan.'

      })

    }

  } catch (error) {

    if (
      isD1ForeignKeyError(error) ||
      (
        error instanceof Error &&
        error.message.includes('FOREIGN KEY constraint failed')
      )
    ) {

      throw createError({

        statusCode: 409,

        statusMessage:
          'Villa tidak dapat dihapus karena mempunyai riwayat reservasi.'

      })

    }

    throw error

  }


  // 7. Response
  return {

    success: true,

    message: 'Villa berhasil dihapus.',

    data: {
      id: villa.id,
      name: villa.name
    }

  }

})
