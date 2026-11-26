
import type { Villa } from './villa'


// Response GET /api/villas
export interface VillasApiResponse {
  success: boolean
  count: number
  data: Villa[]
}


// Response GET /api/villas/by-slug/:slug
export interface VillaDetailApiResponse {
  success: boolean
  data: Villa
}
