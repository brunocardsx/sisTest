// seu-backend/models/index.js
'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const sequelizeInstance = require('../database/database.js');
const db = {};

console.log("--- Iniciando models/index.js ---");

fs
    .readdirSync(__dirname)
    .filter(file => {
        return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js' &&
            file.indexOf('.test.js') === -1
        );
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file));
        console.log(`Modelo carregado: ${model.name} do arquivo ${file}`); // LOG
        db[model.name] = model;
    });

console.log("--- Modelos carregados no objeto db:", Object.keys(db), "---"); // LOG

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        console.log(`Chamando associate para o modelo: ${modelName}`); // LOG
        db[modelName].associate(db);
    } else {
        console.log(`Modelo ${modelName} não possui método associate.`); // LOG
    }
});

console.log("--- Associações configuradas ---"); // LOG

// Verifique se as associações existem após a configuração
if (db.NotaFiscal && db.NotaFiscal.associations) {
    console.log("Associações de NotaFiscal:", Object.keys(db.NotaFiscal.associations)); // LOG
    // Se você usou o alias 'itensDaNota', ele deve aparecer aqui.
    // Ex: ['itensDaNota'] ou ['ItemNotaFiscals'] se sem alias
    if (db.NotaFiscal.associations.itensDaNota) { // ou db.NotaFiscal.associations.ItemNotaFiscals
        console.log("Detalhes da associação 'itensDaNota' (ou 'ItemNotaFiscals'):", db.NotaFiscal.associations.itensDaNota);
    } else {
        console.log("AVISO: Associação 'itensDaNota' (ou 'ItemNotaFiscals') NÃO encontrada em NotaFiscal.associations!");
    }
} else {
    console.log("AVISO: db.NotaFiscal ou db.NotaFiscal.associations não definido!");
}


db.sequelize = sequelizeInstance;
db.Sequelize = Sequelize;

module.exports = db;