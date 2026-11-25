
import { createError } from 'h3'

import { getDatabase } from '../../utils/database'

import {
  mapVillaRow,
  VILLA_SELECT_COLUMNS,
  type VillaRow
} from '../../utils/villa-mapper'

import {
  updateVillaSchema
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

import {
  isSqliteUniqueConstraintError
} from '../../utils/sqlite-errors'


export default defineEventHandler(async (event) => {

  // 1. Perlindungan development
  requireDevelopmentOnly()


  // 2. Mengambil ID dari URL
  const rawId = getRouterParam(event, 'id')

  const id = parseVillaId(rawId)


  // 3. Membaca request body
  const body = await readBody<unknown>(event)


  // 4. Memvalidasi seluruh data villa
  const input = validateBody(
    body,
    updateVillaSchema
  )


  // 5. Membuka database
  const db = getDatabase()


  // 6. Memastikan villa tersedia
  const currentVilla = db.prepare(`

    SELECT id

    FROM villas

    WHERE id = ?

  `).get(id)


  if (!currentVilla) {

    throw createError({

      statusCode: 404,

      statusMessage: 'Villa tidak ditemukan.'

    })

  }


  // 7. Memeriksa slug duplikat
  const duplicateSlug = db.prepare(`

    SELECT id

    FROM villas

    WHERE slug = ?
      AND id <> ?

  `).get(input.slug, id)


  if (duplicateSlug) {

    throw createError({

      statusCode: 409,

      statusMessage: 'Slug sudah digunakan villa lain.'

    })

  }


  // 8. Menjalankan UPDATE
  try {

    db.prepare(`

      UPDATE villas

      SET

        slug = @slug,

        name = @name,

        price_per_night = @pricePerNight,

        capacity = @capacity,

        bedrooms = @bedrooms,

        bathrooms = @bathrooms,

        location = @location,

        description = @description,

        image_url = @imageUrl,

        gallery_json = @galleryJson,

        amenities_json = @amenitiesJson,

        is_active = @isActive,

        updated_at = CURRENT_TIMESTAMP

      WHERE id = @id

    `).run({

      id,

      slug: input.slug,

      name: input.name,

      pricePerNight: input.pricePerNight,

      capacity: input.capacity,

      bedrooms: input.bedrooms,

      bathrooms: input.bathrooms,

      location: input.location,

      description: input.description,

      imageUrl: input.imageUrl,

      galleryJson: JSON.stringify(input.gallery),

      amenitiesJson: JSON.stringify(input.amenities),

      isActive: input.isActive ? 1 : 0

    })

  } catch (error) {

    if (isSqliteUniqueConstraintError(error)) {

      throw createError({

        statusCode: 409,

        statusMessage: 'Slug sudah digunakan villa lain.'

      })

    }

    throw error

  }


  // 9. Mengambil data terbaru
  const updatedVilla = db.prepare(`

    SELECT
      ${VILLA_SELECT_COLUMNS}

    FROM villas

    WHERE id = ?

  `).get(id) as VillaRow | undefined


  if (!updatedVilla) {

    throw createError({

      statusCode: 404,

      statusMessage: 'Villa tidak ditemukan setelah diperbarui.'

    })

  }


  // 10. Mengirim response
  return {

    success: true,

    message: 'Villa berhasil diperbarui.',

    data: mapVillaRow(updatedVilla)

  }

})
