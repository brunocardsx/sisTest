// Backend/models/NotaFiscal.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const NotaFiscal = sequelize.define('NotaFiscal', {
    // Colunas próprias da Nota Fiscal. A 'obra_id' será criada pela associação.
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
    tableName: 'notas_fiscais', // Convenção: plural e snake_case
    timestamps: false
});

NotaFiscal.associate = (models) => {
    // Uma NotaFiscal tem VÁRIOS Itens.
    // O Sequelize vai adicionar a coluna 'nota_fiscal_id' na tabela 'itens_nota_fiscal'.
    NotaFiscal.hasMany(models.ItemNotaFiscal, {
        foreignKey: 'nota_fiscal_id',
        as: 'itensDaNota',
        onDelete: 'CASCADE' // Se deletar a nota, deleta os itens. Ótima escolha.
    });

    // Uma NotaFiscal pertence a UMA Obra.
    // O Sequelize vai adicionar a coluna 'obra_id' à tabela 'notas_fiscais'.
    NotaFiscal.belongsTo(models.Obra, {
        foreignKey: 'obra_id',
        as: 'obra'
    });
};

module.exports = NotaFiscal;