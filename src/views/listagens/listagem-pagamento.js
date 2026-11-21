import React from 'react';

import Card from '../../components/card.js';

import { mensagemSucesso, mensagemErro } from '../../components/toastr.js';

import '../../custom.css';

import { useNavigate } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import axios from 'axios';
import { BASE_URL } from '../../config/axios.js';
import { getSession } from '../../auth';
const baseURL = `${BASE_URL}/Pagamentos`;


function ListagemPagamento() {
  const navigate = useNavigate();
  const session = getSession();

  const cadastrar = () => {
    navigate(`/cadastro-pagamento`);
  };

  const editar = (id) => {
    navigate(`/cadastro-pagamento/${id}`);
  };

  const [dados, setDados] = React.useState([]);
  const [agendamentos, setAgendamentos] = React.useState([]);
  const [pagamentoSelecionado, setPagamentoSelecionado] = React.useState(null);
  const [formaPagamento, setFormaPagamento] = React.useState('PIX');
  const [saldoPontos, setSaldoPontos] = React.useState(0);

  async function excluir(id) {
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

 React.useEffect(() => {
   async function carregar() {
     try {
       const [pagamentos, agendamentosResponse, clientesResponse, lotesResponse] =
         await Promise.all([
           axios.get(baseURL),
           axios.get(`${BASE_URL}/Agendamentos`),
           axios.get(`${BASE_URL}/Clientes`),
           axios.get(`${BASE_URL}/LotesPontos`),
         ]);

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

           setSaldoPontos(
             lotesResponse.data
               .filter((item) =>
                 clienteIds.has(String(item.idCliente)) &&
                 item.saldo > 0
               )
               .reduce((total, item) => total + Number(item.saldo), 0)
           );
         }
       } else {
         setSaldoPontos(
           lotesResponse.data.reduce(
             (total, item) => total + Number(item.saldo || 0),
             0
           )
         );
       }

       setDados(pagamentosFiltrados);
       setAgendamentos(agendamentosFiltrados);
     } catch (error) {
       mensagemErro('Erro ao carregar os pagamentos');
     }
   }

   carregar();
 }, [session?.role, session?.usuario?.id]);

  async function pagar() {
    if (!pagamentoSelecionado) return;

    try {
      const agendamento = agendamentos.find(
        (item) => String(item.id) === String(pagamentoSelecionado.idAgendamento)
      );

      if (!agendamento) {
        mensagemErro('Agendamento do pagamento não encontrado.');
        return;
      }

      if (
        formaPagamento === 'PONTOS' &&
        (session?.role !== 'CLIENTE' ||
          saldoPontos < Number(pagamentoSelecionado.valor))
      ) {
        if (session?.role !== 'CLIENTE') {
          mensagemErro('Somente clientes podem pagar com pontos.');
          return;
        }
        mensagemErro('Saldo insuficiente de pontos para este pagamento.');
        return;
      }

      await axios.patch(`${baseURL}/${pagamentoSelecionado.id}`, {
        forma: formaPagamento,
        status: 'APROVADO',
        dataHora: new Date().toLocaleString('sv-SE').replace('T', ' '),
        codigoGateway: formaPagamento === 'PONTOS' ? null : `GW-${Date.now()}`,
      });

      await axios.patch(`${BASE_URL}/Agendamentos/${agendamento.id}`, {
        status: 'CONFIRMADO',
      });

      if (formaPagamento === 'PONTOS') {
        const clientesResponse = await axios.get(`${BASE_URL}/Clientes`);
        const lotesResponse = await axios.get(`${BASE_URL}/LotesPontos`);
        const cliente = clientesResponse.data.find(
          (item) => String(item.idUsuario) === String(session.usuario.id)
        );

        if (!cliente) throw new Error('Cliente não encontrado.');

        const clienteIds = new Set([
          String(cliente.id),
          String(cliente.id).replace('cliente-', ''),
          String(cliente.id).replace(/^cliente-0*/, ''),
        ]);
        let restante = Number(pagamentoSelecionado.valor);
        const lotes = lotesResponse.data
          .filter((item) =>
            clienteIds.has(String(item.idCliente)) &&
            Number(item.saldo) > 0 &&
            (!item.expiraEm || item.expiraEm >= new Date().toISOString().slice(0, 10))
          )
          .sort((a, b) => String(a.expiraEm).localeCompare(String(b.expiraEm)));

        for (const lote of lotes) {
          if (restante <= 0) break;
          const utilizado = Math.min(restante, Number(lote.saldo));
          await axios.patch(`${BASE_URL}/LotesPontos/${lote.id}`, {
            saldo: Number(lote.saldo) - utilizado,
          });
          await axios.post(`${BASE_URL}/PagamentosLotesPontos`, {
            idPagamento: pagamentoSelecionado.id,
            idLotePontos: lote.id,
            quantidadeUtilizada: utilizado,
          });
          restante -= utilizado;
        }

        if (restante > 0) {
          throw new Error('Não foi possível consumir todos os pontos.');
        }
      }

      setDados((atuais) =>
        atuais.map((item) =>
          String(item.id) === String(pagamentoSelecionado.id)
            ? { ...item, forma: formaPagamento, status: 'APROVADO', codigoGateway: formaPagamento === 'PONTOS' ? null : `GW-${Date.now()}` }
            : item
        )
      );
      setAgendamentos((atuais) =>
        atuais.map((item) =>
          String(item.id) === String(agendamento.id)
            ? { ...item, status: 'CONFIRMADO' }
            : item
        )
      );
      setPagamentoSelecionado(null);
      mensagemSucesso('Pagamento realizado com sucesso.');
    } catch (error) {
      mensagemErro(error.message || 'Não foi possível realizar o pagamento.');
    }
  }

  if (!dados) return null;
  return (
    <div className='container'>
      <Card title='Listagem de Pagamentos'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <button
                type='button'
                className='btn btn-info'
                onClick={() => cadastrar()}
              >
                Novo Pagamento
              </button>
              <table className='table table-hover justify-content-center'>
                <thead>
                  <tr>
                    <th scope='col'>Forma</th>
                    <th scope='col'>Status</th>
                    <th scope='col'>Valor</th>
                    <th scope='col'>Data e Hora</th>
                    <th scope='col'>Código Gateway</th>
                    <th scope='col'>Justificativa do Estorno</th>
                    <th scope='col'>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map((dado) => (
                    <tr key={dado.id}>
                      <td className='justify-content-center'>{dado.forma}</td>
                      <td className='justify-content-center'>{dado.status}</td>
                      <td className='justify-content-center'>{dado.valor}</td>
                      <td className='justify-content-center'>{dado.dataHora}</td>
                      <td className='justify-content-center'>{dado.codigoGateway}</td>
                      <td className='justify-content-center'>{dado.justificativaEstorno}</td>
                      <td>
                        <Stack spacing={1} padding={0} direction='row' >
                          {dado.status === 'PENDENTE' && (
                            <button
                              type='button'
                              className='btn btn-primary btn-sm'
                              onClick={() => {
                                setPagamentoSelecionado(dado);
                                setFormaPagamento('PIX');
                              }}
                            >
                              Pagar
                            </button>
                          )}
                          <IconButton
                            aria-label='edit'
                            onClick={() => editar(dado.id)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            aria-label='delete'
                            onClick={() => excluir(dado.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>{' '}
              {pagamentoSelecionado && (
                <div className='card mt-3'>
                  <div className='card-body'>
                    <h5 className='card-title'>Realizar pagamento</h5>
                    <p className='mb-2'>
                      Valor: <strong>R$ {Number(pagamentoSelecionado.valor).toFixed(2)}</strong>
                    </p>
                    <p className='mb-3'>
                      Saldo de pontos: <strong>{saldoPontos}</strong>
                    </p>
                    <div className='d-flex flex-wrap gap-2 mb-3'>
                      {['PIX', 'CARTAO', 'PONTOS'].map((forma) => (
                        <button
                          key={forma}
                          type='button'
                          className={`btn ${formaPagamento === forma ? 'btn-primary' : 'btn-outline-primary'}`}
                          disabled={
                            forma === 'PONTOS' &&
                            (session?.role !== 'CLIENTE' ||
                              saldoPontos < Number(pagamentoSelecionado.valor))
                          }
                          onClick={() => setFormaPagamento(forma)}
                        >
                          {forma === 'CARTAO' ? 'Cartão' : forma}
                        </button>
                      ))}
                    </div>
                    <div className='d-flex gap-2'>
                      <button type='button' className='btn btn-primary' onClick={pagar}>
                        Confirmar pagamento
                      </button>
                      <button
                        type='button'
                        className='btn btn-secondary'
                        onClick={() => setPagamentoSelecionado(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ListagemPagamento;