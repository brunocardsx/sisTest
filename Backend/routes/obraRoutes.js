const express = require('express');
const { createObra, getObras } = require('../controllers/obraController');
const router = express.Router();

// Rota para criar uma obra
router.post('/create-obra', createObra);

// Rota para listar todas as obras
router.get('/obras', getObras);

module.exports = router;
