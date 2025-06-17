const { Sequelize } = require('sequelize');

// Carrega as variáveis de ambiente do arquivo .env para desenvolvimento local
// Certifique-se de ter o 'dotenv' instalado: yarn add dotenv
require('dotenv').config();

let sequelize;

// Verifica se a variável DATABASE_URL existe (ambiente de produção do Render)
if (process.env.DATABASE_URL) {
    // --- Configuração para o RENDER (PRODUÇÃO) ---
    console.log('Ambiente de produção detectado. Conectando via DATABASE_URL com SSL.');

    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // Esta linha é crucial para o Render
            }
        },
        logging: false // Mantenha como false para não poluir os logs de produção
    });

} else {
    // --- Configuração para a sua MÁQUINA (DESENVOLVIMENTO) ---
    // Ele vai usar as variáveis do seu arquivo .env local
    console.log('Ambiente de desenvolvimento detectado. Conectando ao banco de dados local.');

    sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        port: process.env.DB_PORT || 5432,
        logging: false
    });
}

// Verificando a conexão
sequelize.authenticate()
    .then(() => {
        console.log('Conexão com o banco de dados foi bem-sucedida!');
    })
    .catch((error) => {
        console.error('Não foi possível conectar ao banco de dados:', error);
    });

module.exports = sequelize;