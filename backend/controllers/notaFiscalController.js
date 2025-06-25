// controllers/notaFiscalController.js

// Importa os modelos a partir do index.js, que garante que as associações funcionem
const { NotaFiscal, ItemNotaFiscal, Produto, Obra, sequelize } = require('../models');
const { Op } = require('sequelize');

// ==============================================================================
// FUNÇÕES DE CRIAÇÃO E EXCLUSÃO (Com melhorias de segurança e transação)
// ==============================================================================

// POST /api/notas-fiscais/
const addInvoice = async (req, res) => {
    const { numero, obra_id, itens, data_emissao } = req.body;
    const t = await sequelize.transaction(); // Usa transação para garantir integridade

    if (!numero || !obra_id || !itens || itens.length === 0 || !data_emissao) {
        return res.status(400).json({ status: false, message: "Dados incompletos para salvar a nota fiscal." });
    }

    try {
        const notaFiscalExistente = await NotaFiscal.findOne({ where: { numero } });
        if (notaFiscalExistente) {
            return res.status(400).json({ status: false, message: "Número de nota fiscal já cadastrado." });
        }

        const notaFiscal = await NotaFiscal.create({
            numero,
            obra_id,
            data_emissao: new Date(data_emissao),
        }, { transaction: t });

        const itemPromises = itens.map(item => {
            if (!item.produto_id || item.quantidade <= 0 || item.valor_unitario < 0) {
                throw new Error('Dados do item incompletos ou inválidos');
            }
            return ItemNotaFiscal.create({
                nota_fiscal_id: notaFiscal.id,
                produto_id: item.produto_id,
                quantidade: item.quantidade,
                valor_unitario: item.valor_unitario,
                valor_total: item.quantidade * item.valor_unitario,
            }, { transaction: t });
        });

        await Promise.all(itemPromises);
        await t.commit();
        res.status(201).json({ status: true, message: "Nota fiscal e itens salvos com sucesso!", data: notaFiscal });

    } catch (error) {
        await t.rollback();
        console.error("Erro ao salvar nota fiscal:", error);
        res.status(500).json({ status: false, message: error.message || "Erro ao salvar nota fiscal." });
    }
};

// DELETE /api/notas-fiscais/:id
const deleteInvoice = async (req, res) => {
    try {
        // A opção 'onDelete: CASCADE' no modelo cuida da exclusão dos itens associados.
        const deletedCount = await NotaFiscal.destroy({ where: { id: req.params.id } });
        if (deletedCount === 0) {
            return res.status(404).json({ status: false, message: "Nota fiscal não encontrada." });
        }
        res.status(200).json({ status: true, message: "Nota fiscal excluída com sucesso." });
    } catch (error) {
        console.error("Erro ao excluir nota fiscal:", error);
        res.status(500).json({ status: false, message: "Erro interno ao excluir a nota fiscal." });
    }
};


// ==============================================================================
// FUNÇÕES DE BUSCA E CONSULTA (Corrigidas e Otimizadas)
// ==============================================================================

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

// GET /api/notas-fiscais/:id ou /api/notas-fiscais/numero/:numero
const getNotaDetalhada = async (req, res) => {
    try {
        const { id, numero } = req.params;
        const whereClause = id ? { id } : { numero };

        const nota = await NotaFiscal.findOne({
            where: whereClause,
            include: [
                { model: Obra, as: 'obra', attributes: ['nome'] },
                {
                    model: ItemNotaFiscal,
                    as: 'itens', // Usa o alias correto definido no modelo
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

// GET /api/notas-fiscais/por-data
const getInvoicesByDateRange = async (req, res) => {
    const { data_inicio, data_fim } = req.query;
    if (!data_inicio || !data_fim) {
        return res.status(400).json({ status: false, message: "As datas são obrigatórias." });
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
        res.json({ status: true, data: notasFiscais, message: notasFiscais.length === 0 ? "Nenhuma nota fiscal encontrada para o período." : "" });
    } catch (error) {
        console.error("Erro ao buscar notas fiscais por data:", error);
        res.status(500).json({ status: false, message: "Erro ao buscar notas fiscais por data." });
    }
};

// GET /api/notas-fiscais/mensal/:obraId (Para o Dashboard)
const getMonthlyInvoices = async (req, res) => {
    const { obraId } = req.params;
    try {
        const notas = await NotaFiscal.findAll({
            where: { obra_id: obraId },
            include: { model: ItemNotaFiscal, as: 'itens', attributes: [] },
            attributes: [
                [sequelize.fn('strftime', '%Y-%m', sequelize.col('data_emissao')), 'mes_ano'],
                [sequelize.fn('SUM', sequelize.col('itens.valor_total')), 'total_compras']
            ],
            group: ['mes_ano'],
            order: [['mes_ano', 'ASC']],
            raw: true
        });

        const resultado = notas.map(n => ({
            mes: new Date(n.mes_ano + '-02T00:00:00Z').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' }).replace('.', ''),
            total_compras: parseFloat(n.total_compras)
        }));

        return res.json({ status: true, data: resultado });
    } catch (error) {
        console.error(`Erro ao buscar notas fiscais mensais para obra ${obraId}:`, error);
        return res.status(500).json({ status: false, message: "Erro ao buscar dados do dashboard." });
    }
};

// ==========================================================
// EXPORTAÇÃO DE TODAS AS FUNÇÕES
// ==========================================================
module.exports = {
    addInvoice,
    deleteInvoice,
    getNotaDetalhada,
    getInvoicesByDateRange,
    getMonthlyInvoices
};