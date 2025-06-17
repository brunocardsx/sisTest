// models/Obra.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Obra = sequelize.define('Obra', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'obras',
    timestamps: false
});

// --- CORREÇÃO AQUI ---
// Defina o método associate
Obra.associate = function(models) {
    // Uma Obra pode ter várias Notas Fiscais
    // Esta é a contraparte da associação NotaFiscal.belongsTo(models.Obra)
    Obra.hasMany(models.NotaFiscal, {
        foreignKey: 'obra_id', // A chave estrangeira na tabela 'nota_fiscal' que referencia 'obras'
        as: 'notasFiscais'    // Alias opcional
    });
};

module.exports = Obra;