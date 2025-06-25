// controllers/notaFiscalController.js
const { NotaFiscal, ItemNotaFiscal, Produto, Obra, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * 1. ADICIONA UMA NOVA NOTA FISCAL
 */
exports.addInvoice = async (req, res) => {
    // ... (seu código original para esta função, que já está bom)
};

/**
 * 2. BUSCA TOTAIS MENSAIS PARA OS GRÁFICOS DO DASHBOARD (LÓGICA RESTAURADA)
 */
exports.getMonthlyInvoices = async (req, res) => {
    const { obraId } = req.params;
    try {
        const notas = await NotaFiscal.findAll({
            where: { obra_id: obraId },
            include: {
                model: ItemNotaFiscal,
                as: 'itensDaNota', // USANDO SEU ALIAS ORIGINAL
                attributes: ['valor_total']
            },
            order: [['data_emissao', 'ASC']]
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

            if (!totaisPorMes[nomeMes]) { totaisPorMes[nomeMes] = 0; }
            totaisPorMes[nomeMes] += totalNota;
        }

        const resultado = Object.entries(totaisPorMes).map(([mesFormatado, total]) => ({
            mes: mesFormatado,
            total_compras: total
        }));

        return res.json({ status: true, data: resultado });
    } catch (error) {
        console.error(`Erro ao buscar notas mensais para obra ${obraId}:`, error);
        return res.status(500).json({ status: false, message: "Erro ao buscar notas mensais." });
    }
};

/**
 * 3. BUSCA NOTAS POR PERÍODO (OTIMIZADO)
 */
exports.getInvoicesByDateRange = async (req, res) => {
    const { data_inicio, data_fim } = req.query;
    if (!data_inicio || !data_fim) {
        return res.status(400).json({ status: false, message: "As datas são obrigatórias." });
    }
    try {
        const notasFiscais = await NotaFiscal.findAll({
            where: { data_emissao: { [Op.between]: [`${data_inicio}T00:00:00Z`, `${data_fim}T23:59:59Z`] } },
            include: [{ model: Obra, as: 'obra', attributes: ['nome'] }],
            attributes: [
                'id', 'numero', 'data_emissao',
                [sequelize.literal('(SELECT SUM(valor_total) FROM itens_nota_fiscal WHERE nota_fiscal_id = "NotaFiscal"."id")'), 'valor_total_nota']
            ],
            order: [['data_emissao', 'DESC']]
        });
        const resultado = notasFiscais.map(nf => ({ ...nf.toJSON(), obra_nome: nf.obra ? nf.obra.nome : 'N/A' }));
        res.json({ status: true, data: resultado });
    } catch (error) {
        console.error("Erro ao buscar notas por data:", error);
        res.status(500).json({ status: false, message: "Erro ao buscar notas fiscais por data." });
    }
};

/**
 * 4. BUSCA UMA NOTA POR ID (PARA EXPANDIR DETALHES)
 */
exports.getNotaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const nota = await NotaFiscal.findByPk(id, {
            include: [
                { model: Obra, as: 'obra', attributes: ['nome'] },
                {
                    model: ItemNotaFiscal,
                    as: 'itens', // <<< CORRESPONDE AO MODEL AGORA
                    include: [{
                        model: Produto,
                        as: 'produto', // <<< Este vem do ItemNotaFiscal.js Model e está correto
                        attributes: ['nome']
                    }]
                }
            ]
        });
        
        if (!nota) return res.status(404).json({ status: false, message: 'Nota fiscal não encontrada.' });
        const notaFormatada = { ...nota.toJSON(), obra_nome: nota.obra ? nota.obra.nome : 'N/A', itens: nota.itensDaNota || [] };
        res.status(200).json({ status: true, data: notaFormatada });
    } catch (error) {
        console.error('Erro ao buscar nota por ID:', error);
        res.status(500).json({ status: false, message: 'Erro interno do servidor.' });
    }
};

/**
 * 5. BUSCA UMA NOTA POR NÚMERO
 */
exports.getNotaPorNumero = async (req, res) => {
    const { numeroNota } = req.params;
    try {
        const nota = await NotaFiscal.findOne({
            where: { numero: numeroNota },
            include: [
                { model: Obra, as: 'obra', attributes: ['nome'] },
                {
                    model: ItemNotaFiscal,
                    as: 'itensDaNota', // USANDO SEU ALIAS ORIGINAL
                    include: [{ model: Produto, as: 'produto', attributes: ['nome'] }]
                }
            ]
        });
        if (!nota) return res.status(404).json({ status: false, message: 'Nota fiscal não encontrada.' });
        const notaFormatada = { ...nota.toJSON(), obra_nome: nota.obra ? nota.obra.nome : 'N/A', itens: nota.itensDaNota || [] };
        res.status(200).json({ status: true, data: notaFormatada });
    } catch (error) {
        console.error('Erro ao buscar nota por número:', error);
        res.status(500).json({ status: false, message: 'Erro ao buscar nota fiscal.' });
    }
};

/**
 * 6. DELETA UMA NOTA
 */
exports.deleteNota = async (req, res) => {
    const { id } = req.params;
    try {
        await ItemNotaFiscal.destroy({ where: { nota_fiscal_id: id } });
        const deletedCount = await NotaFiscal.destroy({ where: { id } });
        if (deletedCount === 0) return res.status(404).json({ status: false, message: "Nota não encontrada." });
        res.status(200).json({ status: true, message: `Nota fiscal excluída.` });
    } catch (error) {
        console.error("Erro ao excluir nota fiscal:", error);
        res.status(500).json({ status: false, message: "Erro interno ao excluir nota." });
    }
};