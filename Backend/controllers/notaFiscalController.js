const { NotaFiscal, ItemNotaFiscal } = require('../models'); // Importar os modelos

async function addInvoice(req, res) {
    const { numero, obra_id, itens } = req.body;

    // Validação inicial dos dados da nota fiscal
    if (!numero || !obra_id || !itens || itens.length === 0) {
        console.log('Erro: Dados incompletos para salvar a nota fiscal.');
        return res.status(400).json({ status: false, message: "Dados incompletos para salvar a nota fiscal." });
    }

    try {
        console.log('Iniciando a criação da nota fiscal...');
        console.log('Dados recebidos:', { numero, obra_id, itens });  // Log dos dados recebidos

        // Inserção da nota fiscal
        const notaFiscal = await NotaFiscal.create({
            numero,
            obra_id,
            data_emissao: new Date(), // Definir a data de emissão como a data atual
        });

        console.log('Nota fiscal criada com sucesso. ID:', notaFiscal.id);  // Log da criação da nota fiscal

        // Inserção dos itens da nota fiscal
        const itemPromises = itens.map(item => {
            console.log('Verificando item:', item);  // Log do item sendo processado

            // Validação adicional para garantir que os campos não sejam nulos ou inválidos
            if (!item.produto_id || item.quantidade <= 0 || item.valor_unitario <= 0) {
                console.log('Erro: Dados do item incompletos ou inválidos', item);
                throw new Error('Dados do item incompletos ou inválidos');
            }

            return ItemNotaFiscal.create({
                nota_fiscal_id: notaFiscal.id,
                produto_id: item.produto_id, // Certifique-se de que o campo é 'produto_id'
                quantidade: item.quantidade,
                valor_unitario: item.valor_unitario,
                valor_total: item.quantidade * item.valor_unitario, // Calcula o valor total no backend
            });
        });

        // Espera que todos os itens sejam inseridos
        await Promise.all(itemPromises);

        console.log('Itens inseridos com sucesso.');
        return res.json({ status: true, message: "Nota fiscal e itens salvos com sucesso!" });
    } catch (error) {
        console.error("Erro ao salvar nota fiscal:", error);  // Log detalhado do erro
        return res.status(500).json({ status: false, message: error.message || "Erro ao salvar nota fiscal." });
    }
}

module.exports = { addInvoice };
