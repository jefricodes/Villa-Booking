
import { getD1 } from '../utils/d1'

import type { Villa } from '#shared/types/villa'


// Bentuk data dari SQLite/D1
interface VillaRow {

  id: number

  slug: string

  name: string

  pricePerNight: number

  capacity: number

  bedrooms: number

  bathrooms: number

  location: string

  description: string

  imageUrl: string

  galleryJson: string

  amenitiesJson: string

}


export default defineEventHandler(async (event) => {

  // 1. Mengambil D1
  const db = getD1(event)


  // 2. Menjalankan query SELECT
  const result = await db.prepare(`

    SELECT

      id,

      slug,

      name,

      price_per_night AS pricePerNight,

      capacity,

      bedrooms,

      bathrooms,

      location,

      description,

      image_url AS imageUrl,

      gallery_json AS galleryJson,

      amenities_json AS amenitiesJson

    FROM villas

    WHERE is_active = 1

    ORDER BY id ASC

  `).all<VillaRow>()


  // 3. Mengubah D1 result menjadi Villa
  const data: Villa[] = result.results.map((row) => {

    return {

      id: row.id,

      slug: row.slug,

      name: row.name,

      pricePerNight: row.pricePerNight,

      capacity: row.capacity,

      bedrooms: row.bedrooms,

      bathrooms: row.bathrooms,

      location: row.location,

      description: row.description,

      imageUrl: row.imageUrl,

      gallery: JSON.parse(row.galleryJson) as string[],

      amenities: JSON.parse(row.amenitiesJson) as string[]

    }

  })


  // 4. Response JSON
  return {

    success: true,

    count: data.length,

    data

  }

})
