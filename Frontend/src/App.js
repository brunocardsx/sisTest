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


const MainLayout = () => {
  return (
      <div className="app-layout">
        <Menu />
        <main className="main-content-area">
          <Outlet />
        </main>
      </div>
  );
};


function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />}/>
          <Route path="/" element={<Login />}/> {/* Rota raiz também leva para o login */}


          <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/obras" element={<CadastroObra />} />
            <Route path="/produto" element={<Product />} />
            <Route path="/select-action" exact element={<SelectAction />} />
            <Route path="/select-action/venda" element={<Sale />} />
            <Route path="/select-action/receber" element={<Receive />} />
            <Route path="/notaFiscal" element={<NotaFiscal />} />
            <Route path="/estoque" element={<Stock />} />

            <Route path="*" element={<Error404 />}/>
          </Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;