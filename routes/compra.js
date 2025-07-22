const express = require('express');
const { createPurchase } = require('../controllers/compraController');
const router = express.Router();

// POST /api/compra - Create new purchase transaction
router.post('/compra', createPurchase);

module.exports = router;
