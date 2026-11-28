import { getD1 } from '../utils/d1'
import type { Villa } from '#shared/types/villa'
import {
  mapVillaRow,
  VILLA_SELECT_COLUMNS,
  type VillaRow
} from '../utils/villa-mapper'

export default defineEventHandler(async (event) => {
  const db = getD1(event)

  const result = await db.prepare(`
    SELECT ${VILLA_SELECT_COLUMNS}
    FROM villas
    WHERE is_active = 1
    ORDER BY id ASC
  `).all<VillaRow>()

  // Mapping aman via mapper (tidak ada JSON.parse mentah yang bisa crash)
  const data: Villa[] = result.results
    .map(mapVillaRow)
    .map(({ isActive, ...publicVilla }) => publicVilla)

  return {
    success: true,
    count: data.length,
    data
  }
})