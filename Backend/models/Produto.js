// models/Produto.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Produto = sequelize.define('Produto', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    marca: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    custo: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    revenda: {
        type: DataTypes.FLOAT,
        allowNull: false,
    }
}, {
    tableName: 'produto', // Alterado para 'PRODUTO' em maiúsculas
    timestamps: false, // Desabilita createdAt e updatedAt
});

module.exports = Produto;
