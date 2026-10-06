import React from 'react';
import ListagemMarcas from "./views/listagem-marcas"
import ListagemModelo from "./views/listagem-modelo"
import ListagemCor from "./views/listagem-cor"
import ListagemCategoriaveiculo from "./views/listagem-categoria-veiculo"
import ListagemUsuario from "./views/listagem-usuario"
import ListagemCliente from "./views/listagem-cliente"
import ListagemVeiculo from "./views/listagem-veiculo"
import ListagemLavajato from "./views/listagem-lavajato"
import ListagemHorarioFuncionamento from "./views/listagem-horario-funcionamento"
import ListagemIntervaloAlmoco from "./views/listagem-intervalo-almoço"
import ListagemTipoFeriado from "./views/listagem-tipo-feriado"
import ListagemFeriado from "./views/listagem-feriado"
import ListagemNotificacao from "./views/listagem-notificacao"
import ListagemServico from "./views/listagem-servico"
import ListagemTempo from "./views/listagem-tempo"
import ListagemPagamento from "./views/listagem-pagamento"
import ListagemLotePonto from "./views/listagem-lote-ponto"
import ListagemBloqueio from "./views/listagem-bloqueio"
import ListagemAgendamento from "./views/listagem-agendamento"
import ListagemFuncionario from "./views/listagem-funcionario"
import { Route, Routes, BrowserRouter } from 'react-router-dom';

function Rotas(props) {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/listagem-marca/:idParam?'
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
      </Routes>
    </BrowserRouter>
  );
}

export default Rotas;