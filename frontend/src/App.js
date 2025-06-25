// src/App.js
import React, { useState } from 'react';
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";

// Importe suas páginas
import Login from './login/Login';
import Dashboard from './dashboard/Dashboard';
import Product from './product/Product';
import SelectAction from './sale/SelectAction';
import Sale from "./sale/Sale";
import Receive from "./sale/Receive";
import Stock from './stock/Stock';
import NotaFiscal from './nota-fiscal/NotaFiscal';
import CadastroObra from "./obras/CadastroObra";
import Error404 from "./not-found-page/Error404";

// Importe os componentes de layout e autenticação
import Menu from './menu/Menu';
import Header from './components/Header'; // <-- Importe o novo Header
import RequireAuth from "./services/PrivateRoutes";

// ==============================================================================
// O MainLayout agora controla o estado do menu e renderiza o Header
// ==============================================================================
const MainLayout = () => {
    // 1. Adiciona o estado para controlar se o menu está aberto ou fechado
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 2. Função para alternar o estado do menu (será passada para o botão no Header)
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // 3. Função para fechar o menu (será passada para o Menu e seu overlay)
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <div className="app-layout">
            {/* O Menu agora recebe as props para ser controlado */}
            <Menu isOpen={isMenuOpen} closeMenu={closeMenu} />

            <div className="main-content-area">
                {/* O Header é adicionado aqui e recebe a função para abrir o menu */}
                <Header toggleMenu={toggleMenu} />

                <main className="content-container">
                    {/* O Outlet renderiza a página da rota atual (Dashboard, Produto, etc.) */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};


function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rotas públicas que não usam o MainLayout */}
                <Route path="/login" element={<Login />}/>
                <Route path="/" element={<Login />}/>

                {/* Rotas protegidas que usam o MainLayout com o menu */}
                <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/obras" element={<CadastroObra />} />
                    <Route path="/produto" element={<Product />} />
                    <Route path="/select-action" exact element={<SelectAction />} />
                    <Route path="/select-action/venda" element={<Sale />} />
                    <Route path="/select-action/receber" element={<Receive />} />
                    <Route path="/notaFiscal" element={<NotaFiscal />} />
                    <Route path="/estoque" element={<Stock />} />

                    {/* Rota "catch-all" para páginas não encontradas DENTRO da área logada */}
                    <Route path="*" element={<Error404 />}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;