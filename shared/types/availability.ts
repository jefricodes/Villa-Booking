
export interface AvailabilityCheckResponse {

  success: boolean

  available: boolean

  message: string

  villa: {
    id: number
    name: string
    capacity: number
  }

  stay: {
    checkIn: string
    checkOut: string
    nights: number
  }

  price: {
    perNight: number
    totalPrice: number
  }

}
