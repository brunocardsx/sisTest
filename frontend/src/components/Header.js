// src/components/Header.js
import React from 'react';
import './header.css'; // Criaremos este CSS a seguir

const Header = ({ toggleMenu }) => {
    return (
        <header className="main-header">
            <button className="menu-toggle-btn" onClick={toggleMenu} aria-label="Abrir menu">
                <i className="fas fa-bars"></i>
            </button>
            {/* Você pode adicionar o título da página aqui no futuro, se quiser */}
            <h1 className="header-title">Sistema de Gestão</h1>
        </header>
    );
};

export default Header;