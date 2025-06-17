// src/services/api.js

import axios from 'axios';

// 1. O Axios será configurado aqui, uma única vez.
const api = axios.create({
  // 2. Ele lê a variável de ambiente REACT_APP_API_URL.
  //    - Em produção (na Vercel), essa variável terá o valor 'https://seu-backend.onrender.com/api'.
  //    - Em desenvolvimento (na sua máquina), ela não existirá, então ele usará o valor padrão 'http://localhost:8081/api'.
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8081/api',

  // 3. 'withCredentials' é importante para o CORS funcionar corretamente com sessões ou tokens em cookies.
  withCredentials: true,
});

// 4. Exportamos a instância já configurada para ser usada em todo o resto do app.
export default api;