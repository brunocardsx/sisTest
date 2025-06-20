// routes/obraRoutes.js
const express = require('express');
const router = express.Router();

// --- ADICIONE ESTA LINHA ---
const obraController = require('../controllers/obraController');
// -------------------------

// Rota para listar todas as obras
router.get('/', obraController.getAllObras);

// Rota para adicionar uma nova obra
router.post('/', obraController.addObra);

// Rota para excluir uma obra por ID
router.delete('/:id', obraController.deleteObra); // Agora obraController estará definido

module.exports = router;