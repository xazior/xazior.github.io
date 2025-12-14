/**
 * Logs Routes
 * Access logs and audit trail
 */

const express = require('express');
const { param, query, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { APIError, asyncHandler } = require('../middleware/errorHandler');
const { devices } = require('./devices');

const router = express.Router();

// In-memory access logs (replace with database in production)
const accessLogs = [];

// Generate demo logs
const demoLogs = [
    {
        id: `log_${uuidv4().slice(0, 8)}`,
        device_id: 'dev_cassapanca_001',
        user_id: 'usr_demo',
        user_name: 'Leonardo',
        action: 'unlock',
        method: 'app',
        granted: true,
        location: { lat: 45.052, lng: 9.695 },
        device_battery: 78,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        notes: null
    },
    {
        id: `log_${uuidv4().slice(0, 8)}`,
        device_id: 'dev_cassapanca_001',
        user_id: 'temp_code',
        user_name: 'DHL Corriere',
        action: 'unlock',
        method: 'temp_code',
        granted: true,
        location: { lat: 45.052, lng: 9.695 },
        device_battery: 79,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        notes: 'Consegna pacco'
    },
    {
        id: `log_${uuidv4().slice(0, 8)}`,
        device_id: 'dev_cassapanca_001',
        user_id: 'temp_code',
        user_name: 'DHL Corriere',
        action: 'lock',
        method: 'temp_code',
        granted: true,
        location: { lat: 45.052, lng: 9.695 },
        device_battery: 79,
        timestamp: new Date(Date.now() - 3500000).toISOString(),
        notes: null
    },
    {
        id: `log_${uuidv4().slice(0, 8)}`,
        device_id: 'dev_cassapanca_002',
        user_id: 'usr_demo',
        user_name: 'Leonardo',
        action: 'lock',
        method: 'app',
        granted: true,
        location: { lat: 45.054, lng: 9.698 },
        device_battery: 92,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        notes: null
    },
    {
        id: `log_${uuidv4().slice(0, 8)}`,
        device_id: 'dev_cassapanca_003',
        user_id: 'unknown',
        user_name: 'Unknown',
        action: 'unlock',
        method: 'temp_code',
        granted: false,
        location: null,
        device_battery: 46,
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        notes: 'Invalid code attempt'
    },
    {
        id: `log_${uuidv4().slice(0, 8)}`,
        device_id: 'dev_cassapanca_001',
        user_id: 'usr_mamma',
        user_name: 'Mamma',
        action: 'unlock',
        method: 'nfc',
        granted: true,
        location: { lat: 45.052, lng: 9.695 },
        device_battery: 80,
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        notes: null
    },
    {
        id: `log_${uuidv4().slice(0, 8)}`,
        device_id: 'dev_cassapanca_001',
        user_id: 'usr_mamma',
        user_name: 'Mamma',
        action: 'lock',
        method: 'nfc',
        granted: true,
        location: { lat: 45.052, lng: 9.695 },
        device_battery: 80,
        timestamp: new Date(Date.now() - 14000000).toISOString(),
        notes: null
    }
];

accessLogs.push(...demoLogs);

// ============================================
// GET /api/v1/logs
// Get all access logs for user's devices
// ============================================
router.get('/', [
    query('device_id').optional(),
    query('action').optional().isIn(['unlock', 'lock', 'all']),
    query('granted').optional().isBoolean(),
    query('from').optional().isISO8601(),
    query('to').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 1000 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt()
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new APIError('Validation failed', 400, 'VALIDATION_ERROR');
    }

    // Get user's device IDs
    const userDeviceIds = [];
    for (const [, device] of devices) {
        if (device.owner_id === req.user.userId) {
            userDeviceIds.push(device.id);
        }
    }

    // Filter logs
    let filteredLogs = accessLogs.filter(log => userDeviceIds.includes(log.device_id));

    // Apply filters
    if (req.query.device_id) {
        filteredLogs = filteredLogs.filter(log => log.device_id === req.query.device_id);
    }

    if (req.query.action && req.query.action !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.action === req.query.action);
    }

    if (req.query.granted !== undefined) {
        const granted = req.query.granted === 'true';
        filteredLogs = filteredLogs.filter(log => log.granted === granted);
    }

    if (req.query.from) {
        const fromDate = new Date(req.query.from);
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= fromDate);
    }

    if (req.query.to) {
        const toDate = new Date(req.query.to);
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= toDate);
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pagination
    const limit = req.query.limit || 50;
    const offset = req.query.offset || 0;
    const total = filteredLogs.length;
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    res.json({
        success: true,
        data: paginatedLogs,
        meta: {
            total,
            limit,
            offset,
            has_more: offset + limit < total
        }
    });
}));

// ============================================
// GET /api/v1/logs/:deviceId
// Get access logs for specific device
// ============================================
router.get('/:deviceId', [
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

    const deviceLogs = accessLogs
        .filter(log =>
            log.device_id === req.params.deviceId &&
            new Date(log.timestamp) >= cutoffDate
        )
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
        success: true,
        data: deviceLogs,
        meta: {
            device_id: req.params.deviceId,
            days_requested: days,
            total: deviceLogs.length
        }
    });
}));

// ============================================
// GET /api/v1/logs/:deviceId/stats
// Get access statistics for device
// ============================================
router.get('/:deviceId/stats', [
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

    const deviceLogs = accessLogs.filter(log =>
        log.device_id === req.params.deviceId &&
        new Date(log.timestamp) >= cutoffDate
    );

    // Calculate statistics
    const stats = {
        total_accesses: deviceLogs.length,
        successful: deviceLogs.filter(l => l.granted).length,
        failed: deviceLogs.filter(l => !l.granted).length,
        by_action: {
            unlock: deviceLogs.filter(l => l.action === 'unlock').length,
            lock: deviceLogs.filter(l => l.action === 'lock').length
        },
        by_method: {},
        by_user: {},
        by_day: {}
    };

    // Count by method
    deviceLogs.forEach(log => {
        stats.by_method[log.method] = (stats.by_method[log.method] || 0) + 1;
        stats.by_user[log.user_name] = (stats.by_user[log.user_name] || 0) + 1;

        const day = new Date(log.timestamp).toISOString().split('T')[0];
        stats.by_day[day] = (stats.by_day[day] || 0) + 1;
    });

    res.json({
        success: true,
        data: stats,
        meta: {
            device_id: req.params.deviceId,
            period_days: days
        }
    });
}));

// ============================================
// POST /api/v1/logs/:deviceId
// Add access log entry (internal/device use)
// ============================================
router.post('/:deviceId', [
    param('deviceId').notEmpty()
], asyncHandler(async (req, res) => {
    const device = devices.get(req.params.deviceId);

    if (!device) {
        throw new APIError('Device not found', 404, 'DEVICE_NOT_FOUND');
    }

    const { action, method, granted, user_name, notes, location, device_battery } = req.body;

    const logEntry = {
        id: `log_${uuidv4().slice(0, 8)}`,
        device_id: req.params.deviceId,
        user_id: req.user?.userId || 'system',
        user_name: user_name || req.user?.email || 'System',
        action: action || 'unlock',
        method: method || 'api',
        granted: granted !== false,
        location: location || null,
        device_battery: device_battery || device.status.battery_percent,
        timestamp: new Date().toISOString(),
        notes: notes || null
    };

    accessLogs.unshift(logEntry);

    // Keep only last 10000 logs in memory
    if (accessLogs.length > 10000) {
        accessLogs.pop();
    }

    res.status(201).json({
        success: true,
        data: logEntry
    });
}));

// ============================================
// GET /api/v1/logs/export/csv
// Export logs as CSV
// ============================================
router.get('/export/csv', asyncHandler(async (req, res) => {
    // Get user's device IDs
    const userDeviceIds = [];
    for (const [, device] of devices) {
        if (device.owner_id === req.user.userId) {
            userDeviceIds.push(device.id);
        }
    }

    const userLogs = accessLogs.filter(log => userDeviceIds.includes(log.device_id));

    // Generate CSV
    const headers = ['Timestamp', 'Device ID', 'User', 'Action', 'Method', 'Granted', 'Battery', 'Notes'];
    const rows = userLogs.map(log => [
        log.timestamp,
        log.device_id,
        log.user_name,
        log.action,
        log.method,
        log.granted ? 'Yes' : 'No',
        log.device_battery ? `${log.device_battery}%` : '',
        log.notes || ''
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=access_logs_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
}));

// Export logs array for use in other routes
module.exports = router;
module.exports.accessLogs = accessLogs;
