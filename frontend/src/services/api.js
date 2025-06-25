import axios from 'axios';

// 1. Cria a instância do Axios com a baseURL
// Esta parte do seu código original já estava correta.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8081'
});

// 2. ADICIONA O INTERCEPTOR DE REQUISIÇÃO (A CORREÇÃO)
// Esta é a mágica. Este bloco de código será executado ANTES de CADA requisição
// que usar esta instância 'api'.
api.interceptors.request.use(
    (config) => {
      // Pega o token que foi salvo no localStorage durante o login
      const token = localStorage.getItem('login_token');

      // Se o token existir, ele é adicionado ao cabeçalho 'Authorization'
      if (token) {
        // O formato `Bearer ${token}` é o padrão esperado pelo seu backend
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Retorna a configuração da requisição (agora com o token, se houver)
      // para que a chamada à API possa continuar normalmente.
      return config;
    },
    (error) => {
      // Se houver um erro na configuração da requisição, ele é rejeitado
      return Promise.reject(error);
    }
);

// 3. Exporta a instância 'api' já configurada
export default api;