-- Migration number: 0002 	 2026-11-25T11:40:36.771Z

INSERT INTO villas (
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
  amenities_json,
  is_active
)
VALUES

(
  'nusa',
  'Villa Nusa',
  1500000,
  4,
  2,
  2,
  'Lokasi Villa 01',
  'Villa nyaman dengan suasana tropis dan taman yang indah.',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200',
  '[]',
  '["Private Pool","WiFi","Air Conditioning","Kitchen","Parking"]',
  1
),

(
  'senja',
  'Villa Senja',
  1800000,
  6,
  3,
  2,
  'Lokasi Villa 02',
  'Villa luas untuk keluarga dengan desain modern.',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
  '[]',
  '["Private Pool","WiFi","Air Conditioning","Parking"]',
  1
),

(
  'aruna',
  'Villa Aruna',
  1200000,
  2,
  1,
  1,
  'Lokasi Villa 03',
  'Villa privat untuk pasangan dengan suasana tenang.',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
  '[]',
  '["WiFi","Air Conditioning","Kitchen"]',
  1
),

(
  'lestari',
  'Villa Lestari',
  2000000,
  8,
  4,
  3,
  'Lokasi Villa 04',
  'Villa keluarga dengan ruang luas dan fasilitas lengkap.',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200',
  '[]',
  '["Private Pool","WiFi","Air Conditioning","Kitchen","Parking"]',
  1
),

(
  'purnama',
  'Villa Purnama',
  1600000,
  5,
  2,
  2,
  'Lokasi Villa 05',
  'Villa dengan suasana alami untuk liburan bersama keluarga.',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200',
  '[]',
  '["Private Pool","WiFi","Air Conditioning","Parking"]',
  1
);
