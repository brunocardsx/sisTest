import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import './login.css';

// Ícone de Telefone em SVG para o botão de atendimento
const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '18px', height: '18px', marginRight: '8px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.211-.998-.554-1.35l-3.956-4.448a2.25 2.25 0 00-3.163.028l-1.87 1.87a11.25 11.25 0 01-5.27-5.27l1.87-1.87a2.25 2.25 0 00.028-3.163L6.45 3.304a2.25 2.25 0 00-1.35-.554H3.75A2.25 2.25 0 001.5 5.25v1.5Z" />
    </svg>
);


export default function Login() {
  const navigate = useNavigate();

  function handleLogin(event) {
    event.preventDefault();
    const passwordValue = document.querySelector("#password").value;

    if (passwordValue !== "123") {
      alert("Senha incorreta!");
    } else {
      localStorage.setItem("login_token", "123");
      navigate("/dashboard");
    }
  }

  React.useEffect(() => {
    if (localStorage.getItem("login_token")) {
      localStorage.removeItem("login_token");
    }
  }, []);

  return (
      <div className="login-page">
        <div className="login-panel">

          {/* Coluna da Esquerda: Formulário de Login */}
          <div className="login-form-container">
            <div className="form-box">
              <div className="logo">
                <div className="logo-main">GN EMPREENDIMENTOS</div>
                <div className="logo-sub">IMÓVEIS</div>
              </div>

              <h2>Acesse o <strong>PORTAL DE GESTÃO</strong></h2>

              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <label htmlFor="user">USUÁRIO</label>
                  <input
                      type="text"
                      id="user"
                      placeholder="Digite o seu usuário"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="password">SENHA</label>
                  <input
                      type="password"
                      id="password"
                      placeholder="Digite sua senha"
                  />
                </div>

                <div className="form-options">
                  <div className="keep-connected">
                    <input type="checkbox" id="keep-connected-checkbox" />
                    <label htmlFor="keep-connected-checkbox">Manter Conectado</label>
                  </div>
                  <a href="#" className="forgot-password">Recuperar Senha</a>
                </div>

                <button type="submit">ENTRAR</button>
              </form>
            </div>
          </div>

          {/* Coluna da Direita: Painel Escuro */}
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