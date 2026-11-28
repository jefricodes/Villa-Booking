
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60

/**
 * Mengubah byte menjadi Base64 URL-safe.
 */
function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

/**
 * Membuat token session acak.
 */
export function generateSessionToken(): string {
  const randomBytes = crypto.getRandomValues(
    new Uint8Array(32),
  )

  return bytesToBase64Url(randomBytes)
}

/**
 * Membuat hash SHA-256 dari token session.
 */
export async function hashSessionToken(
  token: string,
): Promise<string> {
  const encodedToken = new TextEncoder().encode(token)

  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    encodedToken,
  )

  return bytesToBase64Url(new Uint8Array(hashBuffer))
}

/**
 * Menghasilkan waktu kedaluwarsa session.
 */
export function getSessionExpiry(): string {
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_SECONDS * 1000,
  )

  return expiresAt.toISOString()
}

/**
 * Mengembalikan durasi session dalam detik.
 */
export function getSessionDuration(): number {
  return SESSION_DURATION_SECONDS
}
