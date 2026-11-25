
import { getDatabase } from '../utils/database'

import {
  mapVillaRow,
  VILLA_SELECT_COLUMNS,
  type VillaRow
} from '../utils/villa-mapper'

import type { Villa } from '#shared/types/villa'


export default defineEventHandler(() => {

  // 1. Membuka database
  const db = getDatabase()


  // 2. Mengambil villa yang aktif
  const rows = db.prepare(`

    SELECT

      ${VILLA_SELECT_COLUMNS}

    FROM villas

    WHERE is_active = 1

    ORDER BY id ASC

  `).all() as VillaRow[]


  // 3. Mengubah SQLite row menjadi Villa
  const data: Villa[] = rows.map((row) => {

    const villa = mapVillaRow(row)

    // Status aktif tidak perlu dikirim
    // pada endpoint publik ini
    const {
      isActive,
      ...publicVilla
    } = villa

    return publicVilla

  })


  // 4. Mengembalikan response
  return {

    success: true,

    count: data.length,

    data

  }

})
