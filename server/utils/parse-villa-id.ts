
import { createError } from 'h3'


export function parseVillaId(
  rawId: string | undefined
): number {

  // Memeriksa apakah ID tersedia
  if (!rawId) {

    throw createError({
      statusCode: 400,
      statusMessage: 'Villa ID wajib diisi.'
    })

  }


  // ID hanya boleh berupa angka positif
  if (!/^[1-9]\d*$/.test(rawId)) {

    throw createError({
      statusCode: 400,
      statusMessage: 'Villa ID tidak valid.'
    })

  }


  const id = Number(rawId)


  // Memeriksa batas angka aman JavaScript
  if (!Number.isSafeInteger(id)) {

    throw createError({
      statusCode: 400,
      statusMessage: 'Villa ID berada di luar batas yang valid.'
    })

  }


  return id

}
