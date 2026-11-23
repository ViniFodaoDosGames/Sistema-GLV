import React from 'react';

import Card from '../../components/card.js';
import FormGroup from '../../components/form-group';
import Modal from '../../components/modal';

import { mensagemSucesso, mensagemErro } from '../../components/toastr.js';
import { confirmarExclusao } from '../../components/confirmar-exclusao';

import '../../custom.css';

import Stack from '@mui/material/Stack';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import axios from 'axios';
import { BASE_URL } from '../../config/axios.js';
import { agora, STATUS_PAGAMENTO, FORMA_PAGAMENTO, formatarDataHora, formatarMoeda } from '../../config/util';
import { getSession } from '../../auth';
import { nomeFuncionario, pagamentoExpirado, cancelarExpirados } from '../../config/agenda';
const baseURL = `${BASE_URL}/Pagamentos`;


function ListagemPagamento() {
  const session = getSession();
  const ehCliente = session?.role === 'CLIENTE';

  const [dados, setDados] = React.useState([]);
  const [agendamentos, setAgendamentos] = React.useState([]);
  const [equipe, setEquipe] = React.useState({ Funcionarios: [], Usuarios: [] });
  const [estornando, setEstornando] = React.useState(null);
  const [justificativa, setJustificativa] = React.useState('');
  const [recebendo, setRecebendo] = React.useState(null);
  const [formaRecebimento, setFormaRecebimento] = React.useState('PIX');

  const agendamentoDo = (pagamento) => agendamentos.find((item) => item.id === pagamento.idAgendamento);

  function podeReceber(pagamento) {
    const agendamento = agendamentoDo(pagamento);
    return (
      pagamento.status === 'PENDENTE' &&
      agendamento?.status === 'AGUARDANDO_PAGAMENTO' &&
      !pagamentoExpirado(agendamento)
    );
  }

  function podeEstornar(pagamento) {
    const agendamento = agendamentoDo(pagamento);
    return (
      pagamento.status === 'APROVADO' &&
      pagamento.forma !== 'PONTOS' &&
      !['CANCELADO', 'NAO_COMPARECEU'].includes(agendamento?.status)
    );
  }

  async function excluir(id) {
    if (!(await confirmarExclusao('Excluir pagamento'))) return;
    let data = JSON.stringify({ id });
    let url = `${baseURL}/${id}`;
    console.log(url);
    await axios
      .delete(url, data, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then(function (response) {
        mensagemSucesso(`Pagamento excluído com sucesso!`);
        setDados(
          dados.filter((dado) => {
            return dado.id !== id;
          })
        );
      })
      .catch(function (error) {
        mensagemErro(`Erro ao excluir o pagamento`);
      });
  }

  function pedirRecebimento(pagamento) {
    setFormaRecebimento('PIX');
    setRecebendo(pagamento);
  }

  async function confirmarRecebimento() {
    const pagamento = recebendo;
    setRecebendo(null);
    const alteracao = {
      forma: formaRecebimento,
      status: 'APROVADO',
      dataHora: agora(),
      idFuncionario: session.idFuncionario,
    };
    try {
      await axios.patch(`${baseURL}/${pagamento.id}`, alteracao);
      await axios.patch(`${BASE_URL}/Agendamentos/${pagamento.idAgendamento}`, { status: 'CONFIRMADO' });
      mensagemSucesso('Pagamento recebido. Agendamento confirmado.');
      setDados(dados.map((item) => (item.id === pagamento.id ? { ...item, ...alteracao } : item)));
      setAgendamentos(
        agendamentos.map((item) => (item.id === pagamento.idAgendamento ? { ...item, status: 'CONFIRMADO' } : item))
      );
    } catch (erro) {
      mensagemErro('Não foi possível registrar o pagamento');
    }
  }

  function pedirEstorno(pagamento) {
    setJustificativa('');
    setEstornando(pagamento);
  }

  async function confirmarEstorno() {
    const motivo = justificativa.trim();
    if (!motivo) {
      mensagemErro('Informe a justificativa do estorno');
      return;
    }
    const pagamento = estornando;
    setEstornando(null);
    try {
      await axios.patch(`${baseURL}/${pagamento.id}`, { status: 'ESTORNADO', justificativaEstorno: motivo });
      const agendamento = agendamentoDo(pagamento);
      if (agendamento && ['AGUARDANDO_PAGAMENTO', 'CONFIRMADO'].includes(agendamento.status)) {
        await axios.patch(`${BASE_URL}/Agendamentos/${agendamento.id}`, { status: 'CANCELADO' });
      }
      mensagemSucesso('Pagamento estornado.');
      setDados(
        dados.map((item) =>
          item.id === pagamento.id ? { ...item, status: 'ESTORNADO', justificativaEstorno: motivo } : item
        )
      );
    } catch (erro) {
      mensagemErro('Não foi possível estornar o pagamento');
    }
  }

 React.useEffect(() => {
   async function carregar() {
     try {
       const [pagamentos, agendamentosResponse, clientesResponse, funcionariosResponse, usuariosResponse] =
         await Promise.all([
           axios.get(baseURL),
           axios.get(`${BASE_URL}/Agendamentos`),
           axios.get(`${BASE_URL}/Clientes`),
           axios.get(`${BASE_URL}/Funcionarios`),
           axios.get(`${BASE_URL}/Usuarios`),
         ]);
       if (await cancelarExpirados(agendamentosResponse.data, pagamentos.data)) {
         carregar();
         return;
       }
       setEquipe({ Funcionarios: funcionariosResponse.data, Usuarios: usuariosResponse.data });

       let pagamentosFiltrados = pagamentos.data;
       let agendamentosFiltrados = agendamentosResponse.data;

       if (session?.role === 'CLIENTE') {
         const cliente = clientesResponse.data.find(
           (item) => String(item.idUsuario) === String(session.usuario.id)
         );

         if (!cliente) {
           pagamentosFiltrados = [];
           agendamentosFiltrados = [];
         } else {
           const clienteIds = new Set([
             String(cliente.id),
             String(cliente.id).replace('cliente-', ''),
             String(cliente.id).replace(/^cliente-0*/, ''),
           ]);
           agendamentosFiltrados = agendamentosFiltrados.filter((item) =>
             clienteIds.has(String(item.idCliente))
           );
           const ids = new Set(agendamentosFiltrados.map((item) => String(item.id)));
           pagamentosFiltrados = pagamentosFiltrados.filter((item) =>
             ids.has(String(item.idAgendamento))
           );

         }
       }

       setDados(pagamentosFiltrados);
       setAgendamentos(agendamentosFiltrados);
     } catch (error) {
       mensagemErro('Erro ao carregar os pagamentos');
     }
   }

   carregar();
 }, [session?.role, session?.usuario?.id]);

  if (!dados) return null;
  return (
    <div className='container'>
      <Card title='Pagamentos e Pontos'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <table className='table table-hover justify-content-center'>
                <thead>
                  <tr>
                    <th scope='col'>Forma</th>
                    <th scope='col'>Status</th>
                    <th scope='col'>Valor</th>
                    <th scope='col'>Data e Hora</th>
                    <th scope='col'>Código Gateway</th>
                    <th scope='col'>Justificativa do Estorno</th>
                    {!ehCliente && <th scope='col'>Funcionário</th>}
                    {!ehCliente && <th scope='col'>Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {dados.map((dado) => (
                    <tr key={dado.id}>
                      <td className='justify-content-center'>{FORMA_PAGAMENTO[dado.forma] || dado.forma}</td>
                      <td className='justify-content-center'>{STATUS_PAGAMENTO[dado.status] || dado.status}</td>
                      <td className='justify-content-center'>{formatarMoeda(dado.valor)}</td>
                      <td className='justify-content-center'>{formatarDataHora(dado.dataHora)}</td>
                      <td className='justify-content-center'>{dado.codigoGateway}</td>
                      <td className='justify-content-center'>{dado.justificativaEstorno}</td>
                      {!ehCliente && <td className='justify-content-center'>{nomeFuncionario(dado.idFuncionario, equipe)}</td>}
                      {!ehCliente && (
                        <td>
                          <Stack spacing={1} padding={0} direction='row' >
                            {podeReceber(dado) && (
                              <button
                                type='button'
                                className='btn btn-success btn-sm'
                                onClick={() => pedirRecebimento(dado)}
                              >
                                Receber
                              </button>
                            )}
                            {podeEstornar(dado) && (
                              <button
                                type='button'
                                className='btn btn-warning btn-sm'
                                onClick={() => pedirEstorno(dado)}
                              >
                                Estornar
                              </button>
                            )}
                            {dado.status === 'PENDENTE' && (
                              <IconButton
                                aria-label='delete'
                                onClick={() => excluir(dado.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Stack>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>{' '}
            </div>
          </div>
        </div>
      </Card>

      <Modal
        aberto={recebendo != null}
        titulo='Receber pagamento no balcão'
        onFechar={() => setRecebendo(null)}
        rodape={
          <>
            <button type='button' className='btn btn-secondary' onClick={() => setRecebendo(null)}>
              Voltar
            </button>
            <button type='button' className='btn btn-success' onClick={confirmarRecebimento}>
              Confirmar recebimento
            </button>
          </>
        }
      >
        {recebendo && (
          <>
            <p>Receber {formatarMoeda(recebendo.valor)} e confirmar o agendamento?</p>
            <FormGroup label='Forma de pagamento: *' htmlFor='inputFormaRecebimento'>
              <select
                id='inputFormaRecebimento'
                className='form-select'
                value={formaRecebimento}
                onChange={(e) => setFormaRecebimento(e.target.value)}
              >
                {['PIX', 'CARTAO', 'DINHEIRO'].map((forma) => (
                  <option key={forma} value={forma}>
                    {FORMA_PAGAMENTO[forma]}
                  </option>
                ))}
              </select>
            </FormGroup>
          </>
        )}
      </Modal>

      <Modal
        aberto={estornando != null}
        titulo='Estornar pagamento'
        onFechar={() => setEstornando(null)}
        rodape={
          <>
            <button type='button' className='btn btn-secondary' onClick={() => setEstornando(null)}>
              Voltar
            </button>
            <button type='button' className='btn btn-danger' onClick={confirmarEstorno}>
              Confirmar estorno
            </button>
          </>
        }
      >
        {estornando && (
          <>
            <p>
              Estornar {formatarMoeda(estornando.valor)} pago em {FORMA_PAGAMENTO[estornando.forma] || estornando.forma}?
              Se o agendamento ainda não foi atendido, ele será cancelado.
            </p>
            <FormGroup label='Justificativa: *' htmlFor='inputJustificativa'>
              <textarea
                id='inputJustificativa'
                className='form-control'
                rows='3'
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
              />
            </FormGroup>
          </>
        )}
      </Modal>
    </div>
  );
}

export default ListagemPagamento;
