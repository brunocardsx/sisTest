// notaFiscalRoutes.js
const express = require('express');
const { addInvoice } = require('../controllers/notaFiscalController');
const router = express.Router();

// Alterar a rota para aceitar o POST diretamente na URL /api/notas-fiscais
router.post('/', addInvoice); // Alterado de '/add-invoice' para '/'
module.exports = router;
