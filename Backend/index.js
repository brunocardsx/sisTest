// index.js (Backend)

// Carrega as variáveis do arquivo .env em desenvolvimento
// Em produção (no Render), as variáveis serão injetadas pelo ambiente
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./models');

// Importação das rotas
const obraRoutes = require('./routes/obraRoutes');
const materialRoutes = require('./routes/materialRoutes'); // Descomente se estiver usando
const notaFiscalRoutes = require('./routes/notaFiscalRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const saleRoutes = require('./routes/saleRoutes'); // Descomente se estiver usando

const app = express();
const PORT = process.env.PORT || 8081;

// ==========================================================
// CONFIGURAÇÃO DE CORS DINÂMICA
// ==========================================================
// Pega a URL do frontend da variável de ambiente. Se não existir, usa a de localhost.
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Middleware para parsear JSON
app.use(express.json());

// Configuração das rotas da API (padronizadas com /api)
app.use('/api/obras', obraRoutes);
app.use('/api/materiais', materialRoutes);
app.use('/api/notas-fiscais', notaFiscalRoutes);
app.use('/api/produto', produtoRoutes);
app.use('/api/sales', saleRoutes);

// Rota de health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

// Sincroniza o banco de dados e inicia o servidor
// O Sequelize vai usar automaticamente a variável DATABASE_URL se estiver configurado
db.sequelize.sync({ alter: true })
    .then(() => {
        console.log('Banco de dados sincronizado com sucesso.');
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Erro ao conectar ou sincronizar com o banco de dados:', err);
        process.exit(1);
    });

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado no servidor!');
});