// controllers/obraController.js

// Importe NotaFiscal aqui também, se deleteObra for usá-lo
const { Obra, NotaFiscal, Sequelize } = require('../models'); // Adicionei NotaFiscal

// Função para listar todas as obras
async function getAllObras(req, res) { // Mudei de exports.getObras para uma declaração de função
    try {
        const obras = await Obra.findAll({ order: [['nome', 'ASC']] });
        res.status(200).json({ status: true, obras });
    } catch (error) {
        console.error("Erro ao buscar obras:", error);
        res.status(500).json({ status: false, message: 'Erro ao buscar obras.' });
    }
}

// Função para adicionar uma nova obra
async function addObra(req, res) { // Mudei de exports.createObra para uma declaração de função
    const { nome } = req.body;

    if (!nome || nome.trim() === '') {
        return res.status(400).json({ status: false, message: 'O nome da obra é obrigatório.' });
    }

    try {
        const novaObra = await Obra.create({ nome: nome.trim() });
        res.status(201).json({ status: true, obra: novaObra, message: 'Obra cadastrada com sucesso!' });
    } catch (error) {
        // Verifica se o erro é de violação de restrição única (ex: nome duplicado)
        if (error.name === 'SequelizeUniqueConstraintError' || (error.original && error.original.code === '23505')) {
            return res.status(409).json({ status: false, message: 'Já existe uma obra com este nome.' });
        }

        console.error("Erro ao criar obra:", error);
        res.status(500).json({ status: false, message: 'Erro interno no servidor ao criar a obra.' });
    }
}

// Função para EXCLUIR uma obra
async function deleteObra(req, res) {
    const { id } = req.params;
    try {
        const obra = await Obra.findByPk(id);
        if (!obra) {
            return res.status(404).json({ status: false, message: "Obra não encontrada." });
        }

        const notasAssociadas = await NotaFiscal.count({ where: { obra_id: id } });

        if (notasAssociadas > 0) {
            return res.status(400).json({
                status: false,
                message: `Não é possível excluir a obra "${obra.nome}" pois ela possui ${notasAssociadas} nota(s) fiscal(is) associada(s). Remova ou reatribua as notas fiscais primeiro.`
            });
        }

        await obra.destroy();
        res.json({ status: true, message: `Obra "${obra.nome}" excluída com sucesso.` });

    } catch (error) {
        console.error(`Erro ao excluir obra com ID ${id}:`, error);
        res.status(500).json({ status: false, message: "Erro ao excluir obra." });
    }
}

// Exporta todas as funções do controller
module.exports = {
    getAllObras,
    addObra,
    deleteObra
};