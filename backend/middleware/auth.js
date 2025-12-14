/**
 * Authentication Middleware
 * JWT token validation and user context injection
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to authenticate JWT tokens
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            error: 'Access denied',
            message: 'No authentication token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role || 'user'
        };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired',
                message: 'Your session has expired. Please login again.'
            });
        }
        return res.status(403).json({
            error: 'Invalid token',
            message: 'The provided authentication token is invalid'
        });
    }
}

/**
 * Optional authentication - sets user if token present but doesn't require it
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role || 'user'
            };
        } catch (error) {
            // Token invalid, but we continue without user
        }
    }
    next();
}

/**
 * Middleware to check for admin role
 */
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Admin access required'
        });
    }
    next();
}

/**
 * Generate JWT token
 */
function generateToken(user, expiresIn = '7d') {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
            role: user.role || 'user'
        },
        JWT_SECRET,
        { expiresIn }
    );
}

/**
 * Generate refresh token
 */
function generateRefreshToken(user) {
    return jwt.sign(
        { userId: user.id, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: '30d' }
    );
}

/**
 * Verify refresh token
 */
function verifyRefreshToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }
        return decoded;
    } catch (error) {
        return null;
    }
}

module.exports = {
    authenticateToken,
    optionalAuth,
    requireAdmin,
    generateToken,
    generateRefreshToken,
    verifyRefreshToken,
    JWT_SECRET
};
