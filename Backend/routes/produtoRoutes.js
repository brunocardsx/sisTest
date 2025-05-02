// routes/produtoRoutes.js
const express = require('express');
const { createProduto, getProdutos } = require('../controllers/produtoController');
const router = express.Router();

// Rota para criar um produto (usando a rota padrão /)
router.post('/', createProduto);

// Rota para listar todos os produtos
router.get('/', getProdutos);

module.exports = router;
