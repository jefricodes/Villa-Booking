-- Migration number: 0006
-- Membuat tabel pembatasan percobaan login admin.

CREATE TABLE IF NOT EXISTS admin_login_rate_limits (
    email TEXT NOT NULL COLLATE NOCASE,
    ip_address TEXT NOT NULL,
    window_started_at INTEGER NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (email, ip_address)
);

CREATE INDEX IF NOT EXISTS idx_admin_login_rate_limits_window
ON admin_login_rate_limits(window_started_at);
