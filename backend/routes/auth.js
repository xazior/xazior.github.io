/**
 * Authentication Routes
 * Login, register, refresh token, logout
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { generateToken, generateRefreshToken, verifyRefreshToken, authenticateToken } = require('../middleware/auth');
const { APIError, asyncHandler } = require('../middleware/errorHandler');
const logger = require('../middleware/logger');

const router = express.Router();

// In-memory user store (replace with database in production)
const users = new Map();

// Add demo user
users.set('demo@example.com', {
    id: 'usr_demo',
    email: 'demo@example.com',
    password: bcrypt.hashSync('password123', 12),
    name: 'Demo User',
    role: 'user',
    subscription_tier: 'premium',
    created_at: new Date().toISOString()
});

// ============================================
// POST /api/v1/auth/register
// ============================================
router.post('/register', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
], asyncHandler(async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new APIError('Validation failed', 400, 'VALIDATION_ERROR');
    }

    const { email, password, name } = req.body;

    // Check if user exists
    if (users.has(email)) {
        throw new APIError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = {
        id: `usr_${uuidv4().slice(0, 8)}`,
        email,
        password: hashedPassword,
        name,
        role: 'user',
        subscription_tier: 'free',
        created_at: new Date().toISOString()
    };

    users.set(email, user);

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    logger.info('User registered', { userId: user.id, email });

    res.status(201).json({
        success: true,
        data: {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                subscription_tier: user.subscription_tier
            },
            tokens: {
                accessToken,
                refreshToken,
                expiresIn: '7d'
            }
        }
    });
}));

// ============================================
// POST /api/v1/auth/login
// ============================================
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new APIError('Invalid credentials', 400, 'VALIDATION_ERROR');
    }

    const { email, password } = req.body;

    // Find user
    const user = users.get(email);
    if (!user) {
        logger.logSecurityEvent('LOGIN_FAILED', { email, reason: 'User not found' });
        throw new APIError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        logger.logSecurityEvent('LOGIN_FAILED', { email, reason: 'Invalid password' });
        throw new APIError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    logger.info('User logged in', { userId: user.id, email });

    res.json({
        success: true,
        data: {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                subscription_tier: user.subscription_tier
            },
            tokens: {
                accessToken,
                refreshToken,
                expiresIn: '7d'
            }
        }
    });
}));

// ============================================
// POST /api/v1/auth/refresh
// ============================================
router.post('/refresh', [
    body('refreshToken').notEmpty()
], asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
        throw new APIError('Invalid refresh token', 401, 'INVALID_TOKEN');
    }

    // Find user by ID
    let user = null;
    for (const [, u] of users) {
        if (u.id === decoded.userId) {
            user = u;
            break;
        }
    }

    if (!user) {
        throw new APIError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Generate new tokens
    const newAccessToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
        success: true,
        data: {
            tokens: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                expiresIn: '7d'
            }
        }
    });
}));

// ============================================
// POST /api/v1/auth/logout
// ============================================
router.post('/logout', authenticateToken, (req, res) => {
    // In a real implementation, we'd invalidate the refresh token
    logger.info('User logged out', { userId: req.user.userId });

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// ============================================
// GET /api/v1/auth/me
// ============================================
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
    // Find user
    let user = null;
    for (const [, u] of users) {
        if (u.id === req.user.userId) {
            user = u;
            break;
        }
    }

    if (!user) {
        throw new APIError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.json({
        success: true,
        data: {
            id: user.id,
            email: user.email,
            name: user.name,
            subscription_tier: user.subscription_tier,
            created_at: user.created_at
        }
    });
}));

module.exports = router;
