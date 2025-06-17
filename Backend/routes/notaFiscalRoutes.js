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
// Renomeado para evitar conflito com :id
router.get('/numero/:numeroNota', notaFiscalController.getInvoiceByNumber);

// ==========================================================
// NOVA ROTA PARA EXCLUIR UMA NOTA FISCAL POR ID
// ==========================================================
router.delete('/:id', notaFiscalController.deleteInvoice);


module.exports = router;