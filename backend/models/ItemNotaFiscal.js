const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

// QUALQUER 'require' para 'NotaFiscal.js' ou 'Produto.js' DEVE SER REMOVIDO DO TOPO

const ItemNotaFiscal = sequelize.define('ItemNotaFiscal', {
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
    tableName: 'itens_nota_fiscal',
    timestamps: false,
});

// A associação agora usa o parâmetro 'models' que o index.js fornece
ItemNotaFiscal.associate = (models) => {
    // CORREÇÃO: Usa 'models.NotaFiscal' e 'models.Produto'
    ItemNotaFiscal.belongsTo(models.NotaFiscal, {
        foreignKey: 'nota_fiscal_id',
        as: 'notaFiscal'
    });

    ItemNotaFiscal.belongsTo(models.Produto, {
        foreignKey: 'produto_id',
        as: 'produto'
    });
};

module.exports = ItemNotaFiscal;