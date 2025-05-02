// controllers/produtoController.js
const { Produto } = require('../models');

// Função para criar um novo produto
async function createProduto(req, res) {
    const { nome, marca, custo, revenda } = req.body;

    try {
        const produto = await Produto.create({ nome, marca, custo, revenda });
        return res.json({ status: true, produto });
    } catch (error) {
        console.error("Erro ao criar produto:", error);
        return res.status(500).json({ status: false, message: "Erro ao criar produto." });
    }
}

// Função para listar todos os produtos
async function getProdutos(req, res) {
    try {
        const produtos = await Produto.findAll();

        if (!produtos || produtos.length === 0) {
            return res.json({ status: false, message: "Nenhum produto encontrado." });
        }

        return res.json({ status: true, produtos });
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        return res.status(500).json({ status: false, message: "Erro ao buscar produtos." });
    }
}

module.exports = { createProduto, getProdutos };
