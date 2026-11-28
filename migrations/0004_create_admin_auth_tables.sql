-- Migration number: 0004 	 2026-11-27T12:23:23.927Z
-- Tabel akun administrator
CREATE TABLE admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    email TEXT NOT NULL COLLATE NOCASE UNIQUE,

    password_hash TEXT NOT NULL,

    password_salt TEXT NOT NULL,

    password_iterations INTEGER NOT NULL,

    role TEXT NOT NULL DEFAULT 'admin'
        CHECK (role IN ('admin')),

    is_active INTEGER NOT NULL DEFAULT 1
        CHECK (is_active IN (0, 1)),

    last_login_at TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabel session administrator
CREATE TABLE admin_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    admin_id INTEGER NOT NULL,

    token_hash TEXT NOT NULL UNIQUE,

    expires_at TEXT NOT NULL,

    last_used_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (admin_id)
        REFERENCES admin_users(id)
        ON DELETE CASCADE
);

-- Mempercepat pencarian session berdasarkan admin
CREATE INDEX idx_admin_sessions_admin_id
ON admin_sessions(admin_id);

-- Mempercepat pemeriksaan masa berlaku session
CREATE INDEX idx_admin_sessions_expires_at
ON admin_sessions(expires_at);