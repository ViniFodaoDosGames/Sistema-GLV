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
import ListagemPagamento from "./views/listagens/listagem-pagamento"
import ListagemLotePonto from "./views/listagens/listagem-lote-ponto"
import ListagemBloqueio from "./views/listagens/listagem-bloqueio"
import ListagemAgendamento from "./views/listagens/listagem-agendamento"
import ListagemFuncionario from "./views/listagens/listagem-funcionario"


import CadastroMarca from './views/cadastros/cadastro-marca';
import CadastroCor from './views/cadastros/cadastro-cor';
import CadastroCategoriaVeiculo from './views/cadastros/cadastro-categoria-veiculo';
import CadastroTipoFeriado from './views/cadastros/cadastro-tipo-feriado';
import CadastroModelo from './views/cadastros/cadastro-modelo';
import CadastroVeiculo from './views/cadastros/cadastro-veiculo';
import CadastroFeriado from './views/cadastros/cadastro-feriado';
import CadastroServico from './views/cadastros/cadastro-servico';
import CadastroBloqueio from './views/cadastros/cadastro-bloqueio';
import CadastroLavaJato from './views/cadastros/cadastro-lava-jato';
import CadastroHorarioFuncionamento from './views/cadastros/cadastro-horario-funcionamento';
import CadastroIntervaloAlmoco from './views/cadastros/cadastro-intervalo-almoco';
import CadastroUsuario from './views/cadastros/cadastro-usuario';
import CadastroCliente from './views/cadastros/cadastro-cliente';
import CadastroFuncionario from './views/cadastros/cadastro-funcionario';
import CadastroAdministrador from './views/cadastros/cadastro-administrador';
import CadastroAgendamento from './views/cadastros/cadastro-agendamento';
import CadastroPagamento from './views/cadastros/cadastro-pagamento';
import CadastroLotePonto from './views/cadastros/cadastro-lote-ponto';
import CadastroNotificacao from './views/cadastros/cadastro-notificacao';


import { Route, Routes, BrowserRouter } from 'react-router-dom';

function Rotas(props) {
  return (
    <BrowserRouter>
      <Routes>
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
        <Route
          path='/cadastro-cor/:idParam?'
          element={<CadastroCor />}
        />
        <Route
          path='/cadastro-categoria-veiculo/:idParam?'
          element={<CadastroCategoriaVeiculo />}
        />
        <Route
          path='/cadastro-tipo-feriado/:idParam?'
          element={<CadastroTipoFeriado />}
        />
        <Route
          path='/cadastro-modelo/:idParam?'
          element={<CadastroModelo />}
        />
        <Route
          path='/cadastro-veiculo/:idParam?'
          element={<CadastroVeiculo />}
        />
        <Route
          path='/cadastro-feriado/:idParam?'
          element={<CadastroFeriado />}
        />
        <Route
          path='/cadastro-servico/:idParam?'
          element={<CadastroServico />}
        />
        <Route
          path='/cadastro-bloqueio/:idParam?'
          element={<CadastroBloqueio />}
        />
        <Route
          path='/cadastro-lava-jato/:idParam?'
          element={<CadastroLavaJato />}
        />
        <Route
          path='/cadastro-horario-funcionamento/:idParam?'
          element={<CadastroHorarioFuncionamento />}
        />
        <Route
          path='/cadastro-intervalo-almoco/:idParam?'
          element={<CadastroIntervaloAlmoco />}
        />
        <Route
          path='/cadastro-usuario/:idParam?'
          element={<CadastroUsuario />}
        />
        <Route
          path='/cadastro-cliente/:idParam?'
          element={<CadastroCliente />}
        />
        <Route
          path='/cadastro-funcionario/:idParam?'
          element={<CadastroFuncionario />}
        />
        <Route
          path='/cadastro-administrador/:idParam?'
          element={<CadastroAdministrador />}
        />
        <Route
          path='/cadastro-agendamento/:idParam?'
          element={<CadastroAgendamento />}
        />
        <Route
          path='/cadastro-pagamento/:idParam?'
          element={<CadastroPagamento />}
        />
        <Route
          path='/cadastro-lote-ponto/:idParam?'
          element={<CadastroLotePonto />}
        />
        <Route
          path='/cadastro-notificacao/:idParam?'
          element={<CadastroNotificacao />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default Rotas;