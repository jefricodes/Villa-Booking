import { webcrypto } from 'node:crypto'
import { spawnSync } from 'node:child_process'

const DATABASE_NAME = 'villa-booking-dev'
const PASSWORD_ITERATIONS = 310_000
const SALT_LENGTH = 16
const HASH_LENGTH = 256

// Target database wajib disebutkan secara eksplisit.
const target = process.argv[2]

if (!['--local', '--remote'].includes(target)) {
  console.error(
    'Gunakan: node scripts/bootstrap-admin.mjs --local',
  )
  console.error(
    'Atau: node scripts/bootstrap-admin.mjs --remote',
  )
  process.exit(1)
}

// Meminta input tersembunyi agar password tidak terlihat.
function askHidden(question) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY || !process.stdin.setRawMode) {
      reject(new Error('Jalankan skrip dari terminal interaktif.'))
      return
    }

    let value = ''
    process.stdout.write(question)
    process.stdin.setRawMode(true)
    process.stdin.resume()

    function cleanup() {
      process.stdin.setRawMode(false)
      process.stdin.pause()
      process.stdin.removeListener('data', onData)
    }

    function onData(data) {
      const character = data.toString()

      if (character === '\u0003') {
        cleanup()
        process.stdout.write('\n')
        reject(new Error('Proses dibatalkan.'))
        return
      }

      if (character === '\r' || character === '\n') {
        cleanup()
        process.stdout.write('\n')
        resolve(value)
        return
      }

      if (character === '\u007f' || character === '\b') {
        value = value.slice(0, -1)
        return
      }

      if (character >= ' ') {
        value += character
      }
    }

    process.stdin.on('data', onData)
  })
}

function toBase64(bytes) {
  return Buffer.from(bytes).toString('base64')
}

async function createPasswordHash(password) {
  const salt = webcrypto.getRandomValues(
    new Uint8Array(SALT_LENGTH),
  )

  const passwordKey = await webcrypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )

  const derivedBits = await webcrypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PASSWORD_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    HASH_LENGTH,
  )

  return {
    hash: toBase64(new Uint8Array(derivedBits)),
    salt: toBase64(salt),
    iterations: PASSWORD_ITERATIONS,
  }
}

function sqlString(value) {
  return `'${value.replaceAll("'", "''")}'`
}

function runWrangler(args) {
  const result = spawnSync(
    'npx',
    ['wrangler', ...args],
    {
      encoding: 'utf8',
      stdio: 'inherit',
    },
  )

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    throw new Error('Perintah Wrangler gagal dijalankan.')
  }
}

async function main() {
  const databaseLabel = target === '--local' ? 'D1 Local' : 'D1 Remote'

  console.log('\n=== Bootstrap Admin Villa Booking ===')
  console.log(`Target database: ${databaseLabel}\n`)

  const email = (
    await askHidden('Email admin: ')
  ).trim().toLowerCase()

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Format email tidak valid.')
  }

  const password = await askHidden('Password admin: ')
  const confirmation = await askHidden('Ulangi password: ')

  if (password !== confirmation) {
    throw new Error('Password dan konfirmasi tidak sama.')
  }

  if (password.trim().length === 0 || password.length < 6) {
    throw new Error('Password minimal 6 karakter dan tidak boleh kosong.')
  }

  if (password.length > 128) {
    throw new Error('Password maksimal 128 karakter.')
  }

  console.log('\nMembuat password hash...')

  const passwordData = await createPasswordHash(password)

  const sql = `
    INSERT INTO admin_users (
      email,
      password_hash,
      password_salt,
      password_iterations,
      role,
      is_active
    )
    SELECT
      ${sqlString(email)},
      ${sqlString(passwordData.hash)},
      ${sqlString(passwordData.salt)},
      ${passwordData.iterations},
      'admin',
      1
    WHERE NOT EXISTS (
      SELECT 1 FROM admin_users
    )
    RETURNING id, email, role, is_active;
  `

  console.log(`Mengirim data ke ${databaseLabel}...`)

  runWrangler([
    'd1',
    'execute',
    DATABASE_NAME,
    target,
    '--command',
    sql,
  ])

  console.log('\nPerintah selesai.')
  console.log('Periksa hasilnya sebelum mencoba login.')
}

main().catch((error) => {
  console.error('\nBootstrap gagal:', error.message)
  process.exitCode = 1
})
