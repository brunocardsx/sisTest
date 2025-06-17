// Backend/models/index.js
'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize'); // Importa Sequelize e DataTypes
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// Aponta para o nosso arquivo de configuração centralizado
const config = require(__dirname + '/../database/database.js')[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
    // Bloco de PRODUÇÃO (Render/Vercel)
    // Cria a instância do Sequelize usando a DATABASE_URL e as opções de config
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    // Bloco de DESENVOLVIMENTO (seu PC)
    // Cria a instância do Sequelize com os parâmetros separados
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

console.log("--- Iniciando models/index.js ---");

// Lê todos os arquivos da pasta 'models'
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
        // ESTA É A LINHA MÁGICA E CORRIGIDA
        // O require aqui não é de um objeto, mas de uma FUNÇÃO que define o model.
        // Nós passamos (sequelize, DataTypes) para essa função, e ela nos retorna o model inicializado.
        const model = require(path.join(__dirname, file))(sequelize, DataTypes);
        console.log(`Modelo carregado: ${model.name} do arquivo ${file}`);
        db[model.name] = model;
    });

console.log("--- Modelos carregados no objeto db:", Object.keys(db), "---");

// Executa o método 'associate' de cada model, se ele existir
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        console.log(`Chamando associate para o modelo: ${modelName}`);
        db[modelName].associate(db);
    }
});

console.log("--- Associações configuradas ---");

// Adiciona a instância e a classe do Sequelize ao objeto 'db' para fácil acesso
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;