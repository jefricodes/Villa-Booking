
const PASSWORD_ITERATIONS = 310_000
const SALT_LENGTH = 16
const HASH_LENGTH = 256

/**
 * Mengubah Uint8Array menjadi Base64.
 */
function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
}

/**
 * Mengubah Base64 menjadi Uint8Array.
 */
function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)

  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  return bytes
}

/**
 * Menghasilkan password hash menggunakan PBKDF2.
 */
async function derivePasswordHash(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const encoder = new TextEncoder()

  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    HASH_LENGTH,
  )

  return new Uint8Array(derivedBits)
}

/**
 * Membuat hash dari password baru.
 */

export async function createPasswordHash(password: string) {
  if (!password || password.trim().length === 0) {
    throw new Error('Password tidak boleh kosong.')
  }

  const salt = crypto.getRandomValues(
    new Uint8Array(SALT_LENGTH),
  )

  const hash = await derivePasswordHash(
    password,
    salt,
    PASSWORD_ITERATIONS,
  )

  return {
    hash: bytesToBase64(hash),
    salt: bytesToBase64(salt),
    iterations: PASSWORD_ITERATIONS,
  }
}


/**
 * Memeriksa apakah password yang dimasukkan benar.
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string,
  iterations: number,
): Promise<boolean> {
  try {
    const salt = base64ToBytes(storedSalt)
    const expectedHash = base64ToBytes(storedHash)

    const actualHash = await derivePasswordHash(
      password,
      salt,
      iterations,
    )

    if (actualHash.length !== expectedHash.length) {
      return false
    }

    // Membandingkan seluruh byte tanpa berhenti pada perbedaan pertama.
    let difference = 0

    for (let i = 0; i < actualHash.length; i++) {
      difference |= actualHash[i]! ^ expectedHash[i]!
    }

    return difference === 0
  } catch {
    return false
  }
}
