
import { createError } from 'h3'

export function requireDevelopmentOnly(): void {

  if (!import.meta.dev) {

    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found'
    })

  }

}
