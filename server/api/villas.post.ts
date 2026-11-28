
import { createError, setResponseStatus } from 'h3'

import { getD1 } from '../utils/d1'

import {
  mapVillaRow,
  VILLA_SELECT_COLUMNS,
  type VillaRow
} from '../utils/villa-mapper'

import {
  createVillaSchema
} from '../utils/villa-validation'

import {
  validateBody
} from '../utils/validate-body'

import {
  isD1UniqueConstraintError
} from '../utils/d1-errors'

import { requireAdmin } from '../utils/admin-session-auth'

import { requireSameOrigin } from '../utils/admin-security'


export default defineEventHandler(async (event) => {

// Pastikan request berasal dari website kita sendiri.
requireSameOrigin(event)

// Pastikan pengguna sudah login sebagai admin.
await requireAdmin(event)


  // 2. Baca request
  const body = await readBody<unknown>(event)


  // 3. Validasi menggunakan Zod
  const input = validateBody(
    body,
    createVillaSchema
  )


  // 4. Hubungkan ke D1
  const db = getD1(event)


  // 5. Cek slug
  const existingVilla = await db.prepare(`

    SELECT id

    FROM villas

    WHERE slug = ?

    LIMIT 1

  `)
    .bind(input.slug)
    .first<{ id: number }>()


  if (existingVilla) {

    throw createError({
      statusCode: 409,
      statusMessage: 'Slug villa sudah digunakan.'
    })

  }


  // 6. Insert data ke D1
  try {

    await db.prepare(`

      INSERT INTO villas (

        slug,
        name,
        price_per_night,
        capacity,
        bedrooms,
        bathrooms,
        location,
        description,
        image_url,
        gallery_json,
        amenities_json,
        is_active

      )

      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

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

        input.isActive ? 1 : 0

      )
      .run()

  } catch (error) {

    if (isD1UniqueConstraintError(error)) {

      throw createError({
        statusCode: 409,
        statusMessage: 'Slug villa sudah digunakan.'
      })

    }

    throw error

  }


  // 7. Ambil kembali villa
  const row = await db.prepare(`

    SELECT
      ${VILLA_SELECT_COLUMNS}

    FROM villas

    WHERE slug = ?

    LIMIT 1

  `)
    .bind(input.slug)
    .first<VillaRow>()


  if (!row) {

    throw createError({
      statusCode: 500,
      statusMessage: 'Villa gagal dibaca setelah disimpan.'
    })

  }


  // 8. Status HTTP 201
  setResponseStatus(event, 201)


  // 9. Response
  return {

    success: true,

    message: 'Villa berhasil ditambahkan.',

    data: mapVillaRow(row)

  }

})
