// routes/notaFiscalRoutes.js

const express = require('express');
const router = express.Router();
const notaFiscalController = require('../controllers/notaFiscalController');

// Rotas específicas primeiro
router.get('/por-data', notaFiscalController.getInvoicesByDateRange);
router.get('/numero/:numero', notaFiscalController.getNotaPorNumero); // Mudei para /:numero

// Rotas genéricas com :id por último
router.get('/:id', notaFiscalController.getNotaPorId);
router.delete('/:id', notaFiscalController.deleteNota);

// Adicionar outras rotas como POST aqui, se necessário
// router.post('/', notaFiscalController.addInvoice);

module.exports = router;