// Backend/models/ItemNotaFiscal.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const ItemNotaFiscal = sequelize.define('ItemNotaFiscal', {
    // Colunas que pertencem à "linha" da nota fiscal.
    // As chaves estrangeiras 'nota_fiscal_id' e 'produto_id' são criadas pelas associações.
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    valor_unitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    valor_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'itens_nota_fiscal', // Convenção: plural e snake_case
    timestamps: false,
});

ItemNotaFiscal.associate = (models) => {
    // Um ItemNotaFiscal pertence a UMA NotaFiscal.
    ItemNotaFiscal.belongsTo(models.NotaFiscal, {
        foreignKey: 'nota_fiscal_id',
        as: 'notaFiscal'
    });

    // Um ItemNotaFiscal pertence a UM Produto.
    ItemNotaFiscal.belongsTo(models.Produto, {
        foreignKey: 'produto_id',
        as: 'produto'
    });
};

module.exports = ItemNotaFiscal;