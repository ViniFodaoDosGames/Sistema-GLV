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
const baseURL = `${BASE_URL}/Tempos`;


function ListagemTempo() {
  const navigate = useNavigate();

  const cadastrar = () => {
    navigate(`/cadastro-tempo`);
  };

  const editar = (id) => {
    navigate(`/cadastro-tempo/${id}`);
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
        mensagemSucesso(`Tempo excluído com sucesso!`);
        setDados(
          dados.filter((dado) => {
            return dado.id !== id;
          })
        );
      })
      .catch(function (error) {
        mensagemErro(`Erro ao excluir o tempo`);
      });
  }

 React.useEffect(() => {
   axios.get(baseURL).then((response) => {
     setDados(response.data);
   });
 }, []);

  if (!dados) return null;
  return (
    <div className='container'>
      <Card title='Listagem de Tempos'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <button
                type='button'
                className='btn btn-warning'
                onClick={() => cadastrar()}
              >
                Novo Tempo
              </button>
              <table className='table table-hover justify-content-center'>
                <thead>
                  <tr>
                    <th scope='col'>Minutos</th>
                    <th scope='col'>Ativo</th>
                    <th scope='col'>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map((dado) => (
                    <tr key={dado.id}>
                      <td className='justify-content-center'>{dado.minutos}</td>
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

export default ListagemTempo;