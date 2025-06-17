// models/ItemNotaFiscal.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/database'); // Sua instância do Sequelize

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
    timestamps: false,
});

// --- CORREÇÃO AQUI ---
// Defina o método associate
ItemNotaFiscal.associate = function(models) {
    // ItemNotaFiscal pertence a uma NotaFiscal
    ItemNotaFiscal.belongsTo(models.NotaFiscal, {
        foreignKey: 'nota_fiscal_id',
        as: 'notaFiscal' // Alias opcional, mas útil. Se usar, use no include.
    });

    // ItemNotaFiscal pertence a um Produto
    ItemNotaFiscal.belongsTo(models.Produto, {
        foreignKey: 'produto_id',
        as: 'produto' // Alias opcional, mas útil. Se usar, use no include.
    });
};

module.exports = ItemNotaFiscal;