
import { createError } from 'h3'

import { getDatabase } from '../../utils/database'

import {
  parseVillaId
} from '../../utils/parse-villa-id'

import {
  requireDevelopmentOnly
} from '../../utils/development-only'


export default defineEventHandler((event) => {

  // 1. Perlindungan development
  requireDevelopmentOnly()


  // 2. Mengambil ID
  const rawId = getRouterParam(event, 'id')

  const id = parseVillaId(rawId)


  // 3. Membuka database
  const db = getDatabase()


  // 4. Memastikan villa tersedia
  const existingVilla = db.prepare(`

    SELECT id, name

    FROM villas

    WHERE id = ?

  `).get(id) as {
    id: number
    name: string
  } | undefined


  if (!existingVilla) {

    throw createError({

      statusCode: 404,

      statusMessage: 'Villa tidak ditemukan.'

    })

  }


  // 5. Memeriksa riwayat booking
  const bookingCount = db.prepare(`

    SELECT COUNT(*) AS total

    FROM bookings

    WHERE villa_id = ?

  `).get(id) as {
    total: number
  }


  // 6. Menolak penghapusan jika memiliki booking
  if (bookingCount.total > 0) {

    throw createError({

      statusCode: 409,

      statusMessage:
        'Villa memiliki riwayat reservasi dan tidak boleh dihapus.',

      data: {
        bookingCount: bookingCount.total,
        suggestion: 'Gunakan PATCH untuk menonaktifkan villa.'
      }

    })

  }


  // 7. Menghapus villa
  const result = db.prepare(`

    DELETE FROM villas

    WHERE id = ?

  `).run(id)


  // 8. Memastikan ada data yang dihapus
  if (result.changes !== 1) {

    throw createError({

      statusCode: 500,

      statusMessage: 'Villa gagal dihapus.'

    })

  }


  // 9. Mengembalikan response
  return {

    success: true,

    message: 'Villa berhasil dihapus.',

    data: {
      id: existingVilla.id,
      name: existingVilla.name
    }

  }

})
