// Backend/database/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
let sequelize;

console.log(`[database.js] Iniciando. Ambiente: ${env}`);

if (env === 'production') {
    if (!process.env.DATABASE_URL) {
        throw new Error('[database.js] FATAL: DATABASE_URL não definida em produção!');
    }
    console.log('[database.js] Configurando para produção via DATABASE_URL...');
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    });
} else {
    console.log('[database.js] Configurando para desenvolvimento local...');
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASS, {
            host: process.env.DB_HOST,
            dialect: 'postgres',
            logging: false
        }
    );
}

console.log('[database.js] Instância Sequelize criada. Exportando...');
module.exports = sequelize;