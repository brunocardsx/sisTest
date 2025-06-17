import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './menu.css'

export default function Menu () {
  const location = useLocation()
  const [allowMenu, setAllowMenu] = useState(false)

  useEffect(() => {
    // Não exibe o menu na tela de login
    if (location.pathname.indexOf("login") !== -1) {
      setAllowMenu(false)
    } else {
      setAllowMenu(true)
    }
  }, [location])

  // Função para determinar se a rota está ativa
  function isActive(path) {
    return location.pathname === path ? 'active' : ''
  }

  return (
      allowMenu ?
          <div className="menu-container">
            <div className="menu-content">
              <div className="text-center logo-container mt-4">
                <Link to={"/dashboard"}>
                  <img src={`${require("../images/LOGO.png").default}`} width="65%" alt="Logo" />
                </Link>
              </div>

              <Link className="no-href-decoration" to="/dashboard">
                <div className={`option-menu ${isActive('/dashboard')}`} id="dashboard">
                  <i className="fas fa-house"></i> Inicio
                </div>
              </Link>

              <Link className="no-href-decoration" to="/select-action">
                <div className={`option-menu ${isActive('/select-action')}`} id="venda">
                  <i className="fas fa-hand-holding-usd"></i> Receber / Vender
                </div>
              </Link>

              <Link className="no-href-decoration" to="/cliente">
                <div className={`option-menu ${isActive('/cliente')}`} id="cliente">
                  <i className="fas fa-users"></i> Cliente
                </div>
              </Link>

              <Link className="no-href-decoration" to="/produto">
                <div className={`option-menu ${isActive('/produto')}`} id="produto">
                  <i className="fas fa-store"></i> Produto
                </div>
              </Link>

              <Link className="no-href-decoration" to="/contas">
                <div className={`option-menu ${isActive('/contas')}`} id="contas">
                  <i className="fas fa-minus-circle"></i> Contas
                </div>
              </Link>

              <Link className="no-href-decoration" to="/estoque">
                <div className={`option-menu ${isActive('/estoque')}`} id="estoque">
                  <i className="fas fa-boxes"></i> Estoque
                </div>
              </Link>

              <Link className="no-href-decoration" to="/login">
                <div className="option-menu">
                  <i className="fas fa-sign-out-alt"></i> Sair
                </div>
              </Link>
            </div>
          </div>

          : <></>
  )
}
