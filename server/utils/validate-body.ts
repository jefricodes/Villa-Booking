
import { createError } from 'h3'

import { z } from 'zod'


export function validateBody<T extends z.ZodType>(
  body: unknown,
  schema: T
): z.infer<T> {

  const result = schema.safeParse(body)


  // Jika validasi gagal
  if (!result.success) {

    throw createError({

      statusCode: 400,

      statusMessage: 'Data request tidak valid.',

      data: {

        issues: result.error.issues.map((issue) => ({

          field: issue.path.join('.'),

          message: issue.message

        }))

      }

    })

  }


  // Jika validasi berhasil
  return result.data

}
