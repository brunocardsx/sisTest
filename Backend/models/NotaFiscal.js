const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const NotaFiscal = sequelize.define('NotaFiscal', {
    numero: {
        type: DataTypes.STRING,
        allowNull: false
    },
    data_emissao: {
        type: DataTypes.DATE,
        allowNull: false
    },
    obra_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'nota_fiscal',
    timestamps: false
});

module.exports = NotaFiscal;
