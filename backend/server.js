/**
 * SuperNØva Smart Locker - Backend API Server
 * Express.js with WebSocket support for real-time updates
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth');
const devicesRoutes = require('./routes/devices');
const locationsRoutes = require('./routes/locations');
const accessRoutes = require('./routes/access');
const logsRoutes = require('./routes/logs');

// Import middleware
const { authenticateToken } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

// ============================================
// Configuration
// ============================================

const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// ============================================
// Express App Setup
// ============================================

const app = express();
const httpServer = createServer(app);

// Socket.io setup for real-time updates
const io = new Server(httpServer, {
    cors: {
        origin: CORS_ORIGIN,
        methods: ['GET', 'POST']
    }
});

// Make io available in routes
app.set('io', io);

// ============================================
// Middleware
// ============================================

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false // Disable for development
}));

// CORS
app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});

// ============================================
// API Routes
// ============================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/devices', authenticateToken, devicesRoutes);
app.use('/api/v1/locations', authenticateToken, locationsRoutes);
app.use('/api/v1/access', authenticateToken, accessRoutes);
app.use('/api/v1/logs', authenticateToken, logsRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use(errorHandler);

// ============================================
// WebSocket Handlers
// ============================================

io.on('connection', (socket) => {
    logger.info('WebSocket client connected', { socketId: socket.id });

    // Authenticate socket connection
    socket.on('authenticate', (token) => {
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            socket.userId = decoded.userId;
            socket.join(`user:${decoded.userId}`);
            socket.emit('authenticated', { success: true });
            logger.info('Socket authenticated', { userId: decoded.userId });
        } catch (error) {
            socket.emit('authenticated', { success: false, error: 'Invalid token' });
        }
    });

    // Subscribe to device updates
    socket.on('subscribe:device', (deviceId) => {
        if (socket.userId) {
            socket.join(`device:${deviceId}`);
            logger.info('Subscribed to device', { deviceId, userId: socket.userId });
        }
    });

    // Unsubscribe from device updates
    socket.on('unsubscribe:device', (deviceId) => {
        socket.leave(`device:${deviceId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        logger.info('WebSocket client disconnected', { socketId: socket.id });
    });
});

// Export io for use in routes
module.exports.io = io;

// ============================================
// Server Start
// ============================================

httpServer.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    console.log(`
╔═══════════════════════════════════════════════════════╗
║          SuperNØva Smart Locker API Server            ║
╠═══════════════════════════════════════════════════════╣
║  Status:    Running                                   ║
║  Port:      ${PORT}                                        ║
║  Mode:      ${process.env.NODE_ENV || 'development'}                              ║
║  API Base:  http://localhost:${PORT}/api/v1               ║
╚═══════════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    httpServer.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});
