const { Obra } = require('../models');

async function createObra(req, res) {
    const { formState } = req.body;

    try {
        const obra = await Obra.create({
            nome: formState.nome,
            descricao: formState.descricao,
            cliente_id: formState.cliente_id,
            data_inicio: formState.data_inicio,
            data_fim: formState.data_fim
        });

        return res.json({ status: true, obra });
    } catch (error) {
        console.error("Erro ao criar obra:", error);
        return res.status(500).json({ status: false, message: "Erro ao criar obra." });
    }
}

async function getObras(req, res) {
    try {
        const obras = await Obra.findAll();

        if (obras.length === 0) {
            return res.json({ status: false, message: "Nenhuma obra cadastrada." });
        }

        return res.json({ status: true, obras });
    } catch (error) {
        console.error("Erro ao buscar obras:", error.message);
        return res.status(500).json({ status: false, message: error.message || "Erro ao buscar obras." });
    }
}

module.exports = { createObra, getObras };
