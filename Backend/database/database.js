// Backend/database/database.js
const { Sequelize } = require('sequelize');

// Só carregamos o dotenv se NÃO estivermos em produção.
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

let sequelize;

if (process.env.NODE_ENV === 'production') {
    // ==========================================================
    // LÓGICA DE PRODUÇÃO (Vercel/Render) - SEM URL!
    // ==========================================================

    // Verificação de segurança para cada variável
    if (!process.env.PROD_DB_NAME || !process.env.PROD_DB_USER || !process.env.PROD_DB_PASSWORD || !process.env.PROD_DB_HOST) {
        throw new Error('Uma ou mais variáveis de ambiente do banco de dados de produção não foram definidas!');
    }

    console.log('[database.js] Configurando para produção com variáveis separadas...');
    sequelize = new Sequelize(
        process.env.PROD_DB_NAME,
        process.env.PROD_DB_USER,
        process.env.PROD_DB_PASSWORD,
        {
            host: process.env.PROD_DB_HOST,
            dialect: 'postgres',
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            },
            logging: false
        }
    );
} else {
    // ==========================================================
    // LÓGICA DE DESENVOLVIMENTO (Seu PC)
    // ==========================================================
    console.log('[database.js] Configurando para desenvolvimento local...');
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASS, {
            host: process.env.DB_HOST,
            dialect: 'postgres',
            port: process.env.DB_PORT || 5432,
            logging: false
        }
    );
}

module.exports = sequelize;