/**
 * Access Control Routes
 * Sharing, permissions, and temporary access codes
 */

const express = require('express');
const { param, body, query, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { APIError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../middleware/logger');
const { devices } = require('./devices');

const router = express.Router();

// In-memory stores (replace with database in production)
const permissions = new Map();
const shareTokens = new Map();
const tempCodes = new Map();

// Demo permissions
const demoPermissions = [
    {
        id: 'perm_001',
        device_id: 'dev_cassapanca_001',
        user_email: 'mamma@famiglia.it',
        user_name: 'Mamma',
        role: 'manager',
        can_unlock: true,
        can_view_location: true,
        can_view_logs: true,
        granted_by: 'usr_demo',
        granted_at: new Date().toISOString(),
        expires_at: null
    },
    {
        id: 'perm_002',
        device_id: 'dev_cassapanca_001',
        user_email: 'nonna@famiglia.it',
        user_name: 'Nonna',
        role: 'viewer',
        can_unlock: false,
        can_view_location: true,
        can_view_logs: false,
        granted_by: 'usr_demo',
        granted_at: new Date().toISOString(),
        expires_at: null
    },
    {
        id: 'perm_003',
        device_id: 'dev_cassapanca_003',
        user_email: 'fratello@famiglia.it',
        user_name: 'Fratello',
        role: 'manager',
        can_unlock: true,
        can_view_location: true,
        can_view_logs: true,
        granted_by: 'usr_demo',
        granted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 86400000).toISOString()
    }
];

demoPermissions.forEach(perm => permissions.set(perm.id, perm));

// ============================================
// GET /api/v1/access/:deviceId/permissions
// List all permissions for a device
// ============================================
router.get('/:deviceId/permissions', [
    param('deviceId').notEmpty()
], asyncHandler(async (req, res) => {
    const device = devices.get(req.params.deviceId);

    if (!device) {
        throw new APIError('Device not found', 404, 'DEVICE_NOT_FOUND');
    }

    if (device.owner_id !== req.user.userId) {
        throw new APIError('Access denied', 403, 'ACCESS_DENIED');
    }

    const devicePermissions = [];
    for (const [, perm] of permissions) {
        if (perm.device_id === req.params.deviceId) {
            devicePermissions.push(perm);
        }
    }

    res.json({
        success: true,
        data: devicePermissions
    });
}));

// ============================================
// POST /api/v1/access/:deviceId/share
// Share device access with another user
// ============================================
router.post('/:deviceId/share', [
    param('deviceId').notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('role').isIn(['viewer', 'manager']),
    body('expires_at').optional().isISO8601()
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

    const { email, role, expires_at } = req.body;

    // Check if permission already exists
    for (const [, perm] of permissions) {
        if (perm.device_id === req.params.deviceId && perm.user_email === email) {
            throw new APIError('User already has access', 409, 'PERMISSION_EXISTS');
        }
    }

    // Create share token
    const shareToken = `shr_${uuidv4().slice(0, 12)}`;
    const permission = {
        id: `perm_${uuidv4().slice(0, 8)}`,
        device_id: req.params.deviceId,
        user_email: email,
        user_name: email.split('@')[0],
        role,
        can_unlock: role === 'manager',
        can_view_location: true,
        can_view_logs: role === 'manager',
        granted_by: req.user.userId,
        granted_at: new Date().toISOString(),
        expires_at: expires_at || null,
        share_token: shareToken
    };

    permissions.set(permission.id, permission);
    shareTokens.set(shareToken, permission.id);

    logger.info('Access shared', {
        deviceId: req.params.deviceId,
        grantedTo: email,
        role,
        grantedBy: req.user.userId
    });

    res.status(201).json({
        success: true,
        data: {
            permission_id: permission.id,
            share_token: shareToken,
            email,
            role,
            expires_at: permission.expires_at
        }
    });
}));

// ============================================
// DELETE /api/v1/access/:deviceId/share/:permissionId
// Revoke shared access
// ============================================
router.delete('/:deviceId/share/:permissionId', [
    param('deviceId').notEmpty(),
    param('permissionId').notEmpty()
], asyncHandler(async (req, res) => {
    const device = devices.get(req.params.deviceId);

    if (!device) {
        throw new APIError('Device not found', 404, 'DEVICE_NOT_FOUND');
    }

    if (device.owner_id !== req.user.userId) {
        throw new APIError('Access denied', 403, 'ACCESS_DENIED');
    }

    const permission = permissions.get(req.params.permissionId);

    if (!permission || permission.device_id !== req.params.deviceId) {
        throw new APIError('Permission not found', 404, 'PERMISSION_NOT_FOUND');
    }

    // Remove share token
    if (permission.share_token) {
        shareTokens.delete(permission.share_token);
    }

    permissions.delete(req.params.permissionId);

    logger.info('Access revoked', {
        deviceId: req.params.deviceId,
        revokedFrom: permission.user_email,
        revokedBy: req.user.userId
    });

    res.json({
        success: true,
        message: 'Access revoked successfully'
    });
}));

// ============================================
// POST /api/v1/access/:deviceId/temp-code
// Generate temporary access code
// ============================================
router.post('/:deviceId/temp-code', [
    param('deviceId').notEmpty(),
    body('validity_minutes').isInt({ min: 5, max: 1440 }),
    body('note').optional().trim().isLength({ max: 100 })
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

    const { validity_minutes, note } = req.body;

    // Generate 6-character code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const tempCode = {
        id: `tc_${uuidv4().slice(0, 8)}`,
        device_id: req.params.deviceId,
        code,
        created_by: req.user.userId,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + validity_minutes * 60000).toISOString(),
        note: note || null,
        used: false,
        used_at: null
    };

    tempCodes.set(tempCode.id, tempCode);

    logger.info('Temp code generated', {
        deviceId: req.params.deviceId,
        codeId: tempCode.id,
        validityMinutes: validity_minutes,
        createdBy: req.user.userId
    });

    res.status(201).json({
        success: true,
        data: {
            code_id: tempCode.id,
            code,
            expires_at: tempCode.expires_at,
            validity_minutes
        }
    });
}));

// ============================================
// POST /api/v1/access/:deviceId/verify-code
// Verify and use temporary code
// ============================================
router.post('/:deviceId/verify-code', [
    param('deviceId').notEmpty(),
    body('code').trim().isLength({ min: 6, max: 6 })
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new APIError('Invalid code format', 400, 'VALIDATION_ERROR');
    }

    const device = devices.get(req.params.deviceId);

    if (!device) {
        throw new APIError('Device not found', 404, 'DEVICE_NOT_FOUND');
    }

    const { code } = req.body;

    // Find matching code
    let matchingCode = null;
    for (const [, tc] of tempCodes) {
        if (tc.device_id === req.params.deviceId &&
            tc.code === code.toUpperCase() &&
            !tc.used) {
            matchingCode = tc;
            break;
        }
    }

    if (!matchingCode) {
        logger.logSecurityEvent('INVALID_TEMP_CODE', {
            deviceId: req.params.deviceId,
            attemptedCode: code
        });
        throw new APIError('Invalid or expired code', 401, 'INVALID_CODE');
    }

    // Check expiration
    if (new Date(matchingCode.expires_at) < new Date()) {
        throw new APIError('Code has expired', 401, 'CODE_EXPIRED');
    }

    // Mark code as used
    matchingCode.used = true;
    matchingCode.used_at = new Date().toISOString();

    // Unlock device
    device.status.is_locked = false;
    device.status.last_checkin = new Date().toISOString();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`device:${device.id}`).emit('device:status', {
        deviceId: device.id,
        status: device.status
    });

    logger.logAccess(device.id, 'temp_code', 'unlock', true, 'temp_code');

    res.json({
        success: true,
        data: {
            unlocked: true,
            device_name: device.name,
            timestamp: new Date().toISOString()
        }
    });
}));

// ============================================
// GET /api/v1/access/:deviceId/temp-codes
// List active temp codes for device
// ============================================
router.get('/:deviceId/temp-codes', [
    param('deviceId').notEmpty()
], asyncHandler(async (req, res) => {
    const device = devices.get(req.params.deviceId);

    if (!device) {
        throw new APIError('Device not found', 404, 'DEVICE_NOT_FOUND');
    }

    if (device.owner_id !== req.user.userId) {
        throw new APIError('Access denied', 403, 'ACCESS_DENIED');
    }

    const activeCodes = [];
    const now = new Date();

    for (const [, tc] of tempCodes) {
        if (tc.device_id === req.params.deviceId &&
            !tc.used &&
            new Date(tc.expires_at) > now) {
            activeCodes.push({
                id: tc.id,
                code: tc.code,
                expires_at: tc.expires_at,
                note: tc.note,
                created_at: tc.created_at
            });
        }
    }

    res.json({
        success: true,
        data: activeCodes
    });
}));

// ============================================
// DELETE /api/v1/access/:deviceId/temp-codes/:codeId
// Revoke temp code
// ============================================
router.delete('/:deviceId/temp-codes/:codeId', [
    param('deviceId').notEmpty(),
    param('codeId').notEmpty()
], asyncHandler(async (req, res) => {
    const device = devices.get(req.params.deviceId);

    if (!device) {
        throw new APIError('Device not found', 404, 'DEVICE_NOT_FOUND');
    }

    if (device.owner_id !== req.user.userId) {
        throw new APIError('Access denied', 403, 'ACCESS_DENIED');
    }

    const tempCode = tempCodes.get(req.params.codeId);

    if (!tempCode || tempCode.device_id !== req.params.deviceId) {
        throw new APIError('Code not found', 404, 'CODE_NOT_FOUND');
    }

    tempCodes.delete(req.params.codeId);

    res.json({
        success: true,
        message: 'Code revoked successfully'
    });
}));

// Export for use in other routes
module.exports = router;
module.exports.permissions = permissions;
