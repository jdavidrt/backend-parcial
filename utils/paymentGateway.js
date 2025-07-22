const axios = require('axios');

// Payment gateway configuration
const PAYMENT_GATEWAY_CONFIG = {
    baseURL: process.env.PAYMENT_GATEWAY_URL || 'https://pasarela-433766410684.europe-west1.run.app',
    timeout: 30000 // 30 seconds
};

// Send transaction to payment gateway
async function sendToPaymentGateway({ id_usuario, id_banco, id_cuenta, monto }) {
    try {
        console.log("📤 Sending to payment gateway: Transaction");

        const payload = {
            id_usuario,
            id_banco,
            id_cuenta,
            monto
        };

        const response = await axios.post('/payment/process', payload, {
            baseURL: PAYMENT_GATEWAY_CONFIG.baseURL,
            timeout: PAYMENT_GATEWAY_CONFIG.timeout,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log("📥 Payment gateway response status:", response.status);

        return {
            success: true,
            data: response.data,
            status: response.status
        };

    } catch (error) {
        console.error('❌ Payment gateway error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });

        return {
            success: false,
            error: error.message,
            status: error.response?.status || 500,
            data: error.response?.data
        };
    }
}

// Send transaction to bank (alternative endpoint if needed)
async function sendToBank(bankData) {
    try {
        const { Cedula, Precio_total, Bank } = bankData;

        console.log("🏦 Sending to bank: for Cedula");

        const payload = {
            customerCedula: Cedula,
            amount: Precio_total,
            bankCode: Bank,
            timestamp: new Date().toISOString()
        };

        // This would be your bank's API endpoint
        const response = await axios.post('/bank-transfer', payload, {
            baseURL: process.env.BANK_API_URL || 'https://api.bank.example.com',
            timeout: PAYMENT_GATEWAY_CONFIG.timeout,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return {
            success: true,
            data: response.data,
            status: response.status
        };

    } catch (error) {
        console.error('❌ Bank API error:', error.message);
        throw error;
    }
}

module.exports = {
    sendToPaymentGateway,
    sendToBank
};