// controllers/notaFiscalController.js

// =================================================================================
// CORREÇÃO CRÍTICA: Importe os modelos a partir do 'index.js' para obter as associações.
// =================================================================================
const { NotaFiscal, ItemNotaFiscal, Produto, Obra, sequelize } = require('../models');
const { Op } = require('sequelize');

// HELPER: Centraliza a formatação da nota para a resposta da API.
const formatarNotaParaResposta = (nota) => {
    if (!nota) return null;
    const notaJson = nota.toJSON();
    const valorTotalNota = notaJson.itens
        ? notaJson.itens.reduce((sum, item) => sum + parseFloat(item.valor_total || 0), 0)
        : 0;
    return {
        ...notaJson,
        valor_total_nota: valorTotalNota,
        obra_nome: notaJson.obra ? notaJson.obra.nome : 'N/A',
        itens: notaJson.itens ? notaJson.itens.map(item => ({
            ...item,
            produto_nome: item.produto ? item.produto.nome : 'Produto não identificado'
        })) : []
    };
};

// Uma única função para buscar detalhes por ID ou Número
exports.getNotaDetalhada = async (req, res) => {
    try {
        const { id, numero } = req.params;
        const whereClause = id ? { id } : { numero };

        const nota = await NotaFiscal.findOne({
            where: whereClause,
            include: [ // Este include AGORA VAI FUNCIONAR porque os modelos estão associados.
                { model: Obra, as: 'obra', attributes: ['nome'] },
                {
                    model: ItemNotaFiscal,
                    as: 'itens',
                    include: [{ model: Produto, as: 'produto', attributes: ['nome'] }]
                }
            ]
        });

        if (!nota) {
            return res.status(404).json({ status: false, message: 'Nota fiscal não encontrada.' });
        }
        res.status(200).json({ status: true, data: formatarNotaParaResposta(nota) });
    } catch (error) {
        console.error('Erro ao buscar nota detalhada:', error);
        res.status(500).json({ status: false, message: 'Erro interno do servidor.' });
    }
};

// Função para buscar a lista de notas por data
exports.getInvoicesByDateRange = async (req, res) => {
    const { data_inicio, data_fim } = req.query;
    if (!data_inicio || !data_fim) {
        return res.status(400).json({ status: false, message: "Datas são obrigatórias." });
    }
    try {
        const notasFiscais = await NotaFiscal.findAll({
            where: { data_emissao: { [Op.between]: [`${data_inicio}T00:00:00Z`, `${data_fim}T23:59:59Z`] } },
            attributes: [
                'id', 'numero', 'data_emissao',
                [sequelize.literal('(SELECT SUM(valor_total) FROM itens_nota_fiscal WHERE nota_fiscal_id = "NotaFiscal"."id")'), 'valor_total_nota']
            ],
            order: [['data_emissao', 'DESC']]
        });
        res.json({ status: true, data: notasFiscais, message: notasFiscais.length === 0 ? "Nenhuma nota fiscal encontrada." : "" });
    } catch (error) {
        console.error("Erro ao buscar notas fiscais por data:", error);
        res.status(500).json({ status: false, message: "Erro ao buscar notas fiscais por data." });
    }
};

// Função para deletar uma nota
exports.deleteNota = async (req, res) => {
    try {
        const deletedCount = await NotaFiscal.destroy({ where: { id: req.params.id } });
        if (deletedCount === 0) {
            return res.status(404).json({ status: false, message: "Nota fiscal não encontrada." });
        }
        res.status(200).json({ status: true, message: "Nota fiscal excluída com sucesso." });
    } catch (error) {
        console.error("Erro ao excluir nota fiscal:", error);
        res.status(500).json({ status: false, message: "Erro ao excluir a nota fiscal." });
    }
};