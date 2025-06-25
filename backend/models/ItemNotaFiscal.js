// models/ItemNotaFiscal.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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

    ItemNotaFiscal.associate = (models) => {
        // Um Item PERTENCE A UMA NotaFiscal.
        ItemNotaFiscal.belongsTo(models.NotaFiscal, {
            foreignKey: 'nota_fiscal_id',
            as: 'notaFiscal'
        });

        // Um Item PERTENCE A UM Produto.
        ItemNotaFiscal.belongsTo(models.Produto, {
            foreignKey: 'produto_id',
            as: 'produto'
        });
    };

    return ItemNotaFiscal;
};