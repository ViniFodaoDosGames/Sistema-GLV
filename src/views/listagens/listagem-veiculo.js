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
const baseURL = `${BASE_URL}/Veiculos`;


function ListagemVeiculo() {
  const navigate = useNavigate();
  const session = getSession();

  const cadastrar = () => {
    navigate(`/cadastro-veiculo`);
  };

  const editar = (id) => {
    navigate(`/cadastro-veiculo/${id}`);
  };

  const [dados, setDados] = React.useState([]);
  const [tabelas, setTabelas] = React.useState({
    Cores: [], Modelos: [], Marcas: [], CategoriasVeiculo: [], Clientes: [], Usuarios: [], ClientesVeiculos: [], Agendamentos: [],
  });
  const ehCliente = session?.role === 'CLIENTE';

  const nomeEm = (lista, id) => (tabelas[lista].find((item) => item.id === id) || {}).nome || '-';

  function marcaDoVeiculo(veiculo) {
    const modelo = tabelas.Modelos.find((item) => item.id === veiculo.idModelo);
    return modelo ? nomeEm('Marcas', modelo.idMarca) : '-';
  }

  function donoDoVeiculo(veiculo) {
    const ligacao = tabelas.ClientesVeiculos.find((item) => item.idVeiculo === veiculo.id);
    const cliente = ligacao && tabelas.Clientes.find((item) => item.id === ligacao.idCliente);
    return cliente ? nomeEm('Usuarios', cliente.idUsuario) : 'Sem dono';
  }

  async function excluir(id) {
    if (tabelas.Agendamentos.some((agendamento) => agendamento.idVeiculo === id)) {
      mensagemErro('Este veículo tem agendamentos e não pode ser excluído');
      return;
    }
    let data = JSON.stringify({ id });
    let url = `${baseURL}/${id}`;
    console.log(url);
    await axios
      .delete(url, data, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then(async function (response) {
        const ligacoes = tabelas.ClientesVeiculos.filter((ligacao) => ligacao.idVeiculo === id);
        for (const ligacao of ligacoes) {
          await axios.delete(`${BASE_URL}/ClientesVeiculos/${ligacao.id}`);
        }
        mensagemSucesso(`Veículo excluído com sucesso!`);
        setDados(
          dados.filter((dado) => {
            return dado.id !== id;
          })
        );
      })
      .catch(function (error) {
        mensagemErro(`Erro ao excluir o veículo`);
      });
  }

 React.useEffect(() => {
   async function carregarVeiculos() {
     try {
       const [veiculosResponse, clientesResponse, vinculosResponse, cores, modelos, marcas, categorias, usuarios, agendamentos] =
         await Promise.all([
           axios.get(baseURL),
           axios.get(`${BASE_URL}/Clientes`),
           axios.get(`${BASE_URL}/ClientesVeiculos`),
           axios.get(`${BASE_URL}/Cores`),
           axios.get(`${BASE_URL}/Modelos`),
           axios.get(`${BASE_URL}/Marcas`),
           axios.get(`${BASE_URL}/CategoriasVeiculo`),
           axios.get(`${BASE_URL}/Usuarios`),
           axios.get(`${BASE_URL}/Agendamentos`),
         ]);

       setTabelas({
         Cores: cores.data,
         Modelos: modelos.data,
         Marcas: marcas.data,
         CategoriasVeiculo: categorias.data,
         Clientes: clientesResponse.data,
         Usuarios: usuarios.data,
         ClientesVeiculos: vinculosResponse.data,
         Agendamentos: agendamentos.data,
       });

       let veiculos = veiculosResponse.data;

       if (session?.role === 'CLIENTE') {
         const cliente = clientesResponse.data.find(
           (item) =>
             String(item.idUsuario) === String(session.usuario.id)
         );

         if (cliente) {
           const clienteIds = new Set([
             String(cliente.id),
             String(cliente.id).replace('cliente-', ''),
             String(cliente.id).replace(/^cliente-0*/, ''),
           ]);
           const ids = vinculosResponse.data
             .filter((item) => clienteIds.has(String(item.idCliente)))
             .map((item) => String(item.idVeiculo));

           veiculos = veiculos.filter((veiculo) =>
             ids.includes(String(veiculo.id))
           );
         } else {
           veiculos = [];
         }
       }

       setDados(veiculos);
     } catch (error) {
       mensagemErro('Erro ao carregar os veículos');
     }
   }

   carregarVeiculos();
 }, [session?.role, session?.usuario?.id]);

  if (!dados) return null;
  return (
    <div className='container'>
      <Card title={session?.role === 'CLIENTE' ? 'Veículos' : 'Listagem de Veículos'}>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <button
                type='button'
                className='btn btn-info'
                onClick={() => cadastrar()}
              >
                Novo Veículo
              </button>
              <table className='table table-hover justify-content-center'>
                <thead>
                  <tr>
                    <th scope='col'>Placa</th>
                    <th scope='col'>Ano</th>
                    <th scope='col'>Marca</th>
                    <th scope='col'>Modelo</th>
                    <th scope='col'>Categoria</th>
                    <th scope='col'>Cor</th>
                    {!ehCliente && <th scope='col'>Dono</th>}
                    {!ehCliente && <th scope='col'>Ativo</th>}
                    <th scope='col'>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map((dado) => (
                    <tr key={dado.id}>
                      <td className='justify-content-center'>{dado.placa}</td>
                      <td className='justify-content-center'>{dado.ano || '-'}</td>
                      <td className='justify-content-center'>{marcaDoVeiculo(dado)}</td>
                      <td className='justify-content-center'>{nomeEm('Modelos', dado.idModelo)}</td>
                      <td className='justify-content-center'>{nomeEm('CategoriasVeiculo', dado.idCategoriaVeiculo)}</td>
                      <td className='justify-content-center'>{nomeEm('Cores', dado.idCor)}</td>
                      {!ehCliente && <td className='justify-content-center'>{donoDoVeiculo(dado)}</td>}
                      {!ehCliente && <td className='justify-content-center'>{dado.ativo ? 'Sim' : 'Não'}</td>}
                      <td>
                        <Stack spacing={1} padding={0} direction='row' >
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

export default ListagemVeiculo;