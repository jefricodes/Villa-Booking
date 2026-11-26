
import { createError } from 'h3'

import { getD1 } from '../../utils/d1'

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
  isD1UniqueConstraintError
} from '../../utils/sqlite-errors'


export default defineEventHandler(async (event) => {

  // 1. Development only
  requireDevelopmentOnly()


  // 2. Membaca ID
  const rawId = getRouterParam(event, 'id')

  const id = parseVillaId(rawId)


  // 3. Membaca request body
  const body = await readBody<unknown>(event)


  // 4. Validasi seluruh data
  const input = validateBody(
    body,
    updateVillaSchema
  )


  // 5. Membuka D1
  const db = getD1(event)


  // 6. Memeriksa villa
  const existingVilla = await db.prepare(`

    SELECT id

    FROM villas

    WHERE id = ?

    LIMIT 1

  `)
    .bind(id)
    .first<{ id: number }>()


  if (!existingVilla) {

    throw createError({
      statusCode: 404,
      statusMessage: 'Villa tidak ditemukan.'
    })

  }


  // 7. Memeriksa slug duplikat
  const duplicateSlug = await db.prepare(`

    SELECT id

    FROM villas

    WHERE slug = ?
      AND id <> ?

    LIMIT 1

  `)
    .bind(input.slug, id)
    .first<{ id: number }>()


  if (duplicateSlug) {

    throw createError({
      statusCode: 409,
      statusMessage: 'Slug sudah digunakan villa lain.'
    })

  }


  // 8. Memperbarui data
  try {

    await db.prepare(`

      UPDATE villas

      SET

        slug = ?,

        name = ?,

        price_per_night = ?,

        capacity = ?,

        bedrooms = ?,

        bathrooms = ?,

        location = ?,

        description = ?,

        image_url = ?,

        gallery_json = ?,

        amenities_json = ?,

        is_active = ?,

        updated_at = CURRENT_TIMESTAMP

      WHERE id = ?

    `)
      .bind(

        input.slug,

        input.name,

        input.pricePerNight,

        input.capacity,

        input.bedrooms,

        input.bathrooms,

        input.location,

        input.description,

        input.imageUrl,

        JSON.stringify(input.gallery),

        JSON.stringify(input.amenities),

        input.isActive ? 1 : 0,

        id

      )
      .run()

  } catch (error) {

    if (isD1UniqueConstraintError(error)) {

      throw createError({
        statusCode: 409,
        statusMessage: 'Slug sudah digunakan villa lain.'
      })

    }

    throw error

  }


  // 9. Membaca hasil terbaru
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


  // 10. Response
  return {

    success: true,

    message: 'Villa berhasil diperbarui.',

    data: mapVillaRow(updatedVilla)

  }

})
