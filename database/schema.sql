-- ============================================
-- SuperNØva Smart Locker - Database Schema
-- PostgreSQL with UUID and JSONB support
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS Table
-- Core user accounts and authentication
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
    subscription_expires_at TIMESTAMPTZ,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_tier);

-- ============================================
-- DEVICES Table
-- Smart locker device registry
-- ============================================
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    serial_number VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    model VARCHAR(50) DEFAULT 'CassapancaPro-2025',
    firmware_version VARCHAR(20),
    hardware_specs JSONB DEFAULT '{
        "gps_module": "uBlox_NEO_M9N",
        "lte_module": "Simcom_SIM7670SA",
        "battery_capacity_mah": 5000,
        "mcu": "Nordic_nRF5340"
    }',

    -- Current status (updated in real-time)
    is_locked BOOLEAN DEFAULT TRUE,
    battery_percent SMALLINT CHECK (battery_percent >= 0 AND battery_percent <= 100),
    signal_strength SMALLINT,
    gps_fix VARCHAR(10), -- '2D', '3D', 'none'
    last_checkin TIMESTAMPTZ,

    -- Current location
    current_latitude DECIMAL(10, 7),
    current_longitude DECIMAL(10, 7),
    location_accuracy DECIMAL(5, 2),
    location_updated_at TIMESTAMPTZ,

    -- Geofence configuration
    geofence_center_lat DECIMAL(10, 7),
    geofence_center_lng DECIMAL(10, 7),
    geofence_radius_m SMALLINT,
    geofence_alert_on_exit BOOLEAN DEFAULT TRUE,
    geofence_alert_on_enter BOOLEAN DEFAULT FALSE,

    -- Timestamps
    activated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_devices_owner ON devices(owner_id);
CREATE INDEX idx_devices_serial ON devices(serial_number);
CREATE INDEX idx_devices_location ON devices(current_latitude, current_longitude);

-- ============================================
-- PERMISSIONS Table
-- Shared access permissions
-- ============================================
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('viewer', 'manager', 'admin')),

    -- Granular permissions
    can_unlock BOOLEAN DEFAULT FALSE,
    can_view_location BOOLEAN DEFAULT TRUE,
    can_view_logs BOOLEAN DEFAULT FALSE,
    can_manage_shares BOOLEAN DEFAULT FALSE,

    -- Metadata
    share_token VARCHAR(50) UNIQUE,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,

    UNIQUE(device_id, user_email)
);

CREATE INDEX idx_permissions_device ON permissions(device_id);
CREATE INDEX idx_permissions_user ON permissions(user_id);
CREATE INDEX idx_permissions_email ON permissions(user_email);
CREATE INDEX idx_permissions_token ON permissions(share_token);

-- ============================================
-- ACCESS_LOGS Table
-- Audit trail for all device accesses
-- ============================================
CREATE TABLE access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    user_name VARCHAR(100),
    user_email VARCHAR(255),

    -- Action details
    action VARCHAR(20) NOT NULL CHECK (action IN ('unlock', 'lock', 'status_check', 'location_update')),
    method VARCHAR(30) NOT NULL CHECK (method IN ('app', 'nfc', 'ble', 'temp_code', 'api', 'auto', 'emergency')),
    granted BOOLEAN NOT NULL,
    failure_reason VARCHAR(100),

    -- Location at time of access
    access_latitude DECIMAL(10, 7),
    access_longitude DECIMAL(10, 7),

    -- Device state at time of access
    device_battery SMALLINT,
    device_signal SMALLINT,

    -- Additional context
    ip_address INET,
    user_agent VARCHAR(255),
    notes TEXT,

    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Partition access_logs by month for better performance
-- This is a simplified version; in production, use proper partitioning

CREATE INDEX idx_access_logs_device ON access_logs(device_id);
CREATE INDEX idx_access_logs_user ON access_logs(user_id);
CREATE INDEX idx_access_logs_timestamp ON access_logs(timestamp DESC);
CREATE INDEX idx_access_logs_device_time ON access_logs(device_id, timestamp DESC);

-- ============================================
-- LOCATION_HISTORY Table
-- Time-series location data
-- ============================================
CREATE TABLE location_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    accuracy_m DECIMAL(5, 2),
    altitude_m DECIMAL(7, 2),
    speed_mps DECIMAL(5, 2),
    heading SMALLINT,
    source VARCHAR(20) DEFAULT 'gps' CHECK (source IN ('gps', 'lte', 'wifi', 'ble')),
    battery_at_reading SMALLINT,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_location_history_device ON location_history(device_id);
CREATE INDEX idx_location_history_time ON location_history(timestamp DESC);
CREATE INDEX idx_location_history_device_time ON location_history(device_id, timestamp DESC);

-- ============================================
-- SHARE_TOKENS Table
-- Temporary access codes
-- ============================================
CREATE TABLE share_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    created_by UUID REFERENCES users(id),

    -- Validity
    valid_from TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    max_uses SMALLINT DEFAULT 1,
    use_count SMALLINT DEFAULT 0,

    -- Usage tracking
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMPTZ,
    used_by_ip INET,

    -- Context
    note VARCHAR(255),

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_share_tokens_device ON share_tokens(device_id);
CREATE INDEX idx_share_tokens_code ON share_tokens(code);
CREATE INDEX idx_share_tokens_expires ON share_tokens(expires_at);

-- ============================================
-- ALERTS Table
-- System and device alerts
-- ============================================
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    type VARCHAR(30) NOT NULL CHECK (type IN (
        'low_battery', 'geofence_exit', 'geofence_enter', 'tamper_detected',
        'unauthorized_access', 'device_offline', 'firmware_update', 'subscription_expiring'
    )),
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    title VARCHAR(100) NOT NULL,
    message TEXT,
    data JSONB,

    -- Status
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    dismissed BOOLEAN DEFAULT FALSE,
    dismissed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_user ON alerts(user_id);
CREATE INDEX idx_alerts_device ON alerts(device_id);
CREATE INDEX idx_alerts_unread ON alerts(user_id, read) WHERE read = FALSE;

-- ============================================
-- ALERT_SETTINGS Table
-- User alert preferences
-- ============================================
CREATE TABLE alert_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,

    -- Alert types enabled
    low_battery_enabled BOOLEAN DEFAULT TRUE,
    low_battery_threshold SMALLINT DEFAULT 20,
    geofence_exit_enabled BOOLEAN DEFAULT TRUE,
    geofence_enter_enabled BOOLEAN DEFAULT FALSE,
    tamper_enabled BOOLEAN DEFAULT TRUE,
    unauthorized_access_enabled BOOLEAN DEFAULT TRUE,
    device_offline_enabled BOOLEAN DEFAULT TRUE,
    device_offline_minutes SMALLINT DEFAULT 60,

    -- Notification channels
    push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT FALSE,
    sms_enabled BOOLEAN DEFAULT FALSE,

    -- Quiet hours
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, device_id)
);

-- ============================================
-- REFRESH_TOKENS Table
-- JWT refresh token storage
-- ============================================
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device_info VARCHAR(255),
    ip_address INET,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- ============================================
-- Triggers for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at
    BEFORE UPDATE ON devices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_settings_updated_at
    BEFORE UPDATE ON alert_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Views for common queries
-- ============================================

-- Active devices with owner info
CREATE VIEW v_devices_with_owner AS
SELECT
    d.*,
    u.email AS owner_email,
    u.name AS owner_name,
    u.subscription_tier AS owner_subscription
FROM devices d
JOIN users u ON d.owner_id = u.id;

-- Recent access logs with device info
CREATE VIEW v_recent_access_logs AS
SELECT
    al.*,
    d.name AS device_name,
    d.model AS device_model
FROM access_logs al
JOIN devices d ON al.device_id = d.id
WHERE al.timestamp > CURRENT_TIMESTAMP - INTERVAL '7 days'
ORDER BY al.timestamp DESC;

-- ============================================
-- Sample Data for Development
-- ============================================

-- Insert demo user
INSERT INTO users (id, email, password_hash, name, role, subscription_tier, email_verified)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'demo@example.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.V4ferIkwb.gxpW', -- password123
    'Demo User',
    'user',
    'premium',
    TRUE
);

-- Insert demo devices
INSERT INTO devices (id, owner_id, serial_number, name, is_locked, battery_percent, gps_fix, current_latitude, current_longitude)
VALUES
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CP2025-001', 'Cassapanca Giardino', TRUE, 78, '3D', 45.052, 9.695),
    ('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CP2025-002', 'Cassapanca Ingresso', TRUE, 92, '3D', 45.054, 9.698),
    ('b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CP2025-003', 'Cassapanca Garage', FALSE, 45, '2D', 45.050, 9.692);

-- ============================================
-- Maintenance Commands
-- ============================================

-- Clean up old location history (older than 90 days)
-- Run periodically via cron job
-- DELETE FROM location_history WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '90 days';

-- Clean up old access logs (older than 1 year for free tier)
-- DELETE FROM access_logs WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '365 days';

-- Clean up expired share tokens
-- DELETE FROM share_tokens WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '7 days';
