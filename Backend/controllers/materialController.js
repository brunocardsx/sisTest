const sequelize = require('../database/database');

async function createMaterial(req, res) {
    const { formState } = req.body;
    try {
        const queryMaterial = `
      INSERT INTO materiais_construcao (nome, unidade_medida, descricao)
      VALUES (
                 '${formState.name}',
                 '${formState.unidade_medida}',
                 '${formState.descricao}'
             )
    `;
        await sequelize.query(queryMaterial);
        console.log("Material criado com sucesso!");
        return res.json({ status: true });
    } catch (error) {
        console.log("Erro ao criar material de construção:", error);
        return res.json({ status: false });
    }
}

async function getMaterials(req, res) {
    try {
        const [result] = await sequelize.query(`SELECT * FROM materiais_construcao`);
        console.log("Materiais encontrados:", result);
        return res.json({ status: true, materiais: result });
    } catch (error) {
        console.error("Erro ao buscar materiais:", error);
        return res.status(500).json({ status: false, message: "Erro ao buscar materiais." });
    }
}

module.exports = { createMaterial, getMaterials };
