
import { createError } from 'h3'

import { getDatabase } from '../../utils/database'

import {
  mapVillaRow,
  VILLA_SELECT_COLUMNS,
  type VillaRow
} from '../../utils/villa-mapper'

import {
  updateVillaStatusSchema
} from '../../utils/villa-validation'

import {
  validateBody
} from '../../utils/validate-body'

import {
  parseVillaId
} from '../../utils/parse-villa-id'

import {
  requireDevelopmentOnly
} from '../../utils/development-only'


export default defineEventHandler(async (event) => {

  // 1. Perlindungan development
  requireDevelopmentOnly()


  // 2. Mengambil ID
  const rawId = getRouterParam(event, 'id')

  const id = parseVillaId(rawId)


  // 3. Membaca request
  const body = await readBody<unknown>(event)


  // 4. Validasi hanya properti isActive
  const input = validateBody(
    body,
    updateVillaStatusSchema
  )


  // 5. Membuka database
  const db = getDatabase()


  // 6. Memastikan villa tersedia
  const existingVilla = db.prepare(`

    SELECT id

    FROM villas

    WHERE id = ?

  `).get(id)


  if (!existingVilla) {

    throw createError({

      statusCode: 404,

      statusMessage: 'Villa tidak ditemukan.'

    })

  }


  // 7. Memperbarui status
  db.prepare(`

    UPDATE villas

    SET

      is_active = @isActive,

      updated_at = CURRENT_TIMESTAMP

    WHERE id = @id

  `).run({

    id,

    isActive: input.isActive ? 1 : 0

  })


  // 8. Mengambil data terbaru
  const updatedVilla = db.prepare(`

    SELECT
      ${VILLA_SELECT_COLUMNS}

    FROM villas

    WHERE id = ?

  `).get(id) as VillaRow | undefined


  if (!updatedVilla) {

    throw createError({

      statusCode: 404,

      statusMessage: 'Villa tidak ditemukan.'

    })

  }


  // 9. Mengembalikan response
  return {

    success: true,

    message: input.isActive
      ? 'Villa berhasil diaktifkan.'
      : 'Villa berhasil dinonaktifkan.',

    data: mapVillaRow(updatedVilla)

  }

})
