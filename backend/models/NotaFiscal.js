// models/NotaFiscal.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const NotaFiscal = sequelize.define('NotaFiscal', {
        numero: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        data_emissao: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'notas_fiscais',
        timestamps: false
    });

    NotaFiscal.associate = (models) => {
        // UMA NotaFiscal TEM VÁRIOS Itens.
        NotaFiscal.hasMany(models.ItemNotaFiscal, {
            foreignKey: 'nota_fiscal_id',
            // CORREÇÃO CRÍTICA: Alias padronizado para 'itens'
            as: 'itens',
            onDelete: 'CASCADE'
        });

        // UMA NotaFiscal PERTENCE A UMA Obra.
        NotaFiscal.belongsTo(models.Obra, {
            foreignKey: 'obra_id',
            as: 'obra'
        });
    };

    return NotaFiscal;
};