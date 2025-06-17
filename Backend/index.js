// index.js (Backend)

// Carrega as variáveis do arquivo .env em desenvolvimento
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./models'); // O 'db' aqui já deve conter o sequelize configurado

// Importação das rotas
const obraRoutes = require('./routes/obraRoutes');
const materialRoutes = require('./routes/materialRoutes');
const notaFiscalRoutes = require('./routes/notaFiscalRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const saleRoutes = require('./routes/saleRoutes');

const app = express();

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

// Rota de health check - Ótima prática!
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

// Middleware para tratamento de erros - Colocado antes do 'listen'
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado no servidor!');
});

// ==========================================================
// LÓGICA DE INICIALIZAÇÃO E EXPORTAÇÃO
// ==========================================================
const PORT = process.env.PORT || 8081;

// A Vercel não usa o app.listen. Ela só precisa do 'app' exportado.
// O Render e o ambiente local precisam do app.listen.
// O 'require.main === module' é uma forma inteligente de verificar se o arquivo está sendo
// executado diretamente (com 'node index.js') ou se está sendo importado por outro (como a Vercel faz).
if (require.main === module) {
    // Este bloco só roda no RENDER e no seu PC LOCAL
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