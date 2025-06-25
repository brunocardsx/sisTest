// src/components/Menu.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './menu.css';

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

// O menu agora recebe props para controlar seu estado
export default function Menu({ isOpen, closeMenu }) {
    const location = useLocation();

    function isActive(path) {
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