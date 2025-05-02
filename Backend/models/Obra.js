const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Obra = sequelize.define('Obra', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descricao: {
        type: DataTypes.STRING
    },
    cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    data_inicio: {
        type: DataTypes.DATE,
        allowNull: false
    },
    data_fim: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'obras',
    timestamps: false
});

module.exports = Obra;

sequelize.sync({ force: false }) // Sincroniza sem apagar a tabela
    .then(() => console.log("Tabela 'obras' sincronizada com sucesso."))
    .catch((error) => console.error("Erro ao sincronizar tabela 'obras':", error));
