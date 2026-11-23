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
import { NOME_DIA_SEMANA, formatarHora } from '../../config/util';
const baseURL = `${BASE_URL}/HorariosFuncionamento`;


function ListagemHorarioFuncionamento() {
  const navigate = useNavigate();

  const cadastrar = () => {
    navigate(`/cadastro-horario-funcionamento`);
  };

  const editar = (id) => {
    navigate(`/cadastro-horario-funcionamento/${id}`);
  };

  const [dados, setDados] = React.useState([]);

  async function excluir(id) {
    if (!(await confirmarExclusao('Excluir horário de funcionamento'))) return;
    let data = JSON.stringify({ id });
    let url = `${baseURL}/${id}`;
    console.log(url);
    await axios
      .delete(url, data, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then(function (response) {
        mensagemSucesso(`Horário excluído com sucesso!`);
        setDados(
          dados.filter((dado) => {
            return dado.id !== id;
          })
        );
      })
      .catch(function (error) {
        mensagemErro(`Erro ao excluir o horário`);
      });
  }

 React.useEffect(() => {
   axios.get(baseURL).then((response) => {
     setDados(response.data);
   });
 }, []);

// precisa de status?

  if (!dados) return null;
  return (
    <div className='container'>
      <Card title='Listagem de Horário de Funcionamento'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <button
                type='button'
                className='btn btn-info'
                onClick={() => cadastrar()}
              >
                Novo Horário de Funcionamento
              </button>
              <table className='table table-hover justify-content-center'>
                <thead>
                  <tr>
                    <th scope='col'>Lava Jato</th>
                    <th scope='col'>Dia da Semana</th>
                    <th scope='col'>Horário de Abertura</th>
                    <th scope='col'>Horário de Fechamento</th>
                    <th scope='col'>Disponível</th>
                    <th scope='col'>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map((dado) => (
                    <tr key={dado.id}>
                      <td className='justify-content-center'>{dado.idLavaJato}</td>
                      <td className='justify-content-center'>{NOME_DIA_SEMANA[dado.diaSemana] || dado.diaSemana}</td>
                      <td className='justify-content-center'>{dado.horaAbertura ? formatarHora(dado.horaAbertura) : 'Não informado'}</td>
                      <td className='justify-content-center'>{dado.horaFechamento ? formatarHora(dado.horaFechamento) : 'Não informado'}</td>
                      <td className='justify-content-center'>{dado.aberto ? 'Sim' : 'Não'}</td>
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

export default ListagemHorarioFuncionamento;