
import { getDatabase } from '../../utils/database'


export default defineEventHandler(() => {

  // Membuka koneksi database
  // Jika belum ada, tabel dan seed akan dibuat
  const db = getDatabase()


  // Mengambil versi SQLite
  const version = db.prepare(`
    SELECT sqlite_version() AS version
  `).get() as {
    version: string
  }


  // Menghitung jumlah villa
  const villaCount = db.prepare(`
    SELECT COUNT(*) AS total
    FROM villas
  `).get() as {
    total: number
  }


  // Menghitung jumlah booking
  const bookingCount = db.prepare(`
    SELECT COUNT(*) AS total
    FROM bookings
  `).get() as {
    total: number
  }


  // Memeriksa foreign key
  const foreignKeysEnabled = db.pragma(
    'foreign_keys',
    { simple: true }
  ) === 1


  return {

    success: true,

    message: 'Database connected successfully.',

    database: {
      connected: true,
      engine: 'SQLite',
      version: version.version,
      foreignKeysEnabled
    },

    tables: {
      villas: villaCount.total,
      bookings: bookingCount.total
    }

  }

})
