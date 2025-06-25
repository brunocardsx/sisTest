// controllers/notaFiscalController.js
const { NotaFiscal, ItemNotaFiscal, Produto, Obra, sequelize } = require('../models'); // Importar sequelize para literais
const { Op } = require('sequelize');

exports.addInvoice = async (req, res) => {
    const { numero, obra_id, itens, data_emissao } = req.body;
    if (!numero || !obra_id || !itens || itens.length === 0 || !data_emissao) {
        return res.status(400).json({ status: false, message: "Dados incompletos para salvar a nota fiscal." });
    }
    try {
        // ... (seu código de addInvoice pode permanecer o mesmo)
    } catch (error) {
        // ... (seu tratamento de erro)
    }
};


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
                as: 'obra', // Verifique se 'obra' é o alias correto no seu model NotaFiscal
                attributes: ['nome']
            }],
            attributes: [
                'id',
                'numero',
                'data_emissao',
                // Calcula o valor total da nota diretamente no banco para alta performance
                [sequelize.literal('(SELECT SUM(valor_total) FROM itens_nota_fiscal WHERE nota_fiscal_id = "NotaFiscal"."id")'), 'valor_total_nota']
            ],
            order: [['data_emissao', 'DESC']]
        });

        if (notasFiscais.length === 0) {
            return res.status(200).json({ status: true, data: [], message: "Nenhuma nota fiscal encontrada para o período selecionado." });
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
 * Busca os detalhes completos de UMA ÚNICA nota pelo seu ID.
 * Usado quando o usuário expande o card.
 */
exports.getNotaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const nota = await NotaFiscal.findByPk(id, {
            include: [
                { model: Obra, as: 'obra', attributes: ['nome'] },
                {
                    model: ItemNotaFiscal,
                    as: 'itens', // PADRÃO: usando 'itens' como alias
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
            itens: nota.itens.map(item => ({
                ...item.toJSON(),
                produto_nome: item.produto ? item.produto.nome : 'Produto não encontrado'
            }))
        };
        res.status(200).json({ status: true, data: notaFormatada });
    } catch (error) {
        console.error('Erro ao buscar nota por ID:', error);
        res.status(500).json({ status: false, message: 'Erro interno do servidor.' });
    }
};

/**
 * Busca os detalhes completos de UMA ÚNICA nota pelo seu número.
 */
exports.getNotaPorNumero = async (req, res) => {
    try {
        const { numero } = req.params; // Corrigido de 'numeroNota' para 'numero' para corresponder à rota
        const nota = await NotaFiscal.findOne({
            where: { numero },
            include: [
                { model: Obra, as: 'obra', attributes: ['nome'] },
                {
                    model: ItemNotaFiscal,
                    as: 'itens', // PADRÃO: usando 'itens' como alias
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
            itens: nota.itens.map(item => ({
                ...item.toJSON(),
                produto_nome: item.produto ? item.produto.nome : 'Produto não encontrado'
            }))
        };
        res.status(200).json({ status: true, data: notaFormatada });
    } catch (error) {
        console.error('Erro ao buscar nota por número:', error);
        res.status(500).json({ status: false, message: 'Erro ao buscar nota fiscal.' });
    }
};

/**
 * Exclui uma nota fiscal e seus itens associados.
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

// Mantenha suas outras funções como getMonthlyInvoices aqui se precisar delas
exports.getMonthlyInvoices = async (req, res) => {
    // ... seu código de getMonthlyInvoices ...
    // Lembre-se de padronizar o alias 'as' para 'itens' se usar include aqui.
};

// A exportação agora é feita individualmente, o que é mais seguro contra esquecimentos.