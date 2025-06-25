import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

// Ícone de Telefone (mantido como estava)
const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '18px', height: '18px', marginRight: '8px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.211-.998-.554-1.35l-3.956-4.448a2.25 2.25 0 00-3.163.028l-1.87 1.87a11.25 11.25 0 01-5.27-5.27l1.87-1.87a2.25 2.25 0 00.028-3.163L6.45 3.304a2.25 2.25 0 00-1.35-.554H3.75A2.25 2.25 0 001.5 5.25v1.5Z" />
    </svg>
);

export default function Login() {
  const navigate = useNavigate();

  // ESTADO para controlar os inputs, erros e loading
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // A função de login AGORA É ASSÍNCRONA para lidar com a API
  async function handleLogin(event) {
    event.preventDefault();
    setIsLoading(true);
    setError(''); // Limpa erros anteriores

    try {
      // FAZ A CHAMADA para o seu backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao tentar fazer login.');
      }

      // SUCESSO! Armazena o TOKEN REAL que veio do backend
      localStorage.setItem('login_token', data.token);
      navigate("/dashboard");

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
      <div className="login-page">
        <div className="login-panel">
          <div className="login-form-container">
            <div className="form-box">
              <div className="logo">
                <div className="logo-main">GN EMPREENDIMENTOS</div>
                <div className="logo-sub">IMÓVEIS</div>
              </div>
              <h2>Acesse o <strong>PORTAL DE GESTÃO</strong></h2>

              {error && <div className="login-error-message">{error}</div>}

              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <label htmlFor="user">USUÁRIO</label>
                  <input
                      type="text"
                      id="user"
                      placeholder="Digite o seu usuário"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="password">SENHA</label>
                  <input
                      type="password"
                      id="password"
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                  />
                </div>
                <div className="form-options">
                  <div className="keep-connected">
                    <input type="checkbox" id="keep-connected-checkbox" />
                    <label htmlFor="keep-connected-checkbox">Manter Conectado</label>
                  </div>
                  <a href="#" className="forgot-password">Recuperar Senha</a>
                </div>
                <button type="submit" disabled={isLoading}>
                  {isLoading ? 'ENTRANDO...' : 'ENTRAR'}
                </button>
              </form>
            </div>
          </div>
          <div className="login-image-container">
            <a href="#" className="support-button">
              <PhoneIcon />
              <span>Central de Atendimento</span>
            </a>
          </div>
        </div>
      </div>
  );
}