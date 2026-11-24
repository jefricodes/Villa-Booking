
import type { Villa } from '#shared/types/villa'

export const villas: Villa[] = [
  {
    id: 1,
    slug: 'nusa',
    name: 'Villa Nusa',
    pricePerNight: 1500000,
    capacity: 4,
    bedrooms: 2,
    bathrooms: 2,
    location: 'Lokasi Villa 01',
    description:
      'Villa nyaman dengan suasana tropis, kolam renang pribadi, dan pemandangan taman yang indah.',
    imageUrl:
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200'
    ],
    amenities: [
      'Private Pool',
      'WiFi',
      'Air Conditioning',
      'Kitchen',
      'Parking'
    ]
  },

  {
    id: 2,
    slug: 'senja',
    name: 'Villa Senja',
    pricePerNight: 1800000,
    capacity: 6,
    bedrooms: 3,
    bathrooms: 2,
    location: 'Lokasi Villa 02',
    description:
      'Villa luas untuk keluarga dengan desain modern, kolam renang, dan area bersantai.',
    imageUrl:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200'
    ],
    amenities: [
      'Private Pool',
      'WiFi',
      'Air Conditioning',
      'Parking',
      'Family Room'
    ]
  },

  {
    id: 3,
    slug: 'aruna',
    name: 'Villa Aruna',
    pricePerNight: 1200000,
    capacity: 2,
    bedrooms: 1,
    bathrooms: 1,
    location: 'Lokasi Villa 03',
    description:
      'Villa privat untuk pasangan dengan suasana tenang, nyaman, dan desain minimalis.',
    imageUrl:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200'
    ],
    amenities: [
      'WiFi',
      'Air Conditioning',
      'Kitchen',
      'Private Garden'
    ]
  },

  {
    id: 4,
    slug: 'lestari',
    name: 'Villa Lestari',
    pricePerNight: 2000000,
    capacity: 8,
    bedrooms: 4,
    bathrooms: 3,
    location: 'Lokasi Villa 04',
    description:
      'Villa keluarga dengan ruang luas, fasilitas lengkap, dan tempat berkumpul bersama.',
    imageUrl:
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200'
    ],
    amenities: [
      'Private Pool',
      'WiFi',
      'Air Conditioning',
      'Kitchen',
      'Parking',
      'Family Room'
    ]
  },

  {
    id: 5,
    slug: 'purnama',
    name: 'Villa Purnama',
    pricePerNight: 1600000,
    capacity: 5,
    bedrooms: 2,
    bathrooms: 2,
    location: 'Lokasi Villa 05',
    description:
      'Villa dengan suasana alami untuk menikmati liburan bersama keluarga dan teman.',
    imageUrl:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200'
    ],
    amenities: [
      'Private Pool',
      'WiFi',
      'Air Conditioning',
      'Parking',
      'Kitchen'
    ]
  }
]
