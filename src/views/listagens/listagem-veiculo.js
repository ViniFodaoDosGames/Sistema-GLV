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

  async function excluir(id) {
    let data = JSON.stringify({ id });
    let url = `${baseURL}/${id}`;
    console.log(url);
    await axios
      .delete(url, data, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then(function (response) {
        mensagemSucesso(`Veículo excluído com sucesso!`);
        setDados(
          dados.filter((dado) => {
            return dado.id !== id;
          })
        );
      })
      .catch(function (error) {
        mensagemErro(`Erro ao excluir o veiculo`);
      });
  }

 React.useEffect(() => {
   async function carregarVeiculos() {
     try {
       const [veiculosResponse, clientesResponse, vinculosResponse] =
         await Promise.all([
           axios.get(baseURL),
           axios.get(`${BASE_URL}/Clientes`),
           axios.get(`${BASE_URL}/ClientesVeiculos`),
         ]);

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
      <Card title='Listagem de Veiculos'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <button
                type='button'
                className='btn btn-info'
                onClick={() => cadastrar()}
              >
                Novo Veiculo
              </button>
              <table className='table table-hover justify-content-center'>
                <thead>
                  <tr>
                    <th scope='col'>Placa</th>
                    <th scope='col'>Ano</th>
                    <th scope='col'>Cor</th>
                    <th scope='col'>Modelo</th>
                    <th scope='col'>Categoria de Veiculo</th>
                    <th scope='col'>Ativo</th>
                    <th scope='col'>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map((dado) => (
                    <tr key={dado.id}>
                      <td className='justify-content-center'>{dado.placa}</td>
                      <td className='justify-content-center'>{dado.ano}</td>
                      <td className='justify-content-center'>{dado.idCor}</td>
                      <td className='justify-content-center'>{dado.idModelo}</td>
                      <td className='justify-content-center'>{dado.idCategoriaVeiculo}</td>
                      <td className='justify-content-center'>{dado.ativo ? 'Sim' : 'Não'}</td>
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