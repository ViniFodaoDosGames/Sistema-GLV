import React from 'react';
import ListagemAdministrador from "./views/listagens/listagem-administrador"
import ListagemMarcas from "./views/listagens/listagem-marca"
import ListagemModelo from "./views/listagens/listagem-modelo"
import ListagemCor from "./views/listagens/listagem-cor"
import ListagemCategoriaveiculo from "./views/listagens/listagem-categoria-veiculo"
import ListagemUsuario from "./views/listagens/listagem-usuario"
import ListagemCliente from "./views/listagens/listagem-cliente"
import ListagemVeiculo from "./views/listagens/listagem-veiculo"
import ListagemLavajato from "./views/listagens/listagem-lavajato"
import ListagemHorarioFuncionamento from "./views/listagens/listagem-horario-funcionamento"
import ListagemIntervaloAlmoco from "./views/listagens/listagem-intervalo-almoço"
import ListagemTipoFeriado from "./views/listagens/listagem-tipo-feriado"
import ListagemFeriado from "./views/listagens/listagem-feriado"
import ListagemNotificacao from "./views/listagens/listagem-notificacao"
import ListagemServico from "./views/listagens/listagem-servico"
import ListagemTempo from "./views/listagens/listagem-tempo"
import ListagemPagamento from "./views/listagens/listagem-pagamento"
import ListagemLotePonto from "./views/listagens/listagem-lote-ponto"
import ListagemBloqueio from "./views/listagens/listagem-bloqueio"
import ListagemAgendamento from "./views/listagens/listagem-agendamento"
import ListagemFuncionario from "./views/listagens/listagem-funcionario"
import Login from './views/publico/login';
import Configuracoes from './views/configuracoes';
import Pagamento from './views/pagamento';
import { getSession } from './auth';
import rotasMenu from './config/rotasMenu.json';


import CadastroMarca from './views/cadastros/cadastro-marca';


import { Navigate, Outlet, Route, Routes, BrowserRouter, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const session = getSession();
  const location = useLocation();

  if (!session) {
    return <Navigate to='/login' replace />;
  }

  const link = rotasMenu.linksCadastros.find((item) =>
    location.pathname === item.href ||
    location.pathname.startsWith(`${item.href}/`)
  );
  let allowedRoles = link?.role;

  if (!allowedRoles && location.pathname.startsWith('/cadastro-')) {
    allowedRoles = ['ADMINISTRADOR'];
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return <Navigate to='/configuracoes' replace />;
  }

  return children || <Outlet />;
}

function Rotas(props) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route
          path='/configuracoes'
          element={
            <ProtectedRoute>
              <Configuracoes />
            </ProtectedRoute>
          }
        />
        <Route
          path='/pagamento/:idAgendamento'
          element={
            <ProtectedRoute>
              <Pagamento />
            </ProtectedRoute>
          }
        />
        <Route
          path='/pagamento/:tipo/:id'
          element={
            <ProtectedRoute>
              <Pagamento />
            </ProtectedRoute>
          }
        />
        <Route element={<ProtectedRoute />}>
        <Route
          path='/listagem-marcas/:idParam?'
          element={<ListagemMarcas />}
        />
        <Route
          path='/listagem-modelo/:idParam?'
          element={<ListagemModelo />}
        />
        <Route
          path='/listagem-cor/:idParam?'
          element={<ListagemCor />}
        />
        <Route
          path='/listagem-categoria-veiculo/:idParam?'
          element={<ListagemCategoriaveiculo />}
        />
        <Route
          path='/listagem-usuario/:idParam?'
          element={<ListagemUsuario />}
        />
        <Route
          path='/listagem-cliente/:idParam?'
          element={<ListagemCliente />}
        />
        <Route
          path='/listagem-veiculo/:idParam?'
          element={<ListagemVeiculo />}
        />
        <Route
          path='/listagem-feriado/:idParam?'
          element={<ListagemFeriado />}
        />
        <Route
          path='/listagem-tipo-feriado/:idParam?'
          element={<ListagemTipoFeriado />}
        />
        <Route
          path='/listagem-intervalo-almoço/:idParam?'
          element={<ListagemIntervaloAlmoco />}
        />
        <Route
          path='/listagem-horario-funcionamento/:idParam?'
          element={<ListagemHorarioFuncionamento />}
        />
        <Route
          path='/listagem-lavajato/:idParam?'
          element={<ListagemLavajato />}
        />
        {
          //
        }
        <Route
          path='/listagem-funcionario/:idParam?'
          element={<ListagemFuncionario />}
        />
        <Route
          path='/listagem-notificacao/:idParam?'
          element={<ListagemNotificacao />}
        />
        <Route
          path='/listagem-tempo/:idParam?'
          element={<ListagemTempo />}
        />
        <Route
          path='/listagem-servico/:idParam?'
          element={<ListagemServico />}
        />
        <Route
          path='/listagem-pagamento/:idParam?'
          element={<ListagemPagamento />}
        />
        <Route
          path='/listagem-lote-ponto/:idParam?'
          element={<ListagemLotePonto />}
        />
        <Route
          path='/listagem-bloqueio/:idParam?'
          element={<ListagemBloqueio />}
        />
        <Route
          path='/listagem-agendamento/:idParam?'
          element={<ListagemAgendamento />}
        />
        <Route
          path='/listagem-administrador/:idParam?'
          element={<ListagemAdministrador />}
        />


        {/**Rotas de Cadastro**/}
        <Route
          path='/cadastro-marca/:idParam?'
          element={<CadastroMarca />}
        />
        </Route>
        <Route
          path='*'
          element={
            getSession()
              ? <Navigate to='/configuracoes' replace />
              : <Navigate to='/login' replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default Rotas;