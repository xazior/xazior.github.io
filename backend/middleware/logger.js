/**
 * Logger Middleware
 * Winston-based logging with file and console transports
 */

const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, ...metadata }) => {
        let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;

        if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
        }

        return msg;
    })
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'supernova-api' },
    transports: [
        // Console transport (always)
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            )
        })
    ]
});

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
    const logsDir = process.env.LOGS_DIR || './logs';

    // Error log file
    logger.add(new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
    }));

    // Combined log file
    logger.add(new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        maxsize: 5242880,
        maxFiles: 5
    }));
}

// Request logging helper
logger.logRequest = (req, res, duration) => {
    logger.info('HTTP Request', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userId: req.user?.userId
    });
};

// Security event logging
logger.logSecurityEvent = (event, details) => {
    logger.warn(`Security Event: ${event}`, details);
};

// Access log
logger.logAccess = (deviceId, userId, action, granted, method) => {
    logger.info('Device Access', {
        deviceId,
        userId,
        action,
        granted,
        method
    });
};

module.exports = logger;
