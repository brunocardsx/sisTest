const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');

router.post('/create-sale', saleController.createSale);

module.exports = router;