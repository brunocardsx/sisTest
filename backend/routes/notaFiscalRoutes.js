// routes/notaFiscalRoutes.js
const express = require('express');
const router = express.Router();
const notaFiscalController = require('../controllers/notaFiscalController');

// --- ROTAS ESPECÍFICAS (com palavras fixas) VÊM PRIMEIRO ---

// Ex: GET /api/notas-fiscais/por-data?data_inicio=...&data_fim=...
router.get('/por-data', notaFiscalController.getInvoicesByDateRange);

// Ex: GET /api/notas-fiscais/numero/12345
router.get('/numero/:numero', notaFiscalController.getNotaPorNumero);

// Ex: GET /api/notas-fiscais/mensal/5
router.get('/mensal/:obraId', notaFiscalController.getMonthlyInvoices);


// --- ROTAS GENÉRICAS (com parâmetros como :id) VÊM POR ÚLTIMO ---

// Ex: GET /api/notas-fiscais/11
router.get('/:id', notaFiscalController.getNotaPorId);

// Ex: DELETE /api/notas-fiscais/11
router.delete('/:id', notaFiscalController.deleteNota);


// --- ROTAS PARA CRIAÇÃO ---

// Ex: POST /api/notas-fiscais/
router.post('/', notaFiscalController.addInvoice);


module.exports = router;