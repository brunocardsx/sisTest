const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const NotaFiscal = sequelize.define('NotaFiscal', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    numero: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    data_emissao: {
        type: DataTypes.DATE,
        allowNull: false
    },
    obra_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'obras',
            key: 'id'
        }
    }
}, {
    tableName: 'nota_fiscal',
    timestamps: false
});

NotaFiscal.associate = function(models) {
    // Se uma NotaFiscal for deletada, todos os seus itens também serão.
    NotaFiscal.hasMany(models.ItemNotaFiscal, {
        foreignKey: 'nota_fiscal_id',
        as: 'itensDaNota',
        onDelete: 'CASCADE' // <-- ADIÇÃO CRUCIAL
    });

    NotaFiscal.belongsTo(models.Obra, {
        foreignKey: 'obra_id',
        as: 'obra'
    });
};

module.exports = NotaFiscal;