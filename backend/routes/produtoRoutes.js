// routes/produtoRoutes.js
const express = require('express');
const { createProduto, getProdutos, deleteProduto } = require('../controllers/produtoController'); // Importa a nova função
const router = express.Router();

// Rota para criar um produto
router.post('/', createProduto);

// Rota para listar todos os produtos
router.get('/', getProdutos);

// NOVO: Rota para deletar um produto pelo ID
// O :id é um parâmetro que será capturado em req.params.id no controller
router.delete('/:id', deleteProduto);

module.exports = router;