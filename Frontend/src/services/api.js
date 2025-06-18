import axios from 'axios';

const api = axios.create({
  baseURL: '/', // Aponta para a raiz do próprio site
  withCredentials: true,
});

export default api;