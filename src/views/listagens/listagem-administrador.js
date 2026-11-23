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
import { obterSessao } from '../../config/sessao';
import { nomeFuncionario } from '../../config/agenda';
const baseURL = `${BASE_URL}/Administradores`;


function ListagemAdministrador() {
  const navigate = useNavigate();

  const cadastrar = () => {
    navigate(`/cadastro-administrador`);
  };

  const editar = (id) => {
    navigate(`/cadastro-administrador/${id}`);
  };

  const [dados, setDados] = React.useState([]);
  const [funcionarios, setFuncionarios] = React.useState([]);
  const [usuarios, setUsuarios] = React.useState([]);

  async function excluir(id) {
    const administrador = dados.find((dado) => dado.id === id);
    if (administrador && administrador.idFuncionario === obterSessao().idFuncionario) {
      mensagemErro('Você não pode excluir o seu próprio acesso de administrador');
      return;
    }
    if (dados.length === 1) {
      mensagemErro('O sistema precisa ter pelo menos um administrador');
      return;
    }
    if (!(await confirmarExclusao('Excluir administrador'))) return;
    let data = JSON.stringify({ id });
    let url = `${baseURL}/${id}`;
    console.log(url);
    await axios
      .delete(url, data, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then(function (response) {
        mensagemSucesso(`Administrador excluído com sucesso!`);
        setDados(
          dados.filter((dado) => {
            return dado.id !== id;
          })
        );
      })
      .catch(function (error) {
        mensagemErro(`Erro ao excluir o administrador`);
      });
  }

 React.useEffect(() => {
   axios.get(baseURL).then((response) => {
     setDados(response.data);
   });
   axios.get(`${BASE_URL}/Funcionarios`).then((response) => {
     setFuncionarios(response.data);
   });
   axios.get(`${BASE_URL}/Usuarios`).then((response) => {
     setUsuarios(response.data);
   });
 }, []);

  if (!dados) return null;
  return (
    <div className='container'>
      <Card title='Listagem de Administradores'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='bs-component'>
              <button
                type='button'
                className='btn btn-info'
                onClick={() => cadastrar()}
              >
                Novo Administrador
              </button>
              <table className='table table-hover justify-content-center'>
                <thead>
                  <tr>
                    <th scope='col'>Funcionário</th>
                    <th scope='col'>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map((dado) => (
                    <tr key={dado.id}>
                      <td className='justify-content-center'>
                        {nomeFuncionario(dado.idFuncionario, { Funcionarios: funcionarios, Usuarios: usuarios })}
                      </td>
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

export default ListagemAdministrador;

//listagem de Administrador está esquisito