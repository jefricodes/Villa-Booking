/// <reference path="../../worker-configuration.d.ts" />

import type { H3Event } from 'h3'

export function getD1(event: H3Event): D1Database {

  // Mengambil Cloudflare environment
  const env = event.context.cloudflare?.env as Env | undefined

  if (!env?.DB) {
    throw createError ({
        statusCode: 500,
        statusMessage: 'Database D1 (DB) tidak ditemukamn di cloudflare context'
    })
  }

  // Mengambil binding database bernama DB
  return env.DB

}
