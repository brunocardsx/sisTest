const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Produto = sequelize.define('Produto', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // Boa prática adicionar unique para evitar nomes duplicados no nível do DB
    },
    marca: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    custo: {
        type: DataTypes.DECIMAL(10, 2), // DECIMAL é melhor para valores monetários
        allowNull: true,
        defaultValue: 0.00,
    },
    revenda: {
        type: DataTypes.DECIMAL(10, 2), // DECIMAL é melhor para valores monetários
        allowNull: true,
        defaultValue: 0.00,
    }
}, {
    tableName: 'produtos',
    timestamps: false,
});

// Este método é crucial e será chamado pelo seu arquivo `models/index.js`
Produto.associate = (models) => {
    // Um Produto pode estar em muitos ItemNotaFiscal
    Produto.hasMany(models.ItemNotaFiscal, {
        foreignKey: {
            name: 'produto_id',
            allowNull: false
        },
        // A opção onDelete: 'RESTRICT' é o padrão.
        // Isso significa que o banco de dados irá gerar um erro se você tentar
        // deletar um Produto que tenha um ItemNotaFiscal associado.
        // Nosso controller está preparado para capturar este erro.
        onDelete: 'RESTRICT',
        as: 'itensDeNota'
    });
};

module.exports = Produto;