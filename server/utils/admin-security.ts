
import {
  createError,
  getRequestHeader,
  getRequestURL,
  type H3Event,
} from 'h3'

export function requireSameOrigin(event: H3Event): void {
  // Ambil Origin dari HTTP request.
  const origin = getRequestHeader(event, 'origin')

  if (!origin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Origin header wajib disertakan.',
    })
  }

  let originUrl: URL

  try {
    originUrl = new URL(origin)
  } catch {
    throw createError({
      statusCode: 403,
      statusMessage: 'Origin tidak valid.',
    })
  }

  // Ambil URL request menggunakan fungsi resmi H3.
  const applicationUrl = getRequestURL(event)

  // Bandingkan origin request dengan origin aplikasi.
  if (originUrl.origin !== applicationUrl.origin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Permintaan berasal dari origin yang tidak diizinkan.',
    })
  }
}
