const { Cliente } = require('../models/Cliente'); // Importando o modelo Cliente

async function createClient(req, res) {
    const { formState } = req.body; // Recebendo os dados do cliente

    try {
        // Verificando se todos os dados necessários estão presentes
        if (!formState.name || !formState.nascimento || !formState.phone) {
            return res.status(400).json({ status: false, message: "Campos obrigatórios estão ausentes." });
        }

        // Verificando se a data de nascimento é válida
        const nascimento = new Date(formState.nascimento);
        if (isNaN(nascimento.getTime())) {
            return res.status(400).json({ status: false, message: "Data de nascimento inválida." });
        }

        // Usando o Sequelize para criar o cliente
        const cliente = await Cliente.create({
            nome: formState.name,
            nascimento: nascimento,  // Verifica se é uma data válida
            telefone: formState.phone,
            bairro: formState.district,
            rua: formState.street,
            cidade: formState.city,
            estado: formState.state
        });

        console.log("Cliente criado com sucesso!");
        return res.json({ status: true, cliente });
    } catch (error) {
        console.log("Erro ao criar cliente:", error);
        if (error.name === 'SequelizeDatabaseError') {
            return res.status(400).json({ status: false, message: `Erro no banco de dados: ${error.message}` });
        }
        return res.status(500).json({ status: false, message: "Erro ao criar cliente." });
    }
}

module.exports = { createClient };
