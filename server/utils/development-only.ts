
import { createError } from 'h3'


export function requireDevelopmentOnly(): void {

  if (process.env.NODE_ENV === 'production') {

    throw createError({

      statusCode: 404,

      statusMessage: 'Not Found'

    })

  }

}
