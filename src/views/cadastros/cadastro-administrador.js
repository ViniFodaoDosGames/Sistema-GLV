import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../../components/card';
import FormGroup from '../../components/form-group';

import { mensagemSucesso, mensagemErro } from '../../components/toastr';

import '../../custom.css';

import axios from 'axios';
import { BASE_URL } from '../../config/axios';

function CadastroAdministrador() {
    const { idParam } = useParams();
    const navigate = useNavigate();
    const baseURL = `${BASE_URL}/Administradores`;


    const [id, setId] = useState('');
    const [idFuncionario, setIdFuncionario] = useState('');
    const [funcionarios, setFuncionarios] = useState([]);
    const [usuarios, setUsuarios] = useState([]);

    function nomeUsuario(idUsuario) {
        const usuario = usuarios.find((dado) => dado.id === idUsuario);
        return usuario ? usuario.nome : idUsuario;
    }

    async function salvar() {
        if (idFuncionario === '') {
            mensagemErro('Informe: Funcionário');
            return;
        }

        let data = {
            id,
            idFuncionario,
        };
        data = JSON.stringify(data);
        if (idParam == null) {
            await axios
                .post(baseURL, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Administrador cadastrado com sucesso!`);
                    navigate(`/listagem-administrador`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao cadastrar o administrador');
                });
        } else {
            await axios
                .put(`${baseURL}/${idParam}`, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Administrador alterado com sucesso!`);
                    navigate(`/listagem-administrador`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao alterar o administrador');
                });
        }
    }

    async function buscar() {
        if (idParam == null) return;

        await axios
            .get(`${baseURL}/${idParam}`)
            .then((response) => {
                setId(response.data.id);
                setIdFuncionario(response.data.idFuncionario ?? '');
            })
            .catch(function (error) {
                mensagemErro('Administrador não encontrado');
            });
    }

    useEffect(() => {
        buscar();
    }, [idParam]);

    useEffect(() => {
        axios
            .get(`${BASE_URL}/Funcionarios`)
            .then((response) => {
                setFuncionarios(response.data);
            })
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
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
            <Card title='Cadastro de Administrador'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='bs-component'>
                            <FormGroup label='Funcionário: *' htmlFor='inputIdFuncionario'>
                                <select
                                    id='inputIdFuncionario'
                                    value={idFuncionario}
                                    className='form-select'
                                    name='idFuncionario'
                                    onChange={(e) => setIdFuncionario(e.target.value)}
                                >
                                    <option value=''>Selecione</option>
                                    {funcionarios.map((dado) => (
                                        <option key={dado.id} value={dado.id}>
                                            {nomeUsuario(dado.idUsuario)}
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
                                    onClick={() => navigate(`/listagem-administrador`)}
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

export default CadastroAdministrador;
