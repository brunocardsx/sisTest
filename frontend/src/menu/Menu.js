// src/components/Menu.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './menu.css';


const primaryMenuItems = [
    { path: '/dashboard', icon: 'fas fa-home', label: 'Início' },
    { path: '/notaFiscal', icon: 'fas fa-file-invoice-dollar', label: 'Cadastrar Nota' },
    { path: '/select-action/venda', icon: 'fas fa-search', label: 'Consultar Nota' },
    { path: '/obras', icon: 'fas fa-building-columns', label: 'Obras' },
];

const secondaryMenuItems = [
    { path: '/configuracoes', icon: 'fas fa-cog', label: 'Configurações' },
    { path: '/login', icon: 'fas fa-sign-out-alt', label: 'Sair' },
];

// O menu agora recebe props para controlar seu estado
export default function Menu({ isOpen, closeMenu }) {
    const location = useLocation();

    function isActive(path) {
        // Uma pequena melhoria: destaca o link de nota fiscal se estiver na página
        if (path === '/notaFiscal' && location.pathname.includes('/notaFiscal')) {
            return 'active';
        }
        return location.pathname === path ? 'active' : '';
    }

    return (
        <>
            {/* Overlay que aparece no mobile para fechar o menu ao clicar fora */}
            <div
                className={`menu-overlay ${isOpen ? 'show' : ''}`}
                onClick={closeMenu}
            ></div>

            {/* A classe 'open' será adicionada dinamicamente */}
            <aside className={`menu-container ${isOpen ? 'open' : ''}`}>
                <div className="logo-container">
                    <Link to="/dashboard" onClick={closeMenu}>
                        {/* Recomendo usar o caminho da pasta public para a logo */}
                        <img src={require("../images/logo.png").default} alt="Logo do Sistema" />
                    </Link>
                </div>

                <nav className="menu-nav">
                    {primaryMenuItems.map(item => (
                        // Adicionado onClick={closeMenu} para fechar o menu ao navegar
                        <Link to={item.path} className="menu-item-link" key={item.label} onClick={closeMenu}>
                            <div className={`menu-item ${isActive(item.path)}`}>
                                <i className={item.icon}></i>
                                <span className="menu-item-text">{item.label}</span>
                            </div>
                        </Link>
                    ))}
                </nav>

                <div className="menu-spacer"></div>

                <nav className="menu-nav">
                    {secondaryMenuItems.map(item => (
                        <Link to={item.path} className="menu-item-link" key={item.label} onClick={closeMenu}>
                            <div className={`menu-item ${isActive(item.path)}`}>
                                <i className={item.icon}></i>
                                <span className="menu-item-text">{item.label}</span>
                            </div>
                        </Link>
                    ))}
                </nav>
            </aside>
        </>
    );
}