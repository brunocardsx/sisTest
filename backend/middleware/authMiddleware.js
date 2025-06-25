// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];

    // Verifica se o header de autorização existe e está no formato 'Bearer TOKEN'
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acesso não autorizado. Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    // Verifica se o token é válido
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            // Se o token for inválido ou expirado, retorna erro de "proibido"
            return res.status(403).json({ message: 'Token inválido ou expirado.' });
        }

        // Se o token for válido, anexa os dados do usuário na requisição e continua
        req.user = decoded;
        next();
    });
}

module.exports = authMiddleware;