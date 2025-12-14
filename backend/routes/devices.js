/**
 * Devices Routes
 * CRUD operations for smart locker devices
 */

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { APIError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../middleware/logger');

const router = express.Router();

// In-memory device store (replace with database in production)
const devices = new Map();

// Add demo devices
const demoDevices = [
    {
        id: 'dev_cassapanca_001',
        owner_id: 'usr_demo',
        name: 'Cassapanca Giardino',
        model: 'CassapancaPro-2025',
        firmware_version: '1.4.2',
        hardware_specs: {
            gps_module: 'uBlox_NEO_M9N',
            lte_module: 'Simcom_SIM7670SA',
            battery_capacity_mah: 5000,
            mcu: 'Nordic_nRF5340'
        },
        current_location: {
            latitude: 45.052,
            longitude: 9.695,
            accuracy_m: 2.5,
            timestamp: new Date().toISOString()
        },
        status: {
            is_locked: true,
            battery_percent: 78,
            signal_strength: -85,
            gps_fix: '3D',
            last_checkin: new Date().toISOString()
        },
        geofence: {
            center: { lat: 45.052, lng: 9.695 },
            radius_m: 50,
            alert_on_exit: true
        },
        created_at: new Date().toISOString()
    },
    {
        id: 'dev_cassapanca_002',
        owner_id: 'usr_demo',
        name: 'Cassapanca Ingresso',
        model: 'CassapancaPro-2025',
        firmware_version: '1.4.2',
        hardware_specs: {
            gps_module: 'uBlox_NEO_M9N',
            lte_module: 'Simcom_SIM7670SA',
            battery_capacity_mah: 5000,
            mcu: 'Nordic_nRF5340'
        },
        current_location: {
            latitude: 45.054,
            longitude: 9.698,
            accuracy_m: 1.8,
            timestamp: new Date().toISOString()
        },
        status: {
            is_locked: true,
            battery_percent: 92,
            signal_strength: -72,
            gps_fix: '3D',
            last_checkin: new Date().toISOString()
        },
        geofence: {
            center: { lat: 45.054, lng: 9.698 },
            radius_m: 30,
            alert_on_exit: true
        },
        created_at: new Date().toISOString()
    },
    {
        id: 'dev_cassapanca_003',
        owner_id: 'usr_demo',
        name: 'Cassapanca Garage',
        model: 'CassapancaPro-2025',
        firmware_version: '1.4.1',
        hardware_specs: {
            gps_module: 'uBlox_NEO_M9N',
            lte_module: 'Simcom_SIM7670SA',
            battery_capacity_mah: 5000,
            mcu: 'Nordic_nRF5340'
        },
        current_location: {
            latitude: 45.050,
            longitude: 9.692,
            accuracy_m: 5.2,
            timestamp: new Date().toISOString()
        },
        status: {
            is_locked: false,
            battery_percent: 45,
            signal_strength: -90,
            gps_fix: '2D',
            last_checkin: new Date(Date.now() - 3600000).toISOString()
        },
        geofence: {
            center: { lat: 45.050, lng: 9.692 },
            radius_m: 100,
            alert_on_exit: true
        },
        created_at: new Date().toISOString()
    }
];

demoDevices.forEach(device => devices.set(device.id, device));

// ============================================
// GET /api/v1/devices
// List all devices for current user
// ============================================
router.get('/', asyncHandler(async (req, res) => {
    const userDevices = [];

    for (const [, device] of devices) {
        if (device.owner_id === req.user.userId) {
            userDevices.push(sanitizeDevice(device));
        }
    }

    res.json({
        success: true,
        data: userDevices,
        meta: {
            total: userDevices.length
        }
    });
}));

// ============================================
// GET /api/v1/devices/:id
// Get single device details
// ============================================
router.get('/:id', [
    param('id').notEmpty()
], asyncHandler(async (req, res) => {
    const device = devices.get(req.params.id);

    if (!device) {
        throw new APIError('Device not found', 404, 'DEVICE_NOT_FOUND');
    }

    // Check ownership or shared access
    if (device.owner_id !== req.user.userId) {
        throw new APIError('Access denied', 403, 'ACCESS_DENIED');
    }

    res.json({
        success: true,
        data: sanitizeDevice(device)
    });
}));

// ============================================
// POST /api/v1/devices
// Register new device
// ============================================
router.post('/', [
    body('name').trim().isLength({ min: 2, max: 50 }),
    body('serial_number').optional().trim()
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new APIError('Validation failed', 400, 'VALIDATION_ERROR');
    }

    const { name, serial_number } = req.body;

    const device = {
        id: `dev_${uuidv4().slice(0, 12)}`,
        owner_id: req.user.userId,
        name,
        serial_number,
        model: 'CassapancaPro-2025',
        firmware_version: '1.4.2',
        hardware_specs: {
            gps_module: 'uBlox_NEO_M9N',
            lte_module: 'Simcom_SIM7670SA',
            battery_capacity_mah: 5000,
            mcu: 'Nordic_nRF5340'
        },
        current_location: null,
        status: {
            is_locked: true,
            battery_percent: 100,
            signal_strength: null,
            gps_fix: null,
            last_checkin: null
        },
        geofence: null,
        created_at: new Date().toISOString()
    };

    devices.set(device.id, device);

    logger.info('Device registered', { deviceId: device.id, userId: req.user.userId });

    res.status(201).json({
        success: true,
        data: sanitizeDevice(device)
    });
}));

// ============================================
// PATCH /api/v1/devices/:id
// Update device settings
// ============================================
router.patch('/:id', [
    param('id').notEmpty(),
    body('name').optional().trim().isLength({ min: 2, max: 50 })
], asyncHandler(async (req, res) => {
    const device = devices.get(req.params.id);

    if (!device) {
        throw new APIError('Device not found', 404, 'DEVICE_NOT_FOUND');
    }

    if (device.owner_id !== req.user.userId) {
        throw new APIError('Access denied', 403, 'ACCESS_DENIED');
    }

    const { name, geofence } = req.body;

    if (name) device.name = name;
    if (geofence) device.geofence = geofence;

    logger.info('Device updated', { deviceId: device.id, userId: req.user.userId });

    res.json({
        success: true,
        data: sanitizeDevice(device)
    });
}));

// ============================================
// DELETE /api/v1/devices/:id
// Delete device
// ============================================
router.delete('/:id', [
    param('id').notEmpty()
], asyncHandler(async (req, res) => {
    const device = devices.get(req.params.id);

    if (!device) {
        throw new APIError('Device not found', 404, 'DEVICE_NOT_FOUND');
    }

    if (device.owner_id !== req.user.userId) {
        throw new APIError('Access denied', 403, 'ACCESS_DENIED');
    }

    devices.delete(req.params.id);

    logger.info('Device deleted', { deviceId: req.params.id, userId: req.user.userId });

    res.json({
        success: true,
        message: 'Device deleted successfully'
    });
}));

// ============================================
// POST /api/v1/devices/:id/lock
// Lock device
// ============================================
router.post('/:id/lock', [
    param('id').notEmpty()
], asyncHandler(async (req, res) => {
    const device = devices.get(req.params.id);

    if (!device) {
        throw new APIError('Device not found', 404, 'DEVICE_NOT_FOUND');
    }

    if (device.owner_id !== req.user.userId) {
        throw new APIError('Access denied', 403, 'ACCESS_DENIED');
    }

    device.status.is_locked = true;
    device.status.last_checkin = new Date().toISOString();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`device:${device.id}`).emit('device:status', {
        deviceId: device.id,
        status: device.status
    });

    logger.logAccess(device.id, req.user.userId, 'lock', true, 'api');

    res.json({
        success: true,
        data: {
            is_locked: true,
            timestamp: new Date().toISOString()
        }
    });
}));

// ============================================
// POST /api/v1/devices/:id/unlock
// Unlock device
// ============================================
router.post('/:id/unlock', [
    param('id').notEmpty(),
    body('reason').optional().trim()
], asyncHandler(async (req, res) => {
    const device = devices.get(req.params.id);

    if (!device) {
        throw new APIError('Device not found', 404, 'DEVICE_NOT_FOUND');
    }

    if (device.owner_id !== req.user.userId) {
        throw new APIError('Access denied', 403, 'ACCESS_DENIED');
    }

    device.status.is_locked = false;
    device.status.last_checkin = new Date().toISOString();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`device:${device.id}`).emit('device:status', {
        deviceId: device.id,
        status: device.status
    });

    logger.logAccess(device.id, req.user.userId, 'unlock', true, 'api');

    res.json({
        success: true,
        data: {
            is_locked: false,
            timestamp: new Date().toISOString()
        }
    });
}));

// ============================================
// GET /api/v1/devices/:id/status
// Get device status
// ============================================
router.get('/:id/status', [
    param('id').notEmpty()
], asyncHandler(async (req, res) => {
    const device = devices.get(req.params.id);

    if (!device) {
        throw new APIError('Device not found', 404, 'DEVICE_NOT_FOUND');
    }

    if (device.owner_id !== req.user.userId) {
        throw new APIError('Access denied', 403, 'ACCESS_DENIED');
    }

    res.json({
        success: true,
        data: device.status
    });
}));

// Helper function to sanitize device data
function sanitizeDevice(device) {
    return {
        id: device.id,
        name: device.name,
        model: device.model,
        firmware_version: device.firmware_version,
        hardware_specs: device.hardware_specs,
        current_location: device.current_location,
        status: device.status,
        geofence: device.geofence,
        created_at: device.created_at
    };
}

// Export devices map for use in other routes
module.exports = router;
module.exports.devices = devices;
