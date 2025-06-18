// index.js (Backend)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');

// Importação das rotas
const obraRoutes = require('./routes/obraRoutes');
const materialRoutes = require('./routes/materialRoutes');
const notaFiscalRoutes = require('./routes/notaFiscalRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const saleRoutes = require('./routes/saleRoutes');

const app = express();

// ==========================================================
// CONFIGURAÇÃO DE CORS
// ==========================================================
// Simplificado para máxima compatibilidade. Permite todas as origens,
// mas apenas os métodos e cabeçalhos que especificamos.
app.use(cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

// Configuração das rotas da API
app.use('/api/obras', obraRoutes);
app.use('/api/materiais', materialRoutes);
app.use('/api/notas-fiscais', notaFiscalRoutes);
app.use('/api/produto', produtoRoutes);
app.use('/api/sales', saleRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado no servidor!');
});

// ==========================================================
// LÓGICA DE INICIALIZAÇÃO E EXPORTAÇÃO
// ==========================================================
// Bloco de sincronização com o banco de dados e inicialização do servidor
// para ambientes não-serverless (como seu PC local)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 8081;
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
}

// Exporta o app para que a Vercel possa usá-lo como uma função serverless
module.exports = app;