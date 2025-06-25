const express = require('express');
const router = express.Router();
const notaFiscalController = require('../controllers/notaFiscalController');

// ROTA PARA CRIAÇÃO
router.post('/', notaFiscalController.addInvoice);

// --- ROTAS ESPECÍFICAS (com palavras fixas) VÊM PRIMEIRO ---
router.get('/por-data', notaFiscalController.getInvoicesByDateRange);
router.get('/numero/:numero', notaFiscalController.getNotaDetalhada); // Chama a função unificada
router.get('/mensal/:obraId', notaFiscalController.getMonthlyInvoices);

// --- ROTAS GENÉRICAS (com :id) VÊM POR ÚLTIMO ---
router.get('/:id', notaFiscalController.getNotaDetalhada); // Também chama a função unificada
router.delete('/:id', notaFiscalController.deleteInvoice);

module.exports = router;