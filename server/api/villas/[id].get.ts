
import { getD1 } from '../../utils/d1'

import {
  mapVillaRow,
  VILLA_SELECT_COLUMNS,
  type VillaRow
} from '../../utils/villa-mapper'

import { parseVillaId } from '../../utils/parse-villa-id'


export default defineEventHandler(async (event) => {

  // 1. Ambil ID dari URL
  const rawId = getRouterParam(event, 'id')

  // 2. Validasi ID
  const id = parseVillaId(rawId)

  // 3. Ambil binding D1
  const db = getD1(event)

  // 4. Cari villa aktif
  const row = await db.prepare(`

    SELECT
      ${VILLA_SELECT_COLUMNS}

    FROM villas

    WHERE id = ?
      AND is_active = 1

    LIMIT 1

  `)
    .bind(id)
    .first<VillaRow>()


  // 5. Villa tidak ditemukan
  if (!row) {

    throw createError({
      statusCode: 404,
      statusMessage: 'Villa tidak ditemukan.'
    })

  }


  // 6. Mapping data database
  const villa = mapVillaRow(row)

  const {
    isActive,
    ...publicVilla
  } = villa


  // 7. Return JSON
  return {
    success: true,
    data: publicVilla
  }

})
