const axios = require('axios');

// Payment gateway configuration
const PAYMENT_GATEWAY_CONFIG = {
    baseURL: process.env.PAYMENT_GATEWAY_URL || 'https://api.paymentgateway.example.com',
    timeout: 30000, // 30 seconds
    apiKey: process.env.PAYMENT_GATEWAY_API_KEY || 'your-api-key-here'
};

// Send transaction to payment gateway
async function sendToPaymentGateway(transactionData) {
    try {
        const { TransactionId, Precio_total, Cedula } = transactionData;

        console.log(📤 Sending to payment gateway: Transaction );

        const payload = {
            transactionId: TransactionId,
            amount: Precio_total,
            customerCedula: Cedula,
            timestamp: new Date().toISOString()
        };

        const response = await axios.post('/process-payment', payload, {
            baseURL: PAYMENT_GATEWAY_CONFIG.baseURL,
            timeout: PAYMENT_GATEWAY_CONFIG.timeout,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': Bearer ,
                'X-Request-ID': TransactionId
            }
        });

        console.log(📥 Payment gateway response status: );

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

        console.log(🏦 Sending to bank:  for Cedula );

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
                'Content-Type': 'application/json',
                'Authorization': Bearer ,
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
