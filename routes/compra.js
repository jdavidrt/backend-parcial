const express = require('express');
const { createPurchase, getTransactionStatus } = require('../controllers/compraController');
const router = express.Router();

// POST /api/compra - Create new purchase transaction
router.post('/compra', createPurchase);

// GET /api/transaction/:transactionId - Get transaction status
router.get('/transaction/:transactionId', getTransactionStatus);

module.exports = router;