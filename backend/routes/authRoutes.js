// routes/authRoutes.js

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Pega as credenciais e o segredo do JWT das variáveis de ambiente
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
    }

    // Valida as credenciais do administrador
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        // Gera o token JWT se as credenciais estiverem corretas
        const payload = { user: username, role: 'admin' };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' }); // Token válido por 8 horas

        return res.status(200).json({ message: 'Login bem-sucedido!', token: token });
    } else {
        // Retorna erro se as credenciais forem inválidas
        return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
});

module.exports = router;