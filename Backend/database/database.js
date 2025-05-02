const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('sysobras', 'postgres', 'admin', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432,
  logging: false
})

// Verificando a conexão
sequelize.authenticate()
    .then(() => {
      console.log('Conexão com o banco de dados foi bem-sucedida!')
    })
    .catch((error) => {
      console.error('Não foi possível conectar ao banco de dados:', error)
    })

module.exports = sequelize