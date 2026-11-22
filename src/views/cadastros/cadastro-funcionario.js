import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../../components/card';
import FormGroup from '../../components/form-group';

import { mensagemSucesso, mensagemErro } from '../../components/toastr';

import '../../custom.css';

import axios from 'axios';
import { BASE_URL } from '../../config/axios';

function CadastroFuncionario() {
    const { idParam } = useParams();
    const navigate = useNavigate();
    const baseURL = `${BASE_URL}/Funcionarios`;


    const [id, setId] = useState('');
    const [idUsuario, setIdUsuario] = useState('');
    const [usuarios, setUsuarios] = useState([]);

    async function salvar() {
        if (idUsuario === '') {
            mensagemErro('Informe: Usuário');
            return;
        }

        let data = {
            id,
            idUsuario,
        };
        data = JSON.stringify(data);
        if (idParam == null) {
            await axios
                .post(baseURL, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Funcionário cadastrado com sucesso!`);
                    navigate(`/listagem-funcionario`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao cadastrar o funcionário');
                });
        } else {
            await axios
                .put(`${baseURL}/${idParam}`, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Funcionário alterado com sucesso!`);
                    navigate(`/listagem-funcionario`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao alterar o funcionário');
                });
        }
    }

    async function buscar() {
        if (idParam == null) return;

        await axios
            .get(`${baseURL}/${idParam}`)
            .then((response) => {
                setId(response.data.id);
                setIdUsuario(response.data.idUsuario ?? '');
            })
            .catch(function (error) {
                mensagemErro('Funcionário não encontrado');
            });
    }

    useEffect(() => {
        buscar();
    }, [idParam]);

    useEffect(() => {
        axios
            .get(`${BASE_URL}/Usuarios`)
            .then((response) => {
                setUsuarios(response.data);
            })
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
    }, []);

    return (
        <div className='container'>
            <Card title='Cadastro de Funcionário'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='bs-component'>
                            <FormGroup label='Usuário: *' htmlFor='inputIdUsuario'>
                                <select
                                    id='inputIdUsuario'
                                    value={idUsuario}
                                    className='form-select'
                                    name='idUsuario'
                                    onChange={(e) => setIdUsuario(e.target.value)}
                                >
                                    <option value=''>Selecione</option>
                                    {usuarios.map((dado) => (
                                        <option key={dado.id} value={dado.id}>
                                            {dado.nome}
                                        </option>
                                    ))}
                                </select>
                            </FormGroup>
                            <Stack spacing={1} padding={1} direction='row'>
                                <button
                                    onClick={salvar}
                                    type='button'
                                    className='btn btn-success'
                                >
                                    Salvar
                                </button>
                                <button
                                    onClick={() => navigate(`/listagem-funcionario`)}
                                    type='button'
                                    className='btn btn-danger'
                                >
                                    Cancelar
                                </button>
                            </Stack>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default CadastroFuncionario;
