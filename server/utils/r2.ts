import type { H3Event } from 'h3'

export function getR2(event: H3Event): R2Bucket {
  const env = event.context.cloudflare?.env as Env | undefined

  if (!env?.R2) {
    throw createError({
      statusCode: 500,
      statusMessage: 'R2 bucket (R2) tidak ditemukan di Cloudflare context.'
    })
  }

  return env.R2
}