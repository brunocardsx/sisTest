exports.createSale = (req, res) => {
    const { allPurchases, totalPrice, pendingValue, discount } = req.body;

    if (!allPurchases || totalPrice == null) {
        return res.status(400).json({ message: "Dados incompletos para registrar a venda." });
    }

    // Simulação de salvamento
    console.log("Venda registrada:", { allPurchases, totalPrice, pendingValue, discount });

    return res.status(201).json({ message: "Venda criada com sucesso!" });
};