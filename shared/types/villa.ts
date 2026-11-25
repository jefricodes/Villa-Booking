export interface VillaRecord extends Villa {
  isActive : boolean
}

export interface Villa {
  id: number
  slug: string
  name: string
  pricePerNight: number
  capacity: number
  bedrooms: number
  bathrooms: number
  location: string
  description: string
  imageUrl: string
  gallery: string[]
  amenities: string[]
}