
import Database from 'better-sqlite3'

import { mkdirSync } from 'node:fs'

import { dirname, resolve } from 'node:path'

// Import fungsi pembuat tabel
import { createSchema } from '../database/schema'

// Import fungsi pengisian data awal
import { seedDatabase } from '../database/seed'


// ======================================
// 1. DATABASE CONNECTION
// ======================================

// Variabel untuk menyimpan koneksi database
let database: Database.Database | undefined


// ======================================
// 2. FUNGSI MEMBUKA DATABASE
// ======================================

export function getDatabase(): Database.Database {

  // Jika koneksi sudah ada, gunakan kembali
  if (database) {
    return database
  }


  // Mengambil path database dari environment
  const databasePath =
    process.env.NUXT_DATABASE_PATH ||
    './data/villa-booking.sqlite'


  // Mengubah path menjadi absolute path
  const absolutePath = resolve(
    process.cwd(),
    databasePath
  )


  // Membuat folder database jika belum ada
  mkdirSync(dirname(absolutePath), {
    recursive: true
  })


  // Membuka atau membuat database
  database = new Database(absolutePath)


  // Mengaktifkan foreign key
  database.pragma('foreign_keys = ON')


  // Menggunakan Write-Ahead Logging
  database.pragma('journal_mode = WAL')


  // Memberikan waktu menunggu ketika database sibuk
  database.pragma('busy_timeout = 5000')


  // Membuat struktur tabel
  createSchema(database)


  // Memasukkan data awal
  seedDatabase(database)


  return database

}
