-- Migration number: 0003 	 2026-11-26T05:53:56.500Z

-- ==========================================
-- VILLA NUSA
-- ==========================================

UPDATE villas

SET gallery_json = '[
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200"
]'

WHERE slug = 'nusa';


-- ==========================================
-- VILLA SENJA
-- ==========================================

UPDATE villas

SET gallery_json = '[
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200"
]'

WHERE slug = 'senja';


-- ==========================================
-- VILLA ARUNA
-- ==========================================

UPDATE villas

SET gallery_json = '[
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200"
]'

WHERE slug = 'aruna';


-- ==========================================
-- VILLA LESTARI
-- ==========================================

UPDATE villas

SET gallery_json = '[
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200"
]'

WHERE slug = 'lestari';


-- ==========================================
-- VILLA PURNAMA
-- ==========================================

UPDATE villas

SET gallery_json = '[
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200"
]'

WHERE slug = 'purnama';
