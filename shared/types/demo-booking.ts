export type DemoBookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'

export interface DemoBooking {
  id: number
  villaId: number
  checkIn: string
  checkOut: string
  status: DemoBookingStatus
}