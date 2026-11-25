-- Migration number: 0001 	 2026-11-25T11:38:35.736Z

-- ==================================
-- TABLE: VILLAS
-- ==================================

CREATE TABLE IF NOT EXISTS villas (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  slug TEXT NOT NULL UNIQUE,

  name TEXT NOT NULL,

  price_per_night INTEGER NOT NULL
    CHECK (price_per_night >= 0),

  capacity INTEGER NOT NULL
    CHECK (capacity > 0),

  bedrooms INTEGER NOT NULL
    CHECK (bedrooms > 0),

  bathrooms INTEGER NOT NULL
    CHECK (bathrooms > 0),

  location TEXT NOT NULL,

  description TEXT NOT NULL,

  image_url TEXT NOT NULL,

  gallery_json TEXT NOT NULL DEFAULT '[]',

  amenities_json TEXT NOT NULL DEFAULT '[]',

  is_active INTEGER NOT NULL DEFAULT 1
    CHECK (is_active IN (0, 1)),

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP

);


-- ==================================
-- TABLE: BOOKINGS
-- ==================================

CREATE TABLE IF NOT EXISTS bookings (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  booking_code TEXT NOT NULL UNIQUE,

  villa_id INTEGER NOT NULL,

  guest_name TEXT NOT NULL,

  guest_phone TEXT NOT NULL,

  guest_email TEXT,

  check_in TEXT NOT NULL,

  check_out TEXT NOT NULL,

  guest_count INTEGER NOT NULL
    CHECK (guest_count > 0),

  special_request TEXT,

  total_price INTEGER NOT NULL
    CHECK (total_price >= 0),

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (
      status IN (
        'pending',
        'confirmed',
        'cancelled',
        'completed'
      )
    ),

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CHECK (check_out > check_in),

  FOREIGN KEY (villa_id)
    REFERENCES villas(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT

);


-- ==================================
-- INDEXES
-- ==================================

CREATE INDEX IF NOT EXISTS idx_bookings_villa_dates
ON bookings (villa_id, check_in, check_out);


CREATE INDEX IF NOT EXISTS idx_bookings_status
ON bookings (status);


CREATE INDEX IF NOT EXISTS idx_villas_active
ON villas (is_active);
