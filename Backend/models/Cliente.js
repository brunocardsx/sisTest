const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/database'); // Aqui você importa o sequelize que conecta ao DB

class Cliente extends Model {}

Cliente.init(
    {
        nome: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nascimento: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        telefone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        bairro: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        rua: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cidade: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        estado: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        sequelize,
        modelName: 'Cliente',
        tableName: 'clientes', // Nome da tabela no banco
    }
);

module.exports = { Cliente };
