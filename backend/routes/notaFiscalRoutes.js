// routes/notaFiscalRoutes.js

const express = require('express');
const router = express.Router();
const notaFiscalController = require('../controllers/notaFiscalController');

// Rota para adicionar uma nova nota fiscal
router.post('/', notaFiscalController.addInvoice);

// Rota para buscar notas fiscais por intervalo de datas
router.get('/por-data', notaFiscalController.getInvoicesByDateRange);

// Rota para buscar notas fiscais mensais de uma obra (para o gráfico)
router.get('/mensal/:obraId', notaFiscalController.getMonthlyInvoices);

// Rota para consultar nota fiscal por número
router.get('/numero/:numeroNota', notaFiscalController.getInvoiceByNumber);

// Rota para excluir uma nota fiscal por ID
router.delete('/:id', notaFiscalController.deleteInvoice);

router.get('/:id', notaFiscalController.getNotaPorId);


module.exports = router;