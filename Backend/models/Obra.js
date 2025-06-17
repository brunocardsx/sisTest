// Backend/models/Obra.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Obra = sequelize.define('Obra', {
    // Apenas as colunas que pertencem à Obra
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    endereco: { // Supondo que você queira um endereço
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'obras',
    timestamps: false
});

Obra.associate = (models) => {
    // Uma Obra pode ter VÁRIAS Notas Fiscais.
    // O Sequelize vai adicionar a coluna 'obra_id' na tabela 'notas_fiscais'.
    Obra.hasMany(models.NotaFiscal, {
        foreignKey: 'obra_id',
        as: 'notasFiscais'
    });
};

module.exports = Obra;