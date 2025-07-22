const axios = require('axios');

// Payment gateway configuration
const PAYMENT_GATEWAY_CONFIG = {
    baseURL: process.env.PAYMENT_GATEWAY_URL || 'https://pasarela-433766410684.europe-west1.run.app',
    timeout: 30000 // 30 seconds
};

// Send transaction to payment gateway with proper mapping
async function sendToPaymentGateway({ TransactionId, Cedula, Precio_total, Bank = 1, Cuenta = 12345 }) {
    try {
        console.log(`Sending transaction ${TransactionId} to payment gateway`);

        // Map your data to the payment gateway's expected format
        const payload = {
            id_usuario: parseInt(Cedula), // Using Cedula as user ID
            id_banco: Bank, // Default to 1 if not provided
            id_cuenta: Cuenta, // Default account or you can generate/map this
            monto: parseFloat(Precio_total)
        };

        console.log('Payment gateway payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post('/payment/process', payload, {
            baseURL: PAYMENT_GATEWAY_CONFIG.baseURL,
            timeout: PAYMENT_GATEWAY_CONFIG.timeout,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log(`Payment gateway response status: ${response.status}`);
        console.log('Payment gateway response data:', JSON.stringify(response.data, null, 2));

        return {
            success: true,
            data: response.data,
            status: response.status,
            transactionId: TransactionId
        };

    } catch (error) {
        console.error('Payment gateway error details:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url
        });

        return {
            success: false,
            error: error.message,
            status: error.response?.status || 500,
            data: error.response?.data,
            transactionId: TransactionId
        };
    }
}

// Test connectivity to payment gateway
async function testPaymentGatewayConnection() {
    try {
        console.log('Testing payment gateway connectivity...');

        // Test with sample data
        const testPayload = {
            id_usuario: 1001,
            id_banco: 1,
            id_cuenta: 12345,
            monto: 100.00
        };

        const response = await axios.post('/payment/process', testPayload, {
            baseURL: PAYMENT_GATEWAY_CONFIG.baseURL,
            timeout: PAYMENT_GATEWAY_CONFIG.timeout,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return {
            success: true,
            message: 'Payment gateway is reachable',
            status: response.status,
            data: response.data
        };

    } catch (error) {
        return {
            success: false,
            message: 'Payment gateway connection failed',
            error: error.message,
            status: error.response?.status,
            data: error.response?.data
        };
    }
}

module.exports = {
    sendToPaymentGateway,
    testPaymentGatewayConnection
};