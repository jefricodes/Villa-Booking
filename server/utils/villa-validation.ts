
import { z } from 'zod'


// ======================================
// 1. FORMAT URL GAMBAR
// ======================================

const imageUrlSchema = z
.url('URL gambar tidak valid.')
.trim()
.refine(
    (value) => 
        value.startsWith('https://') ||
        value.startsWith('http://'),
        'Gambar harus menggunakan HTTP atau HTTPS.'
)


// ======================================
// 2. FIELD DATA VILLA
// ======================================

const villaFields = {

  slug: z
    .string()
    .trim()
    .min(2, 'Slug minimal 2 karakter.')
    .max(80, 'Slug maksimal 80 karakter.')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug hanya boleh menggunakan huruf kecil, angka, dan tanda hubung.'
    ),


  name: z
    .string()
    .trim()
    .min(3, 'Nama villa minimal 3 karakter.')
    .max(100, 'Nama villa maksimal 100 karakter.'),


  pricePerNight: z
    .number()
    .int('Harga harus berupa angka bulat.')
    .min(0, 'Harga tidak boleh negatif.')
    .max(1000000000, 'Harga terlalu besar.'),


  capacity: z
    .number()
    .int()
    .min(1, 'Kapasitas minimal 1 orang.')
    .max(50, 'Kapasitas maksimal 50 orang.'),


  bedrooms: z
    .number()
    .int()
    .min(1, 'Minimal 1 kamar tidur.')
    .max(20, 'Maksimal 20 kamar tidur.'),


  bathrooms: z
    .number()
    .int()
    .min(1, 'Minimal 1 kamar mandi.')
    .max(20, 'Maksimal 20 kamar mandi.'),


  location: z
    .string()
    .trim()
    .min(3)
    .max(200),


  description: z
    .string()
    .trim()
    .min(10, 'Deskripsi minimal 10 karakter.')
    .max(2000, 'Deskripsi maksimal 2000 karakter.'),


  imageUrl: imageUrlSchema,


  gallery: z
    .array(imageUrlSchema)
    .max(20, 'Maksimal 20 foto.'),


  amenities: z
    .array(
      z.string()
        .trim()
        .min(1)
        .max(60)
    )
    .max(30, 'Maksimal 30 fasilitas.')

}


// ======================================
// 3. SCHEMA CREATE
// ======================================

export const createVillaSchema = z.strictObject({

  ...villaFields,

  isActive: z.boolean().default(true)

})


// ======================================
// 4. SCHEMA UPDATE
// ======================================

export const updateVillaSchema = z.strictObject({

  ...villaFields,

  isActive: z.boolean()

})


// ======================================
// 5. SCHEMA UPDATE STATUS
// ======================================

export const updateVillaStatusSchema = z.strictObject({

  isActive: z.boolean()

})


// ======================================
// 6. TYPESCRIPT TYPES
// ======================================

export type CreateVillaInput =
  z.infer<typeof createVillaSchema>


export type UpdateVillaInput =
  z.infer<typeof updateVillaSchema>


export type UpdateVillaStatusInput =
  z.infer<typeof updateVillaStatusSchema>

