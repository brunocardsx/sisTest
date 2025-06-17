import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import Login from './login/Login';
import Dashboard from './dashboard/Dashboard';
import Product from './product/Product';
import SelectAction from './sale/SelectAction';
import Sale from "./sale/Sale";
import Receive from "./sale/Receive";
import Menu from './menu/Menu';
import Stock from './stock/Stock';
import RequireAuth from "./services/PrivateRoutes";
import Error404 from "./not-found-page/Error404";
import NotaFiscal from './nota-fiscal/NotaFiscal';
import CadastroObra from "./obras/CadastroObra";

// ======================= MUDANÇA 1: CRIANDO O COMPONENTE DE LAYOUT =======================
// Este componente define a estrutura visual das páginas que terão o menu lateral.
// O <Outlet /> é um placeholder do React Router que renderizará o componente da rota filha.
const MainLayout = () => {
  return (
      // Esta é a estrutura que o CSS com Flexbox espera
      <div className="app-layout">
        <Menu />
        <main className="main-content-area">
          <Outlet /> {/* As rotas (Dashboard, Obras, etc.) serão renderizadas aqui */}
        </main>
      </div>
  );
};
// =======================================================================================


function App() {
  return (
      <BrowserRouter>
        {/* O container foi removido daqui e colocado dentro do MainLayout */}
        <Routes>
          {/* ROTA PÚBLICA: A página de login fica fora do layout principal para não ter o menu */}
          <Route path="/login" element={<Login />}/>
          <Route path="/" element={<Login />}/> {/* Rota raiz também leva para o login */}

          {/* ======================= MUDANÇA 2: AGRUPANDO ROTAS PROTEGIDAS ======================= */}
          {/* Usamos uma rota "pai" para aplicar o layout e a autenticação a todas as rotas filhas de uma só vez.
              Isso é muito mais limpo do que colocar <RequireAuth> em cada rota individualmente. */}
          <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/obras" element={<CadastroObra />} />
            <Route path="/produto" element={<Product />} />
            <Route path="/select-action" exact element={<SelectAction />} />
            <Route path="/select-action/venda" element={<Sale />} />
            <Route path="/select-action/receber" element={<Receive />} />
            <Route path="/notaFiscal" element={<NotaFiscal />} />
            <Route path="/estoque" element={<Stock />} />

            {/* A rota "catch-all" para 404 também deve estar dentro do layout protegido */}
            <Route path="*" element={<Error404 />}/>
          </Route>
          {/* ======================================================================================= */}
        </Routes>
      </BrowserRouter>
  );
}

export default App;