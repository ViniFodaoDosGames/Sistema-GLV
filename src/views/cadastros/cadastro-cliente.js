import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../../components/card';
import FormGroup from '../../components/form-group';

import { mensagemSucesso, mensagemErro } from '../../components/toastr';

import '../../custom.css';

import axios from 'axios';
import { BASE_URL } from '../../config/axios';
import { carregar } from '../../config/api';

function CadastroCliente() {
    const { idParam } = useParams();
    const navigate = useNavigate();
    const { cancelar } = useOutletContext();
    const baseURL = `${BASE_URL}/Clientes`;


    const [id, setId] = useState('');
    const [idUsuario, setIdUsuario] = useState('');
    const [usuarios, setUsuarios] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);

    const usuariosLivres = usuarios.filter(
        (dado) =>
            (dado.status || dado.id === idUsuario) &&
            !clientes.some((cliente) => cliente.idUsuario === dado.id && cliente.id !== idParam) &&
            !funcionarios.some((funcionario) => funcionario.idUsuario === dado.id)
    );

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
                    mensagemSucesso(`Cliente cadastrado com sucesso!`);
                    navigate(`/listagem-cliente`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao cadastrar o cliente');
                });
        } else {
            await axios
                .patch(`${baseURL}/${idParam}`, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Cliente alterado com sucesso!`);
                    navigate(`/listagem-cliente`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao alterar o cliente');
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
                mensagemErro('Cliente não encontrado');
            });
    }

    useEffect(() => {
        buscar();
    }, [idParam]);

    useEffect(() => {
        carregar(['Usuarios', 'Clientes', 'Funcionarios'])
            .then((dados) => {
                setUsuarios(dados.Usuarios);
                setClientes(dados.Clientes);
                setFuncionarios(dados.Funcionarios);
            })
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
    }, []);

    return (
        <div className='container'>
            <Card title='Cadastro de Cliente'>
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
                                    {usuariosLivres.map((dado) => (
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
                                    onClick={() => cancelar(`/listagem-cliente`)}
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

export default CadastroCliente;
