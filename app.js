const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const compraRoutes = require('./routes/compra');
const testRoutes = require('./routes/test');
const { connectDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests',
        message: 'Please try again later'
    }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', compraRoutes);
app.use('/api', testRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'ecommerce-backend',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root endpoint with API documentation
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'E-commerce Backend API',
        version: '1.0.0',
        endpoints: {
            health: 'GET /health',
            purchase: 'POST /api/compra',
            transaction_status: 'GET /api/transaction/:transactionId',
            test_payment_gateway: 'GET /api/test/payment-gateway',
            test_payment_gateway_custom: 'POST /api/test/payment-gateway',
            test_database: 'GET /api/test/database',
            test_system_status: 'GET /api/test/status'
        },
        payment_gateway: {
            url: process.env.PAYMENT_GATEWAY_URL || 'https://pasarela-433766410684.europe-west1.run.app',
            endpoint: '/payment/process'
        },
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unexpected error:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        available_endpoints: [
            'GET /',
            'GET /health',
            'POST /api/compra',
            'GET /api/transaction/:transactionId',
            'GET /api/test/payment-gateway',
            'POST /api/test/payment-gateway',
            'GET /api/test/database',
            'GET /api/test/status'
        ],
        timestamp: new Date().toISOString()
    });
});

// Start server
async function startServer() {
    try {
        await connectDatabase();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
            console.log(`API documentation: http://localhost:${PORT}/`);
            console.log(`Payment gateway test: http://localhost:${PORT}/api/test/payment-gateway`);
            console.log('Server is ready to accept connections');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;