const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

// QUALQUER 'require' para 'Obra.js' ou 'ItemNotaFiscal.js' DEVE SER REMOVIDO DO TOPO

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

// A associação agora usa o parâmetro 'models' que o index.js fornece
NotaFiscal.associate = (models) => {
    // CORREÇÃO: Usa 'models.ItemNotaFiscal' e 'models.Obra'
    NotaFiscal.hasMany(models.ItemNotaFiscal, {
        foreignKey: 'nota_fiscal_id',
        as: 'itens',
        onDelete: 'CASCADE'
    });

    NotaFiscal.belongsTo(models.Obra, {
        foreignKey: 'obra_id',
        as: 'obra'
    });
};

module.exports = NotaFiscal;