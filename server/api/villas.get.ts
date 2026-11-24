
import { getDatabase } from '../utils/database'

import type { Villa } from '#shared/types/villa'


// Bentuk data hasil query SQLite
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


export default defineEventHandler(() => {

  // Membuka koneksi database
  const db = getDatabase()


  // Membuat SQL query
  const rows = db.prepare(`

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

  `).all() as VillaRow[]


  // Mengubah row database menjadi object Villa
  const data: Villa[] = rows.map((row) => {

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


  return {

    success: true,

    count: data.length,

    data

  }

})
