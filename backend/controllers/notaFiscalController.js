// controllers/notaFiscalController.js

const { NotaFiscal, ItemNotaFiscal, Produto, Obra } = require('../models');
const { Op } = require('sequelize');

// --- SUAS FUNÇÕES EXISTENTES (SEM ALTERAÇÕES) ---

async function addInvoice(req, res) {
    // ... seu código existente ...
}
async function getMonthlyInvoices(req, res) {
    // ... seu código existente ...
}
async function getInvoiceByNumber(req, res) {
    // ... seu código existente ...
}
async function getInvoicesByDateRange(req, res) {
    // ... seu código existente ...
}
async function deleteInvoice(req, res) {
    // ... seu código existente ...
}


// ==========================================================
// NOVA FUNÇÃO PARA BUSCAR UMA NOTA POR SEU ID
// ==========================================================
async function getNotaPorId(req, res) {
    try {
        const { id } = req.params;
        const nota = await NotaFiscal.findByPk(id, {
            include: [
                {
                    model: Obra,
                    as: 'obra',
                    attributes: ['nome']
                },
                {
                    model: ItemNotaFiscal,
                    as: 'itens', // Use o alias definido na associação do seu Model
                    include: [{
                        model: Produto,
                        as: 'produto',
                        attributes: ['nome']
                    }]
                }
            ]
        });

        if (!nota) {
            return res.status(404).json({ status: false, message: 'Nota fiscal não encontrada.' });
        }

        const notaFormatada = {
            ...nota.toJSON(),
            obra_nome: nota.obra ? nota.obra.nome : 'N/A',
            itens: nota.itens.map(item => ({
                ...item.toJSON(),
                produto_nome: item.produto ? item.produto.nome : 'Produto não encontrado'
            }))
        };

        res.status(200).json({ status: true, data: notaFormatada });
    } catch (error) {
        console.error('Erro ao buscar nota por ID:', error);
        res.status(500).json({ status: false, message: 'Erro interno do servidor ao buscar detalhes da nota.' });
    }
}

module.exports = {
    addInvoice,
    getMonthlyInvoices,
    getInvoiceByNumber,
    getInvoicesByDateRange,
    deleteInvoice,
    getNotaPorId // <-- Adicionando a nova função aqui
};