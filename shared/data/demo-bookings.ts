
import type { DemoBooking } from '#shared/types/demo-booking'

export const demoBookings: DemoBooking[] = [
  {
    id: 1,
    villaId: 1,
    checkIn: '2026-12-10',
    checkOut: '2026-12-13',
    status: 'confirmed'
  },

  {
    id: 2,
    villaId: 2,
    checkIn: '2026-12-20',
    checkOut: '2026-12-23',
    status: 'pending'
  },

  {
    id: 3,
    villaId: 3,
    checkIn: '2026-12-05',
    checkOut: '2026-12-08',
    status: 'cancelled'
  }
]
