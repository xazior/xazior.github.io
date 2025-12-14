/**
 * Error Handler Middleware
 * Centralized error handling with proper logging
 */

const logger = require('./logger');

/**
 * Custom API Error class
 */
class APIError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error codes mapping
 */
const ErrorCodes = {
    VALIDATION_ERROR: { status: 400, code: 'VALIDATION_ERROR' },
    UNAUTHORIZED: { status: 401, code: 'UNAUTHORIZED' },
    FORBIDDEN: { status: 403, code: 'FORBIDDEN' },
    NOT_FOUND: { status: 404, code: 'NOT_FOUND' },
    CONFLICT: { status: 409, code: 'CONFLICT' },
    RATE_LIMIT: { status: 429, code: 'RATE_LIMIT' },
    INTERNAL_ERROR: { status: 500, code: 'INTERNAL_ERROR' },
    SERVICE_UNAVAILABLE: { status: 503, code: 'SERVICE_UNAVAILABLE' }
};

/**
 * Main error handler middleware
 */
function errorHandler(err, req, res, next) {
    // Default values
    let statusCode = err.statusCode || 500;
    let errorCode = err.code || 'INTERNAL_ERROR';
    let message = err.message || 'An unexpected error occurred';

    // Log error
    logger.error('API Error', {
        error: message,
        code: errorCode,
        statusCode,
        path: req.path,
        method: req.method,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        userId: req.user?.userId
    });

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
    } else if (err.name === 'CastError') {
        statusCode = 400;
        errorCode = 'INVALID_ID';
        message = 'Invalid ID format';
    } else if (err.code === '23505') {
        // PostgreSQL unique violation
        statusCode = 409;
        errorCode = 'DUPLICATE_ENTRY';
        message = 'A record with this information already exists';
    } else if (err.code === '23503') {
        // PostgreSQL foreign key violation
        statusCode = 400;
        errorCode = 'FOREIGN_KEY_ERROR';
        message = 'Referenced record does not exist';
    }

    // Send error response
    const response = {
        success: false,
        error: {
            code: errorCode,
            message
        }
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
        response.error.stack = err.stack;
    }

    res.status(statusCode).json(response);
}

/**
 * Async handler wrapper to catch async errors
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * Not found handler
 */
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Endpoint ${req.method} ${req.path} not found`
        }
    });
}

module.exports = {
    APIError,
    ErrorCodes,
    errorHandler,
    asyncHandler,
    notFoundHandler
};
