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
const baseURL = `${BASE_URL}/Agendamentos`;


function ListagemAgendamento() {
  const navigate = useNavigate();
  const session = getSession();

  const cadastrar = () => {
    navigate(`/cadastro-agendamento`);
  };

  const editar = (id) => {
    navigate(`/cadastro-agendamento/${id}`);
  };

  const [dados, setDados] = React.useState([]);
  const [veiculos, setVeiculos] = React.useState([]);
  const [servicos, setServicos] = React.useState([]);
  const [busca, setBusca] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [servico, setServico] = React.useState('');
  const [pagamentos, setPagamentos] = React.useState([]);

  async function excluir(id) {
    let data = JSON.stringify({ id });
    let url = `${baseURL}/${id}`;
    console.log(url);
    await axios
      .delete(url, data, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then(function (response) {
        mensagemSucesso(`Agendamento excluído com sucesso!`);
        setDados(
          dados.filter((dado) => {
            return dado.id !== id;
          })
        );
      })
      .catch(function (error) {
        mensagemErro(`Erro ao excluir o agendamento`);
      });
  }

 React.useEffect(() => {
   async function carregar() {
     try {
       const [agendamentos, veiculosResponse, servicosResponse, clientesResponse, pagamentosResponse] =
         await Promise.all([
           axios.get(baseURL),
           axios.get(`${BASE_URL}/Veiculos`),
           axios.get(`${BASE_URL}/Servicos`),
           axios.get(`${BASE_URL}/Clientes`),
           axios.get(`${BASE_URL}/Pagamentos`),
         ]);

       let filtrados = agendamentos.data;

       if (session?.role === 'CLIENTE') {
         const cliente = clientesResponse.data.find(
           (item) => String(item.idUsuario) === String(session.usuario.id)
         );

         if (!cliente) {
           filtrados = [];
         } else {
           const clienteIds = new Set([
             String(cliente.id),
             String(cliente.id).replace('cliente-', ''),
             String(cliente.id).replace(/^cliente-0*/, ''),
           ]);
           filtrados = filtrados.filter((item) =>
             clienteIds.has(String(item.idCliente))
           );
         }
       }

       setDados(filtrados);
       setVeiculos(veiculosResponse.data);
       setServicos(servicosResponse.data);
       setPagamentos(pagamentosResponse.data);
     } catch (error) {
       mensagemErro('Erro ao carregar os agendamentos');
     }
   }

   carregar();
 }, [session?.role, session?.usuario?.id]);

  const dadosFiltrados = dados.filter((dado) => {
    const veiculo = veiculos.find((item) => String(item.id) === String(dado.idVeiculo));
    const tipoServico = servicos.find((item) => String(item.id) === String(dado.idServico));
    const texto = `${dado.dataHora} ${dado.status} ${veiculo?.placa || ''} ${tipoServico?.nome || ''}`.toLowerCase();

    return (
      (!busca || texto.includes(busca.toLowerCase())) &&
      (!status || dado.status === status) &&
      (!servico || String(dado.idServico) === String(servico))
    );
  });

  if (!dados) return null;
  return (
    <div className='container'>
      <Card title='Listagem de Agendamento'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <div className='row g-2 mb-3'>
                <div className='col-md-4'>
                  <input
                    className='form-control'
                    placeholder='Buscar por veículo, serviço ou data'
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                  />
                </div>
                <div className='col-md-3'>
                  <select className='form-select' value={status} onChange={(event) => setStatus(event.target.value)}>
                    <option value=''>Todos os status</option>
                    {['AGUARDANDO_PAGAMENTO', 'CONFIRMADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'NAO_COMPARECEU', 'CANCELADO'].map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div className='col-md-3'>
                  <select className='form-select' value={servico} onChange={(event) => setServico(event.target.value)}>
                    <option value=''>Todos os serviços</option>
                    {servicos.map((item) => (
                      <option key={item.id} value={item.id}>{item.nome}</option>
                    ))}
                  </select>
                </div>
                <div className='col-md-2 d-flex justify-content-end'>
                  <button type='button' className='btn btn-info' onClick={cadastrar}>
                    Novo Agendamento
                  </button>
                </div>
              </div>
              <table className='table table-hover justify-content-center'>
                <thead>
                  <tr>
                    <th scope='col'>Data e Hora</th>
                    <th scope='col'>Status</th>
                    <th scope='col'>Valor</th>
                    <th scope='col'>Walk-in</th>
                    <th scope='col'>Serviço</th>
                    <th scope='col'>Posição da Fila</th>
                    <th scope='col'>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosFiltrados.map((dado) => (
                    <tr key={dado.id}>
                      <td className='justify-content-center'>{dado.dataHora}</td>
                      <td className='justify-content-center'>{dado.status}</td>
                      <td className='justify-content-center'>{dado.valor}</td>
                      <td className='justify-content-center'>{dado.walkIn ? 'Sim' : 'Não'}</td>
                      <td className='justify-content-center'>{servicos.find((s) => s.id === dado.idServico)?.nome || 'Serviço não encontrado'}</td>
                      <td className='justify-content-center'>{dado.posicaoFila}</td>
                      <td>
                        <Stack spacing={1} padding={0} direction='row' >
                          {session?.role === 'CLIENTE' &&
                            pagamentos.some(
                              (pagamento) =>
                                String(pagamento.idAgendamento) === String(dado.id) &&
                                pagamento.status === 'PENDENTE'
                            ) && (
                              <button
                                type='button'
                                className='btn btn-primary btn-sm'
                                onClick={() =>
                                  navigate(
                                    `/pagamento/pagamento/${
                                      pagamentos.find(
                                        (pagamento) =>
                                          String(pagamento.idAgendamento) ===
                                          String(dado.id)
                                      )?.id
                                    }`
                                  )
                                }
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
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ListagemAgendamento;