// routes/notaFiscalRoutes.js
const express = require('express');
const router = express.Router();
const notaFiscalController = require('../controllers/notaFiscalController');

// --- ROTAS ESPECÍFICAS VÊM PRIMEIRO ---
router.get('/por-data', notaFiscalController.getInvoicesByDateRange);
router.get('/numero/:numero', notaFiscalController.getNotaDetalhada);

// --- ROTAS GENÉRICAS VÊM POR ÚLTIMO ---
router.get('/:id', notaFiscalController.getNotaDetalhada);
router.delete('/:id', notaFiscalController.deleteNota);

// --- ROTA DE CRIAÇÃO ---
// Adicione a rota POST se precisar criar notas
// router.post('/', notaFiscalController.addInvoice);

module.exports = router;