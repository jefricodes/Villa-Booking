// shared/types/booking.ts

// Status reservasi yang digunakan aplikasi.
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'

// Data yang dikirim frontend ketika pengunjung membuat reservasi.
export interface BookingCreateRequest {
  villaId: number
  guestName: string
  guestEmail: string
  guestPhone: string
  checkIn: string
  checkOut: string
  guestCount: number
  specialRequest?: string | null
}

// Data reservasi yang dikembalikan backend setelah berhasil disimpan.
export interface BookingRecord {
  id: number
  bookingCode: string
  villaId: number
  villaName: string
  guestName: string
  guestEmail: string
  guestPhone: string
  checkIn: string
  checkOut: string
  nights: number
  guestCount: number
  specialRequest: string | null
  totalPrice: number
  status: BookingStatus
  createdAt: string
}

// Format respons ketika reservasi berhasil dibuat.
export interface BookingCreateResponse {
  success: true
  message: string
  data: BookingRecord
}

// Format respons jika backend menemukan kesalahan.
export interface ApiErrorResponse {
  success: false
  message: string
  fieldErrors?: Record<string, string[]>
}