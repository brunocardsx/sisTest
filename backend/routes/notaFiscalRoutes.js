// Backend/routes/notaFiscalRoutes.js

const express = require('express');
const router = express.Router();
const notaFiscalController = require('../controllers/notaFiscalController');

// --- ROTAS MAIS ESPECÍFICAS PRIMEIRO ---

// Rota para adicionar uma nova nota fiscal (POST)
router.post('/', notaFiscalController.addInvoice);

// Rota para buscar notas por intervalo de datas (GET com query)
router.get('/por-data', notaFiscalController.getInvoicesByDateRange);

// Rota para buscar totais mensais de uma obra (GET com palavra 'mensal')
router.get('/mensal/:obraId', notaFiscalController.getMonthlyInvoices);

// Rota para buscar nota por número (GET com palavra 'numero')
router.get('/numero/:numeroNota', notaFiscalController.getInvoiceByNumber);

router.get('/:id', notaFiscalController.getNotaPorId);

// Rota para EXCLUIR uma única nota por ID (DELETE com :id)
router.delete('/:id', notaFiscalController.deleteInvoice);


module.exports = router;