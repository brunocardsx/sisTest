// Backend/models/Produto.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Produto = sequelize.define('Produto', {
    // Apenas as colunas que pertencem ao Produto
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    marca: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    custo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
    },
    revenda: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
    }
}, {
    tableName: 'produtos', // Convenção: plural
    timestamps: false,
});

Produto.associate = (models) => {
    // Um Produto pode estar em VÁRIOS Itens de Nota Fiscal.
    // O Sequelize vai adicionar a coluna 'produto_id' na tabela 'itens_nota_fiscal'.
    Produto.hasMany(models.ItemNotaFiscal, {
        foreignKey: 'produto_id',
        as: 'itensDeNota'
    });
};

module.exports = Produto;