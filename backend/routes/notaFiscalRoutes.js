// routes/notaFiscalRoutes.js
const express = require('express');
const router = express.Router();
const notaFiscalController = require('../controllers/notaFiscalController');

// --- ROTAS ESPECÍFICAS (com palavras fixas) VÊM PRIMEIRO ---

// Rota para buscar notas por período (para a lista)
router.get('/por-data', notaFiscalController.getInvoicesByDateRange);

// Rota para buscar totais mensais (para o dashboard)
router.get('/mensal/:obraId', notaFiscalController.getMonthlyInvoices);

// Rota para buscar nota por número
router.get('/numero/:numeroNota', notaFiscalController.getNotaPorNumero);


// --- ROTAS GENÉRICAS (com :id) VÊM POR ÚLTIMO ---

// Rota para BUSCAR os detalhes de uma nota por ID
router.get('/:id', notaFiscalController.getNotaPorId);

// Rota para EXCLUIR uma nota por ID
router.delete('/:id', notaFiscalController.deleteNota);


// --- ROTA PARA CRIAÇÃO ---
router.post('/', notaFiscalController.addInvoice);


module.exports = router;