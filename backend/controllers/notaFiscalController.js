// controllers/notaFiscalController.js
const { NotaFiscal, ItemNotaFiscal, Produto, Obra, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * 1. BUSCA NOTAS POR PERÍODO (OTIMIZADO)
 * Traz a lista de notas rapidamente, calculando o total no banco de dados.
 */
exports.getInvoicesByDateRange = async (req, res) => {
    const { data_inicio, data_fim } = req.query;
    if (!data_inicio || !data_fim) {
        return res.status(400).json({ status: false, message: "As datas de início e fim são obrigatórias." });
    }

    try {
        const notasFiscais = await NotaFiscal.findAll({
            where: {
                data_emissao: { [Op.between]: [`${data_inicio}T00:00:00Z`, `${data_fim}T23:59:59Z`] }
            },
            include: [{
                model: Obra,
                as: 'obra', // CONFIRME: Este é o alias no seu model NotaFiscal
                attributes: ['nome']
            }],
            attributes: [
                'id',
                'numero',
                'data_emissao',
                [sequelize.literal('(SELECT SUM(valor_total) FROM itens_nota_fiscal WHERE nota_fiscal_id = "NotaFiscal"."id")'), 'valor_total_nota']
            ],
            order: [['data_emissao', 'DESC']]
        });

        if (notasFiscais.length === 0) {
            return res.status(200).json({ status: true, data: [], message: "Nenhuma nota fiscal encontrada para o período." });
        }

        const resultado = notasFiscais.map(nf => ({
            ...nf.toJSON(),
            obra_nome: nf.obra ? nf.obra.nome : 'N/A'
        }));

        res.json({ status: true, data: resultado });
    } catch (error) {
        console.error("Erro ao buscar notas fiscais por data:", error);
        res.status(500).json({ status: false, message: "Erro ao buscar notas fiscais por data." });
    }
};

/**
 * 2. BUSCA UMA NOTA POR ID (PARA EXPANDIR DETALHES)
 * Traz todos os detalhes de uma única nota, incluindo seus itens.
 */
exports.getNotaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const nota = await NotaFiscal.findByPk(id, {
            include: [
                { model: Obra, as: 'obra', attributes: ['nome'] },
                {
                    model: ItemNotaFiscal,
                    as: 'itens', // PADRÃO: Usando 'itens'. Verifique se este alias está correto no seu Model.
                    include: [{ model: Produto, as: 'produto', attributes: ['nome'] }]
                }
            ]
        });

        if (!nota) {
            return res.status(404).json({ status: false, message: 'Nota fiscal não encontrada.' });
        }

        const notaFormatada = {
            ...nota.toJSON(),
            obra_nome: nota.obra ? nota.obra.nome : 'N/A',
            itens: nota.itens ? nota.itens.map(item => ({
                ...item.toJSON(),
                produto_nome: item.produto ? item.produto.nome : 'Produto não encontrado'
            })) : []
        };
        res.status(200).json({ status: true, data: notaFormatada });
    } catch (error) {
        console.error('Erro ao buscar nota por ID:', error);
        res.status(500).json({ status: false, message: 'Erro interno do servidor.' });
    }
};

/**
 * 3. BUSCA UMA NOTA POR NÚMERO
 */
exports.getNotaPorNumero = async (req, res) => {
    try {
        const { numero } = req.params; // Usando 'numero' para corresponder à rota
        const nota = await NotaFiscal.findOne({
            where: { numero },
            include: [
                { model: Obra, as: 'obra', attributes: ['nome'] },
                {
                    model: ItemNotaFiscal,
                    as: 'itens', // PADRÃO: Usando 'itens'.
                    include: [{ model: Produto, as: 'produto', attributes: ['nome'] }]
                }
            ]
        });

        if (!nota) {
            return res.status(404).json({ status: false, message: 'Nota fiscal não encontrada.' });
        }

        const notaFormatada = {
            ...nota.toJSON(),
            obra_nome: nota.obra ? nota.obra.nome : 'N/A',
            itens: nota.itens ? nota.itens.map(item => ({
                ...item.toJSON(),
                produto_nome: item.produto ? item.produto.nome : 'Produto não encontrado'
            })) : []
        };
        res.status(200).json({ status: true, data: notaFormatada });
    } catch (error) {
        console.error('Erro ao buscar nota por número:', error);
        res.status(500).json({ status: false, message: 'Erro ao buscar nota fiscal.' });
    }
};

/**
 * 4. DELETA UMA NOTA
 */
exports.deleteNota = async (req, res) => {
    const { id } = req.params;
    try {
        await ItemNotaFiscal.destroy({ where: { nota_fiscal_id: id } });
        const deletedCount = await NotaFiscal.destroy({ where: { id } });

        if (deletedCount === 0) {
            return res.status(404).json({ status: false, message: "Nota fiscal não encontrada." });
        }

        res.status(200).json({ status: true, message: `Nota fiscal excluída com sucesso.` });
    } catch (error) {
        console.error("Erro ao excluir nota fiscal:", error);
        res.status(500).json({ status: false, message: "Erro interno ao excluir a nota fiscal." });
    }
};


/**
 * 5. ADICIONA UMA NOVA NOTA
 */
exports.addInvoice = async (req, res) => {
    const { numero, obra_id, itens, data_emissao } = req.body;
    if (!numero || !obra_id || !itens || itens.length === 0 || !data_emissao) {
        return res.status(400).json({ status: false, message: "Dados incompletos." });
    }

    try {
        const notaFiscal = await NotaFiscal.create({ numero, obra_id, data_emissao: new Date(data_emissao) });
        const itemPromises = itens.map(item => ItemNotaFiscal.create({
            nota_fiscal_id: notaFiscal.id,
            produto_id: item.produto_id,
            quantidade: item.quantidade,
            valor_unitario: item.valor_unitario,
            valor_total: item.quantidade * item.valor_unitario,
        }));
        await Promise.all(itemPromises);
        res.status(201).json({ status: true, message: "Nota fiscal salva com sucesso!", data: notaFiscal });
    } catch (error) {
        console.error("Erro ao salvar nota fiscal:", error);
        res.status(500).json({ status: false, message: "Erro ao salvar nota fiscal." });
    }
};

/**
 * 6. BUSCA TOTAIS MENSAIS PARA GRÁFICOS
 */
exports.getMonthlyInvoices = async (req, res) => {
    const { obraId } = req.params;
    try {
        // ... (Seu código original para getMonthlyInvoices pode ser mantido aqui,
        // mas lembre-se de padronizar o alias para 'as: "itens"')
        res.status(501).json({ status: false, message: "Rota não implementada." });
    } catch (error) {
        res.status(500).json({ status: false, message: "Erro ao buscar totais mensais." });
    }
};