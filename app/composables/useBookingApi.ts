import type {
  BookingCreateRequest,
  BookingCreateResponse
} from '#shared/types/booking'

export function useBookingApi() {
  async function createBooking(
    payload: BookingCreateRequest
  ): Promise<BookingCreateResponse> {
    return await $fetch<BookingCreateResponse>('/api/bookings', {
      method: 'POST',
      body: payload
    })
  }

  return {
    createBooking
  }
}