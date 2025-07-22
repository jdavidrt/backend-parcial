const { executeQuery } = require('../config/database');
const { sendToPaymentGateway } = require('../utils/paymentGateway');
const { v4: uuidv4 } = require('uuid');

// Create new purchase transaction
async function createPurchase(req, res) {
    try {
        const { Cedula, Precio_total, Bank } = req.body;

        // Validate required fields
        if (!Cedula || !Precio_total) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'Cedula and Precio_total are required'
            });
        }

        // Validate price format
        const price = parseFloat(Precio_total);
        if (isNaN(price) || price <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid price',
                message: 'Precio_total must be a positive number'
            });
        }

        // Generate unique transaction ID
        const TransactionId = uuidv4();

        // Set initial transaction status
        const Estado_trans = 'PENDING';

        // Insert transaction into database
        const insertQuery = `
    INSERT INTO transactions (TransactionId, Cedula, Estado_trans, Precio_total)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
`;

        const result = await executeQuery(insertQuery, [
            TransactionId,
            Cedula,
            Estado_trans,
            price
        ]);

        if (result.rows.length === 0) {
            throw new Error('Failed to create transaction record');
        }

        const transaction = result.rows[0];
        console.log("✅ Transaction created with ID:");

        // Send to payment gateway
        try {
            const paymentResponse = await sendToPaymentGateway({
                TransactionId,
                Precio_total: price,
                Cedula
            });

            // Update transaction status based on payment gateway response
            if (paymentResponse.success) {
                await executeQuery(
                    'UPDATE transactions SET Estado_trans =  WHERE TransactionId = ',
                    ['PROCESSING', TransactionId]
                );
            }

            console.log("📡 Payment gateway response:");

        } catch (paymentError) {
            console.error('❌ Payment gateway error:', paymentError.message);

            // Update transaction status to failed
            await executeQuery(
                'UPDATE transactions SET Estado_trans =  WHERE TransactionId = ',
                ['FAILED', TransactionId]
            );

            return res.status(502).json({
                success: false,
                error: 'Payment gateway error',
                message: 'Failed to process payment',
                transactionId: TransactionId
            });
        }

        // Send success response
        res.status(201).json({
            success: true,
            message: 'Purchase transaction created successfully',
            data: {
                transactionId: TransactionId,
                cedula: Cedula,
                amount: price,
                status: Estado_trans,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Purchase creation failed:', error.message);

        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to create purchase transaction'
        });
    }
}

module.exports = {
    createPurchase
};
