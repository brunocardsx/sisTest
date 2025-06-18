// Dentro de Backend/controllers/obraController.js

const { Obra } = require('../models'); // Verifique esta linha com atenção

exports.getAllObras = async (req, res) => {
    console.log("-> Recebida requisição em GET /api/obras"); // <-- Adicione este espião

    try {
        const obras = await Obra.findAll();
        console.log(`-> Obras encontradas: ${obras.length}`); // <-- Adicione este também
        res.status(200).json({ status: true, obras: obras });
    } catch (error) {
        console.error("!!! ERRO CRÍTICO em getAllObras:", error); // <-- Adicione este
        res.status(500).json({ status: false, message: "Erro interno ao processar a requisição." });
    }
};

// ... resto do seu controller