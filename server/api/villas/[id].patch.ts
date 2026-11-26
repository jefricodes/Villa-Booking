
import { createError } from 'h3'

import { getD1 } from '../../utils/d1'

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

  // 1. Development only
  requireDevelopmentOnly()


  // 2. Membaca ID
  const rawId = getRouterParam(event, 'id')

  const id = parseVillaId(rawId)


  // 3. Membaca body
  const body = await readBody<unknown>(event)


  // 4. Validasi status
  const input = validateBody(
    body,
    updateVillaStatusSchema
  )


  // 5. Mengambil D1
  const db = getD1(event)


  // 6. Update status
  const result = await db.prepare(`

    UPDATE villas

    SET

      is_active = ?,

      updated_at = CURRENT_TIMESTAMP

    WHERE id = ?

  `)
    .bind(
      input.isActive ? 1 : 0,
      id
    )
    .run()


  // 7. Memeriksa jumlah row yang berubah
  if (result.meta.changes === 0) {

    throw createError({
      statusCode: 404,
      statusMessage: 'Villa tidak ditemukan.'
    })

  }


  // 8. Mengambil data terbaru
  const updatedVilla = await db.prepare(`

    SELECT
      ${VILLA_SELECT_COLUMNS}

    FROM villas

    WHERE id = ?

    LIMIT 1

  `)
    .bind(id)
    .first<VillaRow>()


  if (!updatedVilla) {

    throw createError({
      statusCode: 404,
      statusMessage: 'Villa tidak ditemukan.'
    })

  }


  // 9. Response
  return {

    success: true,

    message: input.isActive
      ? 'Villa berhasil diaktifkan.'
      : 'Villa berhasil dinonaktifkan.',

    data: mapVillaRow(updatedVilla)

  }

})
