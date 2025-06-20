import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './menu.css'; // O novo CSS será importado aqui

// Para deixar o código mais limpo, definimos os itens do menu em arrays
const primaryMenuItems = [
  { path: '/dashboard', icon: 'fas fa-home', label: 'Início' },
  { path: '/select-action', icon: 'fas fa-hand-holding-dollar', label: 'Receber / Vender' },
  { path: '/cliente', icon: 'fas fa-users', label: 'Cliente' },
  { path: '/produto', icon: 'fas fa-store', label: 'Produto' },
  { path: '/estoque', icon: 'fas fa-boxes-stacked', label: 'Estoque' },
  { path: '/contas', icon: 'fas fa-receipt', label: 'Contas' },
];

const secondaryMenuItems = [
  { path: '/configuracoes', icon: 'fas fa-cog', label: 'Configurações' },
  { path: '/login', icon: 'fas fa-sign-out-alt', label: 'Sair' },
];

export default function Menu() {
  const location = useLocation();

  // A lógica para esconder o menu na página de login não é mais necessária,
  // pois o App.js já cuida disso ao não renderizar o MainLayout na rota de login.
  // Mas, caso precise, ela estaria aqui.

  function isActive(path) {
    // Faz a verificação para a rota raiz e outras
    return location.pathname === path ? 'active' : '';
  }

  return (
      // Removido o ternário, pois o App.js já controla a exibição do Menu.
      <aside className="menu-container">
        <div className="logo-container">
          <Link to="/dashboard">
            <img src={require("../images/LOGO.png").default} alt="Logo do Sistema" />
          </Link>
        </div>

        <nav className="menu-nav">
          {primaryMenuItems.map(item => (
              <Link to={item.path} className="menu-item-link" key={item.label}>
                <div className={`menu-item ${isActive(item.path)}`}>
                  <i className={item.icon}></i>
                  <span className="menu-item-text">{item.label}</span>
                </div>
              </Link>
          ))}
        </nav>

        {/* Este elemento flexível empurra o próximo nav para o final */}
        <div className="menu-spacer"></div>

        <nav className="menu-nav">
          {secondaryMenuItems.map(item => (
              <Link to={item.path} className="menu-item-link" key={item.label}>
                <div className={`menu-item ${isActive(item.path)}`}>
                  <i className={item.icon}></i>
                  <span className="menu-item-text">{item.label}</span>
                </div>
              </Link>
          ))}
        </nav>
      </aside>
  );
}