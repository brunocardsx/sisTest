// Backend/models/index.js
'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../database/database'); // Importa nossa instância central
const basename = path.basename(__filename);
const db = {};

fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file)); // Agora o require pega o model pronto
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;