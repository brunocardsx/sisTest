const express = require('express');
const { createClient } = require('../controllers/clienteController');
const router = express.Router();

router.post('/create-client', createClient);

module.exports = router;
