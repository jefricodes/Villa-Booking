
import { getDatabase } from '../../utils/database'

import {
  mapVillaRow,
  VILLA_SELECT_COLUMNS,
  type VillaRow
} from '../../utils/villa-mapper'

import { parseVillaId } from '../../utils/parse-villa-id'


export default defineEventHandler((event) => {

  // 1. Membaca ID dari URL
  const rawId = getRouterParam(event, 'id')

  // 2. Memvalidasi ID
  const id = parseVillaId(rawId)

  // 3. Membuka database
  const db = getDatabase()

  // 4. Mengambil villa dari SQLite
  const row = db.prepare(`

    SELECT
      ${VILLA_SELECT_COLUMNS}

    FROM villas

    WHERE id = ?
      AND is_active = 1

  `).get(id) as VillaRow | undefined


  // 5. Jika tidak ditemukan
  if (!row) {

    throw createError({

      statusCode: 404,

      statusMessage: 'Villa tidak ditemukan.'

    })

  }


  // 6. Mengembalikan data
  return {

    success: true,

    data: mapVillaRow(row)

  }

})
