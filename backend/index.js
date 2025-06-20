// Backend/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');

const obraRoutes = require('./routes/obraRoutes');
const materialRoutes = require('./routes/materialRoutes');
const notaFiscalRoutes = require('./routes/notaFiscalRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const saleRoutes = require('./routes/saleRoutes');

const app = express();

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(express.json());

app.use('/api/obras', obraRoutes);
app.use('/api/materiais', materialRoutes);
app.use('/api/notas-fiscais', notaFiscalRoutes);
app.use('/api/produto', produtoRoutes);
app.use('/api/sales', saleRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado no servidor!');
});

// ==========================================================
// LÓGICA DE INICIALIZAÇÃO CORRIGIDA
// ==========================================================
// Este bloco SEMPRE roda quando o arquivo é executado diretamente (Render, Local)
// E NUNCA roda quando é importado (Vercel)
if (require.main === module) {
    const PORT = process.env.PORT || 8081;

    db.sequelize.sync({ alter: true })
        .then(() => {
            console.log('Banco de dados sincronizado com sucesso.');
            app.listen(PORT, () => {
                // A Render espera que a porta 0.0.0.0 seja usada
                console.log(`Servidor rodando na porta ${PORT}`);
            });
        })
        .catch(err => {
            console.error('Erro ao conectar ou sincronizar com o banco de dados:', err);
            process.exit(1);
        });
}

// A Vercel (e testes) só precisam do 'app' exportado.
module.exports = app;