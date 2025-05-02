const express = require('express');
const cors = require('cors');
const sequelize = require('./database/database.js');

const clienteRoutes = require('./routes/clienteRoutes');
const obraRoutes = require('./routes/obraRoutes');
const materialRoutes = require('./routes/materialRoutes');
const notaFiscalRoutes = require('./routes/notaFiscalRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const saleRoutes = require('./routes/saleRoutes');

const app = express();

// ⚠️ CORS precisa vir antes de tudo
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

// ⚠️ Todas as rotas devem vir antes do app.listen
app.use('/api/clientes', clienteRoutes);
app.use('/api/obras', obraRoutes);
app.use('/api/materiais', materialRoutes);
app.use('/api/notas-fiscais', notaFiscalRoutes);
app.use('/api/produto', produtoRoutes);
app.use('/api/sales', saleRoutes); // Corrigido para seguir padrão "/api"

// Teste de conexão com o banco de dados
sequelize.authenticate()
    .then(() => console.log('Conexão com o banco de dados estabelecida.'))
    .catch(err => console.error('Erro ao conectar ao banco de dados:', err));

const { Produto } = require('./models');

sequelize.sync({ alter: true }) // Altera as tabelas existentes para coincidir com os modelos atuais
    .then(() => {
      console.log('Tabelas sincronizadas com sucesso!');
    })
    .catch((err) => {
      console.error('Erro ao sincronizar tabelas:', err);
    });

// Inicialização do servidor
app.listen(8081, () => {
  console.log("Server is running on port 8081");
});
