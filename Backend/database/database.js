// Backend/database/database.js
const { Sequelize } = require('sequelize');

// Só carregamos o dotenv se NÃO estivermos em produção.
// Esta é a mudança mais importante.
if (process.env.NODE_ENV !== 'production') {
    console.log('[database.js] Ambiente de não-produção detectado. Carregando .env...');
    require('dotenv').config();
}

let sequelize;

// Agora a lógica fica mais simples, pois depende do NODE_ENV que já está correto
if (process.env.NODE_ENV === 'production') {
    // LÓGICA DE PRODUÇÃO (Vercel/Render)

    if (!process.env.DATABASE_URL) {
        // Este erro nunca deveria acontecer se a variável está no painel,
        // mas é uma boa verificação de segurança.
        throw new Error('[database.js] FATAL: DATABASE_URL não definida no ambiente de produção!');
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
    // LÓGICA DE DESENVOLVIMENTO (Seu PC)
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