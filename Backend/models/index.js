// Backend/models/index.js
'use strict';

const Sequelize = require('sequelize');
const sequelize = require('../database/database');

const db = {};

// Carregue cada model manualmente
console.log('[models/index.js] Carregando models manualmente...');
db.Produto = require('./Produto.js');
db.Obra = require('./Obra.js');
db.NotaFiscal = require('./NotaFiscal.js');
db.ItemNotaFiscal = require('./ItemNotaFiscal.js');
// Adicione todos os seus outros models aqui...

console.log('[models/index.js] Models carregados:', Object.keys(db));

// Executa as associações
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        console.log(`[models/index.js] Associando modelo: ${modelName}`);
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log('[models/index.js] Exportação finalizada.');
module.exports = db;