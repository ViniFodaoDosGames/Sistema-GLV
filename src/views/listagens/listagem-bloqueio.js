import React from 'react';

import Card from '../../components/card.js';

import { mensagemSucesso, mensagemErro } from '../../components/toastr.js';
import { confirmarExclusao } from '../../components/confirmar-exclusao';

import '../../custom.css';

import { useNavigate } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import axios from 'axios';
import { BASE_URL } from '../../config/axios.js';
import { formatarData, formatarHora } from '../../config/util';
const baseURL = `${BASE_URL}/Bloqueios`;


function ListagemBloqueio() {
  const navigate = useNavigate();

  const cadastrar = () => {
    navigate(`/cadastro-bloqueio`);
  };

  const editar = (id) => {
    navigate(`/cadastro-bloqueio/${id}`);
  };

  const [dados, setDados] = React.useState([]);
  const [servicos, setServicos] = React.useState([]);

  const nomeDoServico = (idServico) => servicos.find((servico) => servico.id === idServico)?.nome || '-';

  async function excluir(id) {
    if (!(await confirmarExclusao('Excluir bloqueio'))) return;
    let data = JSON.stringify({ id });
    let url = `${baseURL}/${id}`;
    console.log(url);
    await axios
      .delete(url, data, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then(function (response) {
        mensagemSucesso(`Bloqueio excluído com sucesso!`);
        setDados(
          dados.filter((dado) => {
            return dado.id !== id;
          })
        );
      })
      .catch(function (error) {
        mensagemErro(`Erro ao excluir o bloqueio`);
      });
  }

 React.useEffect(() => {
   axios.get(baseURL).then((response) => {
     setDados(response.data);
   });
   axios.get(`${BASE_URL}/Servicos`).then((response) => {
     setServicos(response.data);
   });
 }, []);

  if (!dados) return null;
  return (
    <div className='container'>
      <Card title='Listagem de Bloqueio'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <button
                type='button'
                className='btn btn-info'
                onClick={() => cadastrar()}
              >
                Novo Bloqueio
              </button>
              <table className='table table-hover justify-content-center'>
                <thead>
                  <tr>
                    <th scope='col'>Serviço</th>
                    <th scope='col'>Data</th>
                    <th scope='col'>Horário de Início</th>
                    <th scope='col'>Horário de Término</th>
                    <th scope='col'>Motivo</th>
                    <th scope='col'>Dia Todo</th>
                    <th scope='col'>Ativo</th>
                    <th scope='col'>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map((dado) => (
                    <tr key={dado.id}>
                      <td className='justify-content-center'>{nomeDoServico(dado.idServico)}</td>
                      <td className='justify-content-center'>{formatarData(dado.data)}</td>
                      <td className='justify-content-center'>{formatarHora(dado.horaInicio)}</td>
                      <td className='justify-content-center'>{formatarHora(dado.horaFim)}</td>
                      <td className='justify-content-center'>{dado.motivo}</td>
                      <td className='justify-content-center'>{dado.diaInteiro ? 'Sim' : 'Não'}</td>
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

export default ListagemBloqueio;