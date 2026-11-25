
import type { VillaRecord } from '#shared/types/villa'


// ======================================
// 1. DATABASE ROW TYPE
// ======================================

export interface VillaRow {

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

  isActive: number

}


// ======================================
// 2. SQL COLUMN SELECTION
// ======================================

export const VILLA_SELECT_COLUMNS = `

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

  amenities_json AS amenitiesJson,

  is_active AS isActive

`


// ======================================
// 3. MAPPING SQLITE ROW
// ======================================

export function mapVillaRow(
  row: VillaRow
): VillaRecord {

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

    amenities: JSON.parse(row.amenitiesJson) as string[],

    isActive: row.isActive === 1

  }

}
