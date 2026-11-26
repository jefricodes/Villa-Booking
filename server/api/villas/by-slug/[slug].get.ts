
import { getD1 } from '../../../utils/d1'

import {
  mapVillaRow,
  VILLA_SELECT_COLUMNS,
  type VillaRow
} from '../../../utils/villa-mapper'


export default defineEventHandler(async (event) => {

  // 1. Mengambil slug dari URL
  const rawSlug = getRouterParam(event, 'slug')

  // 2. Validasi slug
  if (
    !rawSlug ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rawSlug)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug villa tidak valid.'
    })
  }

  // 3. Mengambil binding D1
  const db = getD1(event)

  // 4. Mencari villa berdasarkan slug
  const row = await db.prepare(`

    SELECT
      ${VILLA_SELECT_COLUMNS}

    FROM villas

    WHERE slug = ?
      AND is_active = 1

    LIMIT 1

  `)
    .bind(rawSlug)
    .first<VillaRow>()

  // 5. Jika tidak ditemukan
  if (!row) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Villa tidak ditemukan.'
    })
  }

  // 6. Mengubah row database
  const villa = mapVillaRow(row)

  // Status internal tidak perlu diberikan
  // kepada pengunjung publik
  const {
    isActive,
    ...publicVilla
  } = villa

  // 7. Mengembalikan response
  return {
    success: true,
    data: publicVilla
  }

})
