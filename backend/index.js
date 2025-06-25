// Backend/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');

// NOVO: Importe os novos arquivos
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/authMiddleware');

// SUAS ROTAS EXISTENTES
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
    allowedHeaders: ['Content-Type', 'Authorization'], // 'Authorization' já estava aqui, perfeito!
    credentials: true,
}));

app.use(express.json());

// ==========================================================
// ALTERADO: Estrutura de Rotas (Públicas vs. Protegidas)
// ==========================================================

// --- ROTAS PÚBLICAS ---
// Estas rotas não precisam de token para serem acessadas.
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});
app.use('/api/auth', authRoutes); // A rota de login é pública

// --- ROTAS PROTEGIDAS ---
// Todas as rotas abaixo desta linha SÓ funcionarão se um token JWT válido for enviado.
// O middleware `authMiddleware` será o segurança de todas elas.
app.use('/api/obras', authMiddleware, obraRoutes);
app.use('/api/materiais', authMiddleware, materialRoutes);
app.use('/api/notas-fiscais', authMiddleware, notaFiscalRoutes);
app.use('/api/produto', authMiddleware, produtoRoutes);
app.use('/api/sales', authMiddleware, saleRoutes);


// Middleware de tratamento de erros (mantido como estava)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado no servidor!');
});

// Lógica de inicialização (mantida como estava)
if (require.main === module) {
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

module.exports = app;