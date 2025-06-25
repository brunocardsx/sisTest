// controllers/notaFiscalController.js
const { NotaFiscal, ItemNotaFiscal, Produto, Obra } = require('../models');
const { Op } = require('sequelize');

async function addInvoice(req, res) {
    const { numero, obra_id, itens, data_emissao } = req.body;

    if (!numero || !obra_id || !itens || itens.length === 0 || !data_emissao) {
        return res.status(400).json({ status: false, message: "Dados incompletos para salvar a nota fiscal." });
    }

    try {
        const notaFiscalExistente = await NotaFiscal.findOne({ where: { numero } });
        if (notaFiscalExistente) {
            return res.status(400).json({ status: false, message: "Número de nota fiscal já cadastrado." });
        }

        const obra = await Obra.findByPk(obra_id);
        if (!obra) {
            return res.status(404).json({ status: false, message: "Obra não encontrada." });
        }

        const notaFiscal = await NotaFiscal.create({
            numero,
            obra_id,
            data_emissao: new Date(data_emissao),
        });

        const itemPromises = itens.map(async (item) => {
            if (!item.produto_id || item.quantidade <= 0 || item.valor_unitario < 0) {
                throw new Error('Dados do item incompletos ou inválidos');
            }

            const produto = await Produto.findByPk(item.produto_id);
            if (!produto) {
                throw new Error(`Produto com ID ${item.produto_id} não encontrado.`);
            }

            return ItemNotaFiscal.create({
                nota_fiscal_id: notaFiscal.id,
                produto_id: item.produto_id,
                quantidade: item.quantidade,
                valor_unitario: item.valor_unitario,
                valor_total: item.quantidade * item.valor_unitario,
            });
        });

        await Promise.all(itemPromises);

        return res.status(201).json({ status: true, message: "Nota fiscal e itens salvos com sucesso!", data: notaFiscal });
    } catch (error) {
        console.error("Erro ao salvar nota fiscal:", error);
        return res.status(500).json({ status: false, message: error.message || "Erro ao salvar nota fiscal." });
    }
}

async function getMonthlyInvoices(req, res) {
    const { obraId } = req.params;
    const { mes } = req.query;

    try {
        const where = {
            obra_id: obraId
        };

        if (mes && mes !== 'todos') {
            const [ano, mesNumero] = mes.split('-');
            if (!ano || !mesNumero || isNaN(parseInt(ano)) || isNaN(parseInt(mesNumero))) {
                return res.status(400).json({ status: false, message: "Formato de mês inválido. Use YYYY-MM." });
            }
            const inicioMes = new Date(Date.UTC(parseInt(ano), parseInt(mesNumero) - 1, 1));
            const fimMes = new Date(Date.UTC(parseInt(ano), parseInt(mesNumero), 1));

            where.data_emissao = { // <<< PONTO CRÍTICO PARA O ERRO ATUAL
                [Op.gte]: inicioMes,
                [Op.lt]: fimMes,
            };
        }

        const notas = await NotaFiscal.findAll({
            where,
            include: {
                model: ItemNotaFiscal,
                as: 'itensDaNota',
                attributes: ['valor_total']
            },
            order: [['data_emissao', 'ASC']] // <<< PONTO CRÍTICO PARA O ERRO ATUAL
        });

        const totaisPorMes = {};

        for (const nota of notas) {
            const data = new Date(nota.data_emissao);
            const mesAno = data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' }).replace('.', '');
            const nomeMes = mesAno.charAt(0).toUpperCase() + mesAno.slice(1);

            let totalNota = 0;
            if (nota.itensDaNota && nota.itensDaNota.length > 0) {
                totalNota = nota.itensDaNota.reduce((soma, item) => soma + parseFloat(item.valor_total || 0), 0);
            }

            if (!totaisPorMes[nomeMes]) {
                totaisPorMes[nomeMes] = 0;
            }
            totaisPorMes[nomeMes] += totalNota;
        }

        const resultado = Object.entries(totaisPorMes).map(([mesFormatado, total]) => ({
            mes: mesFormatado,
            total_compras: total
        }));

        return res.json({ status: true, data: resultado });
    } catch (error) {
        console.error(`Erro ao buscar notas fiscais mensais para obra ${obraId}:`, error);
        // Inclua o erro original na resposta para mais detalhes no frontend ou Postman
        return res.status(500).json({ status: false, message: "Erro ao buscar notas fiscais mensais.", errorDetails: error.original?.sql || error.sql || error.message });
    }
}

async function getInvoiceByNumber(req, res) {
    const { numeroNota } = req.params;

    if (!numeroNota) {
        return res.status(400).json({ status: false, message: "Número da nota fiscal não fornecido." });
    }

    try {
        const notaFiscal = await NotaFiscal.findOne({
            where: { numero: numeroNota },
            include: [
                {
                    model: ItemNotaFiscal,
                    as: 'itensDaNota',
                    include: {
                        model: Produto,
                        as: 'produto',
                        attributes: ['nome']
                    },
                    attributes: ['quantidade', 'valor_unitario', 'valor_total', 'produto_id']
                },
                {
                    model: Obra,
                    as: 'obra',
                    attributes: ['nome']
                }
            ]
        });

        if (!notaFiscal) {
            return res.status(404).json({ status: false, message: "Nota fiscal não encontrada." });
        }

        const itensFormatados = notaFiscal.itensDaNota ? notaFiscal.itensDaNota.map(item => ({
            produto_nome: item.produto ? item.produto.nome : 'Produto não encontrado',
            produto_id: item.produto_id,
            quantidade: item.quantidade,
            valor_unitario: item.valor_unitario,
            valor_total: item.valor_total
        })) : [];

        const resultado = {
            id: notaFiscal.id,
            numero: notaFiscal.numero,
            data_emissao: notaFiscal.data_emissao, // <<< PONTO CRÍTICO PARA O ERRO ATUAL
            obra_id: notaFiscal.obra_id,
            obra_nome: notaFiscal.obra ? notaFiscal.obra.nome : 'Obra não encontrada',
            itens: itensFormatados,
        };

        return res.json({ status: true, data: resultado });
    } catch (error) {
        console.error("Erro ao buscar nota fiscal por número:", error);
        return res.status(500).json({ status: false, message: "Erro ao buscar nota fiscal.", errorDetails: error.original?.sql || error.sql || error.message });
    }
}

exports.getNotaPorNumero = async (req, res) => {
    try {
        const { numero } = req.params;
        const nota = await NotaFiscal.findOne({
            where: { numero },
            include: [
                { model: Obra, as: 'obra', attributes: ['nome'] },
                {
                    model: ItemNotaFiscal,
                    as: 'itens', // PADRÃO: Usando 'itens' como alias.
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
                as: 'obra', // CONFIRME: este é o alias no seu model NotaFiscal
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

exports.getNotaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const nota = await NotaFiscal.findByPk(id, {
            include: [
                { model: Obra, as: 'obra', attributes: ['nome'] },
                {
                    model: ItemNotaFiscal,
                    as: 'itens', // PADRÃO: Usando 'itens' como alias. Verifique seu model!
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


async function deleteInvoice(req, res) {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ status: false, message: "ID da nota fiscal não fornecido." });
    }

    try {
        const notaFiscal = await NotaFiscal.findByPk(id);

        if (!notaFiscal) {
            return res.status(404).json({ status: false, message: "Nota fiscal não encontrada." });
        }

        // 1. Deleta os itens associados PRIMEIRO (Solução robusta)
        await ItemNotaFiscal.destroy({
            where: {
                nota_fiscal_id: id
            }
        });

        // 2. AGORA deleta a nota fiscal
        await notaFiscal.destroy();

        return res.status(200).json({
            status: true,
            message: `Nota fiscal nº ${notaFiscal.numero} foi excluída com sucesso.`
        });

    } catch (error) {
        console.error("Erro ao excluir nota fiscal:", error);
        return res.status(500).json({ status: false, message: "Erro interno ao excluir a nota fiscal." });
    }
}


// ==========================================================
// PONTO CRÍTICO: VERIFIQUE SEU MODULE.EXPORTS
// ==========================================================
module.exports = {
    addInvoice,
    getMonthlyInvoices,
    getInvoiceByNumber,
    getInvoicesByDateRange,
    deleteInvoice // A função PRECISA estar aqui para ser exportada.
};