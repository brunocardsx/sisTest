const express = require('express');
const { createMaterial, getMaterials } = require('../controllers/materialController');
const router = express.Router();

router.post('/create-material', createMaterial);
router.get('/materiais', getMaterials);

module.exports = router;
