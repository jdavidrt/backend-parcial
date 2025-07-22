const { executeQuery } = require('../config/database');
const { sendToPaymentGateway } = require('../utils/paymentGateway');
const { v4: uuidv4 } = require('uuid');

// Create new purchase transaction
async function createPurchase(req, res) {
    try {
        const { Cedula, Precio_total, Bank = 1, Cuenta = 12345 } = req.body;

        // Validate required fields
        if (!Cedula || !Precio_total) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'Cedula and Precio_total are required'
            });
        }

        // Validate Cedula format (should be numeric)
        if (!/^\d+$/.test(Cedula.toString())) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Cedula format',
                message: 'Cedula must contain only numbers'
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

        console.log(`Creating transaction ${TransactionId} for Cedula ${Cedula} with amount ${price}`);

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
        console.log(`Transaction created successfully with ID: ${TransactionId}`);

        // Send to payment gateway
        try {
            console.log('Initiating payment gateway request...');

            const paymentResponse = await sendToPaymentGateway({
                TransactionId,
                Cedula,
                Precio_total: price,
                Bank,
                Cuenta
            });

            let finalStatus = Estado_trans;
            let statusMessage = 'Transaction created and sent to payment gateway';

            // Update transaction status based on payment gateway response
            if (paymentResponse.success) {
                finalStatus = 'PROCESSING';
                statusMessage = 'Transaction is being processed by payment gateway';

                await executeQuery(
                    'UPDATE transactions SET Estado_trans = $1 WHERE TransactionId = $2',
                    [finalStatus, TransactionId]
                );

                console.log(`Transaction ${TransactionId} status updated to PROCESSING`);
            } else {
                finalStatus = 'FAILED';
                statusMessage = 'Payment gateway rejected the transaction';

                await executeQuery(
                    'UPDATE transactions SET Estado_trans = $1 WHERE TransactionId = $2',
                    [finalStatus, TransactionId]
                );

                console.log(`Transaction ${TransactionId} status updated to FAILED`);
            }

            // Send response with payment gateway details
            res.status(201).json({
                success: true,
                message: statusMessage,
                data: {
                    transactionId: TransactionId,
                    cedula: Cedula,
                    amount: price,
                    status: finalStatus,
                    timestamp: new Date().toISOString(),
                    paymentGateway: {
                        success: paymentResponse.success,
                        status: paymentResponse.status,
                        data: paymentResponse.data
                    }
                }
            });

        } catch (paymentError) {
            console.error(`Payment gateway error for transaction ${TransactionId}:`, paymentError.message);

            // Update transaction status to failed
            await executeQuery(
                'UPDATE transactions SET Estado_trans = $1 WHERE TransactionId = $2',
                ['FAILED', TransactionId]
            );

            return res.status(502).json({
                success: false,
                error: 'Payment gateway error',
                message: 'Failed to process payment through gateway',
                data: {
                    transactionId: TransactionId,
                    cedula: Cedula,
                    amount: price,
                    status: 'FAILED',
                    timestamp: new Date().toISOString()
                }
            });
        }

    } catch (error) {
        console.error('Purchase creation failed:', error.message);
        console.error('Error stack:', error.stack);

        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to create purchase transaction',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Get transaction status
async function getTransactionStatus(req, res) {
    try {
        const { transactionId } = req.params;

        if (!transactionId) {
            return res.status(400).json({
                success: false,
                error: 'Missing transaction ID',
                message: 'Transaction ID is required'
            });
        }

        const query = 'SELECT * FROM transactions WHERE TransactionId = $1';
        const result = await executeQuery(query, [transactionId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found',
                message: `No transaction found with ID: ${transactionId}`
            });
        }

        const transaction = result.rows[0];

        res.status(200).json({
            success: true,
            message: 'Transaction found',
            data: {
                transactionId: transaction.transactionid,
                cedula: transaction.cedula,
                status: transaction.estado_trans,
                amount: parseFloat(transaction.precio_total)
            }
        });

    } catch (error) {
        console.error('Failed to get transaction status:', error.message);

        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to retrieve transaction status'
        });
    }
}

module.exports = {
    createPurchase,
    getTransactionStatus
};