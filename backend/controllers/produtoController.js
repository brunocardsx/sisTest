// controllers/produtoController.js

const { Produto } = require('../models');
const { Sequelize } = require('sequelize');

// Função para criar produto (inalterada, mas incluída para o arquivo completo)
async function createProduto(req, res) {
    const { nome } = req.body;
    if (!nome || nome.trim() === '') {
        return res.status(400).json({ status: false, message: "O nome do produto é obrigatório." });
    }
    const trimmedName = nome.trim();
    try {
        const existingProduct = await Produto.findOne({
            where: Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('nome')),
                Sequelize.fn('LOWER', trimmedName)
            )
        });
        if (existingProduct) {
            return res.status(409).json({ status: false, message: "Um produto com este nome já existe." });
        }
        const produto = await Produto.create({ nome: trimmedName });
        return res.json({ status: true, produto });
    } catch (error) {
        console.error("Erro ao criar produto:", error);
        return res.status(500).json({ status: false, message: "Erro interno ao criar o produto." });
    }
}

// Função para listar todos os produtos (inalterada, mas incluída para o arquivo completo)
async function getProdutos(req, res) {
    try {
        const produtos = await Produto.findAll({ order: [['nome', 'ASC']] }); // Ordena alfabeticamente
        if (!produtos) { // Não precisa checar length, findAll nunca retorna null
            return res.json({ status: true, produtos: [] }); // Retorna array vazio se não houver produtos
        }
        return res.json({ status: true, produtos });
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        return res.status(500).json({ status: false, message: "Erro ao buscar produtos." });
    }
}

// NOVO: Função para deletar um produto
async function deleteProduto(req, res) {
    const { id } = req.params; // Pega o ID dos parâmetros da rota

    try {
        // 1. Verifica se o produto existe
        const produto = await Produto.findByPk(id);
        if (!produto) {
            return res.status(404).json({ status: false, message: "Produto não encontrado." });
        }

        // 2. Tenta deletar o produto
        await produto.destroy(); // Usar o método destroy na instância encontrada

        // 3. Retorna sucesso
        return res.status(200).json({ status: true, message: `Produto "${produto.nome}" foi excluído com sucesso.` });

    } catch (error) {
        // 4. Tratamento de erro específico para chave estrangeira
        // O nome do erro pode variar um pouco dependendo do seu dialeto SQL (Postgres, MySQL, etc.)
        if (error instanceof Sequelize.ForeignKeyConstraintError) {
            return res.status(409).json({ // 409 Conflict é um bom status para este caso
                status: false,
                message: "Este produto não pode ser excluído, pois está associado a uma ou mais notas fiscais."
            });
        }

        // 5. Tratamento de erro genérico
        console.error("Erro ao deletar produto:", error);
        return res.status(500).json({ status: false, message: "Ocorreu um erro no servidor ao tentar excluir o produto." });
    }
}

module.exports = {
    createProduto,
    getProdutos,
    deleteProduto // Exporta a nova função
};