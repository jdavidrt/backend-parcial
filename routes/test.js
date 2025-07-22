const express = require('express');
const { testPaymentGatewayConnection, sendToPaymentGateway } = require('../utils/paymentGateway');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Test payment gateway connectivity
router.get('/test/payment-gateway', async (req, res) => {
    try {
        console.log('Testing payment gateway connection...');

        const testResult = await testPaymentGatewayConnection();

        if (testResult.success) {
            res.status(200).json({
                success: true,
                message: 'Payment gateway is reachable and responding',
                gateway: {
                    url: process.env.PAYMENT_GATEWAY_URL || 'https://pasarela-433766410684.europe-west1.run.app',
                    status: testResult.status,
                    response: testResult.data
                },
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(502).json({
                success: false,
                message: 'Payment gateway connection failed',
                error: testResult.error,
                gateway: {
                    url: process.env.PAYMENT_GATEWAY_URL || 'https://pasarela-433766410684.europe-west1.run.app',
                    status: testResult.status,
                    response: testResult.data
                },
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        console.error('Test endpoint error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Test endpoint failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Test payment gateway with custom data
router.post('/test/payment-gateway', async (req, res) => {
    try {
        const {
            Cedula = '1001',
            Precio_total = 100.00,
            Bank = 1,
            Cuenta = 12345
        } = req.body;

        console.log('Testing payment gateway with custom data...');

        const testTransactionId = uuidv4();

        const paymentResponse = await sendToPaymentGateway({
            TransactionId: testTransactionId,
            Cedula,
            Precio_total,
            Bank,
            Cuenta
        });

        if (paymentResponse.success) {
            res.status(200).json({
                success: true,
                message: 'Payment gateway test successful',
                test: {
                    transactionId: testTransactionId,
                    input: { Cedula, Precio_total, Bank, Cuenta },
                    gateway_response: paymentResponse
                },
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(502).json({
                success: false,
                message: 'Payment gateway test failed',
                test: {
                    transactionId: testTransactionId,
                    input: { Cedula, Precio_total, Bank, Cuenta },
                    gateway_response: paymentResponse
                },
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        console.error('Payment gateway test error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Payment gateway test failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Test database connection
router.get('/test/database', async (req, res) => {
    try {
        const { executeQuery } = require('../config/database');

        console.log('Testing database connection...');

        const result = await executeQuery('SELECT NOW() as current_time, COUNT(*) as transaction_count FROM transactions');

        res.status(200).json({
            success: true,
            message: 'Database connection successful',
            database: {
                current_time: result.rows[0].current_time,
                transaction_count: parseInt(result.rows[0].transaction_count)
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Database test error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Get system status
router.get('/test/status', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'E-commerce backend is running',
        system: {
            node_version: process.version,
            environment: process.env.NODE_ENV,
            uptime: process.uptime(),
            memory_usage: process.memoryUsage(),
            payment_gateway_url: process.env.PAYMENT_GATEWAY_URL || 'https://pasarela-433766410684.europe-west1.run.app'
        },
        endpoints: {
            health: '/health',
            create_purchase: 'POST /api/compra',
            get_transaction: 'GET /api/transaction/:transactionId',
            test_payment_gateway: 'GET /api/test/payment-gateway',
            test_payment_gateway_custom: 'POST /api/test/payment-gateway',
            test_database: 'GET /api/test/database'
        },
        timestamp: new Date().toISOString()
    });
});

module.exports = router;