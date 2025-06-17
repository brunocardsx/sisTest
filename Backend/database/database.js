// Backend/database/database.js
require('dotenv').config();

// Objeto de configuração para o ambiente de desenvolvimento
const development = {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres'
};

// Objeto de configuração para o ambiente de produção
const production = {
    use_env_variable: 'DATABASE_URL', // Diz ao Sequelize para usar a variável de ambiente
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
};

// Exporta as duas configurações
module.exports = {
    development: development,
    production: production
};