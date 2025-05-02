const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const ItemNotaFiscal = sequelize.define('ItemNotaFiscal', {
    nota_fiscal_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    produto_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
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
    tableName: 'item_nota_fiscal',
    timestamps: false
});

module.exports = ItemNotaFiscal;
