import { getD1 } from '../../utils/d1'
import {
  mapVillaRow,
  VILLA_SELECT_COLUMNS,
  type VillaRow
} from '../../utils/villa-mapper'

// Bentuk data untuk halaman admin (termasuk villa non-aktif)
interface AdminVilla {
  id: number
  slug: string
  name: string
  location: string
  description: string
  pricePerNight: number
  capacity: number
  bedrooms: number
  bathrooms: number
  imageUrl: string
  gallery: string[]
  amenities: string[]
  isActive: number // ✅ 0/1, bukan boolean (cocok dgn interface di halaman admin)
}

export default defineEventHandler(async (event) => {
  // ⚠️ Endpoint ini otomatis dilindungi oleh server/middleware/admin-auth.ts
  // karena path-nya diawali "/api/admin/". Tidak perlu cek token lagi di sini.

  const db = getD1(event)

  // ✅ PERBAIKAN: admin lihat SEMUA villa (aktif + non-aktif), tanpa filter is_active
  const result = await db.prepare(`
    SELECT ${VILLA_SELECT_COLUMNS}
    FROM villas
    ORDER BY id ASC
  `).all<VillaRow>()

  const data: AdminVilla[] = result.results.map((row) => {
    const villa = mapVillaRow(row) // pakai mapper aman (safeJsonParse)

    return {
      id: villa.id,
      slug: villa.slug,
      name: villa.name,
      location: villa.location,
      description: villa.description,
      pricePerNight: villa.pricePerNight,
      capacity: villa.capacity,
      bedrooms: villa.bedrooms,
      bathrooms: villa.bathrooms,
      imageUrl: villa.imageUrl,
      gallery: villa.gallery,
      amenities: villa.amenities,
      // ✅ Konversi boolean -> number agar cocok dgn `villa.isActive === 1` di UI
      isActive: villa.isActive ? 1 : 0
    }
  })

  return {
    success: true,
    count: data.length,
    data
  }
})