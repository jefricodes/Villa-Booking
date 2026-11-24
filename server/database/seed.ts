
import type Database from 'better-sqlite3'

import { villas } from '#shared/data/villas'

import { demoBookings } from '#shared/data/demo-bookings'


// ======================================
// 1. MENGHITUNG JUMLAH MALAM
// ======================================

function calculateNights(
  checkIn: string,
  checkOut: string
): number {

  const start = Date.parse(
    `${checkIn}T00:00:00.000Z`
  )

  const end = Date.parse(
    `${checkOut}T00:00:00.000Z`
  )

  return (end - start) / 86400000

}


// ======================================
// 2. FUNGSI SEED DATABASE
// ======================================

export function seedDatabase(
  db: Database.Database
): void {


  // ==================================
  // A. SQL INSERT VILLA
  // ==================================

  const insertVilla = db.prepare(`

    INSERT OR IGNORE INTO villas (

      id,
      slug,
      name,
      price_per_night,
      capacity,
      bedrooms,
      bathrooms,
      location,
      description,
      image_url,
      gallery_json,
      amenities_json

    )

    VALUES (

      @id,
      @slug,
      @name,
      @pricePerNight,
      @capacity,
      @bedrooms,
      @bathrooms,
      @location,
      @description,
      @imageUrl,
      @galleryJson,
      @amenitiesJson

    )

  `)


  // ==================================
  // B. SQL INSERT BOOKING
  // ==================================

  const insertBooking = db.prepare(`

    INSERT OR IGNORE INTO bookings (

      booking_code,
      villa_id,
      guest_name,
      guest_phone,
      guest_email,
      check_in,
      check_out,
      guest_count,
      special_request,
      total_price,
      status

    )

    VALUES (

      @bookingCode,
      @villaId,
      @guestName,
      @guestPhone,
      @guestEmail,
      @checkIn,
      @checkOut,
      @guestCount,
      @specialRequest,
      @totalPrice,
      @status

    )

  `)


  // ==================================
  // C. TRANSACTION SEED
  // ==================================

  const insertInitialData = db.transaction(() => {


    // Masukkan lima villa

    for (const villa of villas) {

      insertVilla.run({

        id: villa.id,

        slug: villa.slug,

        name: villa.name,

        pricePerNight: villa.pricePerNight,

        capacity: villa.capacity,

        bedrooms: villa.bedrooms,

        bathrooms: villa.bathrooms,

        location: villa.location,

        description: villa.description,

        imageUrl: villa.imageUrl,

        galleryJson: JSON.stringify(
          villa.gallery
        ),

        amenitiesJson: JSON.stringify(
          villa.amenities
        )

      })

    }


    // Masukkan tiga reservasi contoh

    const demoGuestNames = [
      'Demo Guest Nusa',
      'Demo Guest Senja',
      'Demo Guest Aruna'
    ]

    for (const [index, booking] of demoBookings.entries()) {

      // Cari villa dari ID reservasi
      const villa = villas.find((item) => {
        return item.id === booking.villaId
      })

      // Lewati jika data villa tidak tersedia
      if (!villa) {
        continue
      }

      const nights = calculateNights(
        booking.checkIn,
        booking.checkOut
      )

      const totalPrice =
        nights * villa.pricePerNight


      insertBooking.run({

        bookingCode: `DEMO-${String(index + 1).padStart(3, '0')}`,

        villaId: booking.villaId,

        guestName:
          demoGuestNames[index] ?? 'Demo Guest',

        guestPhone:
          `08000000000${index + 1}`,

        guestEmail: null,

        checkIn: booking.checkIn,

        checkOut: booking.checkOut,

        guestCount: 2,

        specialRequest: null,

        totalPrice,

        status: booking.status

      })

    }

  })


  // Jalankan transaction
  insertInitialData()

}
