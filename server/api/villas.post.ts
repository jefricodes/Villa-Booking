
import { createError, setResponseStatus } from 'h3'

import { getDatabase } from '../utils/database'

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
  requireDevelopmentOnly
} from '../utils/development-only'

import {
  isSqliteUniqueConstraintError
} from '../utils/sqlite-errors'


export default defineEventHandler(async (event) => {

  // 1. Batasi API mutasi untuk development
  requireDevelopmentOnly()


  // 2. Membaca request body
  const body = await readBody<unknown>(event)


  // 3. Validasi menggunakan Zod
  const input = validateBody(
    body,
    createVillaSchema
  )


  // 4. Membuka database
  const db = getDatabase()


  // 5. Memeriksa slug yang sudah digunakan
  const existingVilla = db.prepare(`

    SELECT id

    FROM villas

    WHERE slug = ?

  `).get(input.slug)


  if (existingVilla) {

    throw createError({

      statusCode: 409,

      statusMessage: 'Slug villa sudah digunakan.'

    })

  }


  // 6. Menyimpan villa
  let newId: number

  try {

    const result = db.prepare(`

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

      VALUES (

        @slug,
        @name,
        @pricePerNight,
        @capacity,
        @bedrooms,
        @bathrooms,
        @location,
        @description,
        @imageUrl,
        @galleryJson,
        @amenitiesJson,
        @isActive

      )

    `).run({

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

    newId = Number(result.lastInsertRowid)

  } catch (error) {

    // Database tetap menjadi penjaga UNIQUE terakhir
    if (isSqliteUniqueConstraintError(error)) {

      throw createError({

        statusCode: 409,

        statusMessage: 'Slug villa sudah digunakan.'

      })

    }

    throw error

  }


  // 7. Mengambil data yang baru disimpan
  const row = db.prepare(`

    SELECT
      ${VILLA_SELECT_COLUMNS}

    FROM villas

    WHERE id = ?

  `).get(newId) as VillaRow | undefined


  if (!row) {

    throw createError({

      statusCode: 500,

      statusMessage: 'Data villa gagal dibaca setelah disimpan.'

    })

  }


  // 8. Mengatur HTTP status 201
  setResponseStatus(event, 201)


  // 9. Mengirim response
  return {

    success: true,

    message: 'Villa berhasil ditambahkan.',

    data: mapVillaRow(row)

  }

})
