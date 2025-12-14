/**
 * Locations Routes
 * GPS location tracking and geofencing
 */

const express = require('express');
const { param, query, body, validationResult } = require('express-validator');
const { APIError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../middleware/logger');
const { devices } = require('./devices');

const router = express.Router();

// In-memory location history (replace with time-series database in production)
const locationHistory = new Map();

// ============================================
// GET /api/v1/locations/:deviceId
// Get current device location
// ============================================
router.get('/:deviceId', [
    param('deviceId').notEmpty()
], asyncHandler(async (req, res) => {
    const device = devices.get(req.params.deviceId);

    if (!device) {
        throw new APIError('Device not found', 404, 'DEVICE_NOT_FOUND');
    }

    if (device.owner_id !== req.user.userId) {
        throw new APIError('Access denied', 403, 'ACCESS_DENIED');
    }

    if (!device.current_location) {
        throw new APIError('No location data available', 404, 'NO_LOCATION');
    }

    res.json({
        success: true,
        data: {
            latitude: device.current_location.latitude,
            longitude: device.current_location.longitude,
            accuracy_m: device.current_location.accuracy_m,
            timestamp: device.current_location.timestamp,
            gps_fix: device.status.gps_fix
        }
    });
}));

// ============================================
// GET /api/v1/locations/:deviceId/history
// Get location history
// ============================================
router.get('/:deviceId/history', [
    param('deviceId').notEmpty(),
    query('days').optional().isInt({ min: 1, max: 90 }).toInt()
], asyncHandler(async (req, res) => {
    const device = devices.get(req.params.deviceId);

    if (!device) {
        throw new APIError('Device not found', 404, 'DEVICE_NOT_FOUND');
    }

    if (device.owner_id !== req.user.userId) {
        throw new APIError('Access denied', 403, 'ACCESS_DENIED');
    }

    const days = req.query.days || 7;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get location history for device
    const history = locationHistory.get(req.params.deviceId) || [];
    const filteredHistory = history.filter(loc => new Date(loc.timestamp) >= cutoffDate);

    // If no history, generate some mock data
    const responseData = filteredHistory.length > 0 ? filteredHistory : generateMockHistory(device, days);

    res.json({
        success: true,
        data: responseData,
        meta: {
            device_id: req.params.deviceId,
            days_requested: days,
            points_count: responseData.length
        }
    });
}));

// ============================================
// POST /api/v1/locations/:deviceId
// Update device location (from device)
// ============================================
router.post('/:deviceId', [
    param('deviceId').notEmpty(),
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 }),
    body('accuracy_m').optional().isFloat({ min: 0 }),
    body('altitude_m').optional().isFloat()
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new APIError('Validation failed', 400, 'VALIDATION_ERROR');
    }

    const device = devices.get(req.params.deviceId);

    if (!device) {
        throw new APIError('Device not found', 404, 'DEVICE_NOT_FOUND');
    }

    const { latitude, longitude, accuracy_m, altitude_m } = req.body;
    const timestamp = new Date().toISOString();

    // Update current location
    device.current_location = {
        latitude,
        longitude,
        accuracy_m: accuracy_m || 5,
        altitude_m: altitude_m || null,
        timestamp
    };

    // Store in history
    if (!locationHistory.has(req.params.deviceId)) {
        locationHistory.set(req.params.deviceId, []);
    }
    locationHistory.get(req.params.deviceId).push({
        latitude,
        longitude,
        accuracy_m: accuracy_m || 5,
        timestamp
    });

    // Check geofence
    if (device.geofence) {
        const distance = calculateDistance(
            latitude, longitude,
            device.geofence.center.lat, device.geofence.center.lng
        );

        if (distance > device.geofence.radius_m && device.geofence.alert_on_exit) {
            // Emit geofence alert
            const io = req.app.get('io');
            io.to(`user:${device.owner_id}`).emit('alert:geofence', {
                deviceId: device.id,
                deviceName: device.name,
                type: 'exit',
                distance_m: Math.round(distance),
                timestamp
            });

            logger.logSecurityEvent('GEOFENCE_EXIT', {
                deviceId: device.id,
                distance_m: distance,
                location: { latitude, longitude }
            });
        }
    }

    // Emit real-time location update
    const io = req.app.get('io');
    io.to(`device:${device.id}`).emit('device:location', {
        deviceId: device.id,
        location: device.current_location
    });

    res.json({
        success: true,
        data: {
            received: true,
            timestamp
        }
    });
}));

// ============================================
// POST /api/v1/locations/:deviceId/geofence
// Set geofence for device
// ============================================
router.post('/:deviceId/geofence', [
    param('deviceId').notEmpty(),
    body('radius_m').isFloat({ min: 10, max: 10000 }),
    body('center.lat').isFloat({ min: -90, max: 90 }),
    body('center.lng').isFloat({ min: -180, max: 180 }),
    body('alert_on_exit').optional().isBoolean(),
    body('alert_on_enter').optional().isBoolean()
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new APIError('Validation failed', 400, 'VALIDATION_ERROR');
    }

    const device = devices.get(req.params.deviceId);

    if (!device) {
        throw new APIError('Device not found', 404, 'DEVICE_NOT_FOUND');
    }

    if (device.owner_id !== req.user.userId) {
        throw new APIError('Access denied', 403, 'ACCESS_DENIED');
    }

    const { radius_m, center, alert_on_exit, alert_on_enter } = req.body;

    device.geofence = {
        center: { lat: center.lat, lng: center.lng },
        radius_m,
        alert_on_exit: alert_on_exit !== false,
        alert_on_enter: alert_on_enter === true
    };

    logger.info('Geofence updated', { deviceId: device.id, userId: req.user.userId, geofence: device.geofence });

    res.json({
        success: true,
        data: device.geofence
    });
}));

// ============================================
// DELETE /api/v1/locations/:deviceId/geofence
// Remove geofence
// ============================================
router.delete('/:deviceId/geofence', [
    param('deviceId').notEmpty()
], asyncHandler(async (req, res) => {
    const device = devices.get(req.params.deviceId);

    if (!device) {
        throw new APIError('Device not found', 404, 'DEVICE_NOT_FOUND');
    }

    if (device.owner_id !== req.user.userId) {
        throw new APIError('Access denied', 403, 'ACCESS_DENIED');
    }

    device.geofence = null;

    res.json({
        success: true,
        message: 'Geofence removed'
    });
}));

// ============================================
// GET /api/v1/locations/nearby
// Find devices near a location
// ============================================
router.get('/nearby/search', [
    query('lat').isFloat({ min: -90, max: 90 }),
    query('lng').isFloat({ min: -180, max: 180 }),
    query('radius_m').optional().isFloat({ min: 10, max: 50000 }).toFloat()
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new APIError('Validation failed', 400, 'VALIDATION_ERROR');
    }

    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = req.query.radius_m || 500;

    const nearbyDevices = [];

    for (const [, device] of devices) {
        if (device.owner_id !== req.user.userId) continue;
        if (!device.current_location) continue;

        const distance = calculateDistance(
            lat, lng,
            device.current_location.latitude,
            device.current_location.longitude
        );

        if (distance <= radius) {
            nearbyDevices.push({
                device_id: device.id,
                name: device.name,
                distance_m: Math.round(distance),
                status: device.status.is_locked ? 'locked' : 'unlocked'
            });
        }
    }

    // Sort by distance
    nearbyDevices.sort((a, b) => a.distance_m - b.distance_m);

    res.json({
        success: true,
        data: nearbyDevices,
        meta: {
            search_center: { lat, lng },
            radius_m: radius,
            count: nearbyDevices.length
        }
    });
}));

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

/**
 * Generate mock location history for demo
 */
function generateMockHistory(device, days) {
    const history = [];
    const baseLocation = device.current_location;

    if (!baseLocation) return history;

    // Generate hourly points for the past N days
    const pointsPerDay = 24;
    const totalPoints = Math.min(days * pointsPerDay, 168); // Max 7 days of hourly data

    for (let i = 0; i < totalPoints; i++) {
        const timestamp = new Date(Date.now() - i * 3600000);
        // Add small random variations
        history.push({
            latitude: baseLocation.latitude + (Math.random() - 0.5) * 0.001,
            longitude: baseLocation.longitude + (Math.random() - 0.5) * 0.001,
            accuracy_m: 2 + Math.random() * 5,
            timestamp: timestamp.toISOString()
        });
    }

    return history.reverse();
}

module.exports = router;
