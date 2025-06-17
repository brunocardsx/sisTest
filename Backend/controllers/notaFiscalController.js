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


// NOVA FUNÇÃO: Buscar notas fiscais por intervalo de datas
async function getInvoicesByDateRange(req, res) {
    const { data_inicio, data_fim } = req.query;

    if (!data_inicio || !data_fim) {
        return res.status(400).json({ status: false, message: "As datas de início e fim são obrigatórias." });
    }

    try {
        const inicio = new Date(`${data_inicio}T00:00:00.000Z`);
        const fim = new Date(`${data_fim}T23:59:59.999Z`);

        if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
            return res.status(400).json({ status: false, message: "Formato de data inválido. Use YYYY-MM-DD." });
        }
        if (inicio > fim) {
            return res.status(400).json({ status: false, message: "A data de início não pode ser posterior à data de fim." });
        }

        const notasFiscais = await NotaFiscal.findAll({
            where: {
                data_emissao: {
                    [Op.between]: [inicio, fim]
                }
            },
            include: [
                {
                    model: Obra,
                    as: 'obra',
                    attributes: ['nome']
                },
                { // INCLUIR ITENS E PRODUTOS ASSOCIADOS
                    model: ItemNotaFiscal,
                    as: 'itensDaNota', // Lembre-se de usar o alias correto
                    attributes: ['quantidade', 'valor_unitario', 'valor_total'], // Campos que você quer dos itens
                    include: {
                        model: Produto,
                        as: 'produto', // Lembre-se de usar o alias correto
                        attributes: ['nome'] // Pegar o nome do produto
                    }
                }
            ],
            order: [['data_emissao', 'DESC'], ['numero', 'ASC']]
        });

        if (!notasFiscais || notasFiscais.length === 0) {
            return res.status(404).json({ status: false, message: "Nenhuma nota fiscal encontrada para o período selecionado." });
        }

        // Mapear o resultado para incluir valor total da nota e formatar os itens
        const resultado = notasFiscais.map(nf => {
            let valorTotalDaNota = 0;
            const itensFormatados = nf.itensDaNota ? nf.itensDaNota.map(item => {
                valorTotalDaNota += parseFloat(item.valor_total || 0);
                return {
                    produto_nome: item.produto ? item.produto.nome : 'Produto Desconhecido',
                    quantidade: item.quantidade,
                    valor_unitario: parseFloat(item.valor_unitario || 0),
                    valor_total_item: parseFloat(item.valor_total || 0)
                };
            }) : [];

            return {
                id: nf.id,
                numero: nf.numero,
                data_emissao: nf.data_emissao,
                obra_nome: nf.obra ? nf.obra.nome : 'Obra não informada',
                valor_total_nota: valorTotalDaNota, // Adicionando o valor total da nota
                itens: itensFormatados // Adicionando os itens formatados
            };
        });

        res.json({ status: true, data: resultado });

    } catch (error) {
        console.error("Erro ao buscar notas fiscais por data:", error);
        res.status(500).json({ status: false, message: "Erro ao buscar notas fiscais por data." });
    }
}

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