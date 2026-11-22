import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../../components/card';
import FormGroup from '../../components/form-group';

import { mensagemSucesso, mensagemErro } from '../../components/toastr';

import '../../custom.css';

import axios from 'axios';
import { BASE_URL } from '../../config/axios';

function CadastroUsuario() {
    const { idParam } = useParams();
    const navigate = useNavigate();
    const baseURL = `${BASE_URL}/Usuarios`;


    const [id, setId] = useState('');
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [email, setEmail] = useState('');
    const [celular, setCelular] = useState('');
    const [senha, setSenha] = useState('');
    const [status, setStatus] = useState(false);

    async function salvar() {
        if (!nome.trim()) {
            mensagemErro('Informe: Nome');
            return;
        }
        if (!cpf.trim()) {
            mensagemErro('Informe: CPF');
            return;
        }
        if (!email.trim()) {
            mensagemErro('Informe: Email');
            return;
        }
        if (!celular.trim()) {
            mensagemErro('Informe: Celular');
            return;
        }
        if (!senha.trim()) {
            mensagemErro('Informe: Senha');
            return;
        }

        let data = {
            id,
            nome,
            cpf,
            email,
            celular,
            senha,
            status,
        };
        data = JSON.stringify(data);
        if (idParam == null) {
            await axios
                .post(baseURL, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Usuário cadastrado com sucesso!`);
                    navigate(`/listagem-usuario`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao cadastrar o usuário');
                });
        } else {
            await axios
                .put(`${baseURL}/${idParam}`, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Usuário alterado com sucesso!`);
                    navigate(`/listagem-usuario`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao alterar o usuário');
                });
        }
    }

    async function buscar() {
        if (idParam == null) return;

        await axios
            .get(`${baseURL}/${idParam}`)
            .then((response) => {
                setId(response.data.id);
                setNome(response.data.nome ?? '');
                setCpf(response.data.cpf ?? '');
                setEmail(response.data.email ?? '');
                setCelular(response.data.celular ?? '');
                setSenha(response.data.senha ?? '');
                setStatus(response.data.status);
            })
            .catch(function (error) {
                mensagemErro('Usuário não encontrado');
            });
    }

    useEffect(() => {
        buscar();
    }, [idParam]);

    return (
        <div className='container'>
            <Card title='Cadastro de Usuário'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='bs-component'>
                            <FormGroup label='Nome: *' htmlFor='inputNome'>
                                <input
                                    type='text'
                                    id='inputNome'
                                    value={nome}
                                    className='form-control'
                                    name='nome'
                                    onChange={(e) => setNome(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='CPF: *' htmlFor='inputCpf'>
                                <input
                                    type='text'
                                    id='inputCpf'
                                    value={cpf}
                                    className='form-control'
                                    name='cpf'
                                    onChange={(e) => setCpf(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Email: *' htmlFor='inputEmail'>
                                <input
                                    type='email'
                                    id='inputEmail'
                                    value={email}
                                    className='form-control'
                                    name='email'
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Celular: *' htmlFor='inputCelular'>
                                <input
                                    type='text'
                                    id='inputCelular'
                                    value={celular}
                                    className='form-control'
                                    name='celular'
                                    onChange={(e) => setCelular(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Senha: *' htmlFor='inputSenha'>
                                <input
                                    type='password'
                                    id='inputSenha'
                                    value={senha}
                                    className='form-control'
                                    name='senha'
                                    onChange={(e) => setSenha(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Ativo' htmlFor='inputStatus'>
                                <input
                                    type='checkbox'
                                    id='inputStatus'
                                    checked={status}
                                    className='form-control form-check-input'
                                    name='status'
                                    onChange={(e) => setStatus(e.target.checked)}
                                />
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
                                    onClick={() => navigate(`/listagem-usuario`)}
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

export default CadastroUsuario;
