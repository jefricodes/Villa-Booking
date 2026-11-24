
export default defineEventHandler(() => {

  return {
    success: true,

    message: 'Villa Booking API is running.',

    service: 'Villa Booking System',

    timestamp: new Date().toISOString()
  }

})
