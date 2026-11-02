import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../../components/card';
import FormGroup from '../../components/form-group';

import { mensagemSucesso, mensagemErro } from '../../components/toastr';

import '../../custom.css';

import axios from 'axios';
import { BASE_URL } from '../../config/axios';

function CadastroNotificacao() {
    const { idParam } = useParams();
    const navigate = useNavigate();
    const baseURL = `${BASE_URL}/Notificacoes`;


    const [id, setId] = useState('');
    const [canal, setCanal] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [dataHora, setDataHora] = useState('');
    const [idCliente, setIdCliente] = useState('');
    const [idAgendamento, setIdAgendamento] = useState('');
    const [clientes, setClientes] = useState([]);
    const [agendamentos, setAgendamentos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);

    function nomeUsuario(idUsuario) {
        const usuario = usuarios.find((dado) => dado.id === idUsuario);
        return usuario ? usuario.nome : idUsuario;
    }

    async function salvar() {
        if (canal === '') {
            mensagemErro('Informe: Canal');
            return;
        }
        if (!mensagem.trim()) {
            mensagemErro('Informe: Mensagem');
            return;
        }
        if (dataHora === '') {
            mensagemErro('Informe: Data e hora');
            return;
        }
        if (idCliente === '') {
            mensagemErro('Informe: Cliente');
            return;
        }

        let data = {
            id,
            canal,
            mensagem,
            dataHora: dataHora.replace('T', ' ').padEnd(19, ':00'),
            idCliente,
            idAgendamento: idAgendamento || null,
        };
        data = JSON.stringify(data);
        if (idParam == null) {
            await axios
                .post(baseURL, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Notificação cadastrada com sucesso!`);
                    navigate(`/listagem-notificacao`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao cadastrar a notificação');
                });
        } else {
            await axios
                .put(`${baseURL}/${idParam}`, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Notificação alterada com sucesso!`);
                    navigate(`/listagem-notificacao`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao alterar a notificação');
                });
        }
    }

    async function buscar() {
        if (idParam == null) return;

        await axios
            .get(`${baseURL}/${idParam}`)
            .then((response) => {
                setId(response.data.id);
                setCanal(response.data.canal ?? '');
                setMensagem(response.data.mensagem ?? '');
                setDataHora(response.data.dataHora.replace(' ', 'T'));
                setIdCliente(response.data.idCliente ?? '');
                setIdAgendamento(response.data.idAgendamento ?? '');
            })
            .catch(function (error) {
                mensagemErro('Notificação não encontrada');
            });
    }

    useEffect(() => {
        buscar();
    }, [idParam]);

    useEffect(() => {
        axios
            .get(`${BASE_URL}/Clientes`)
            .then((response) => {
                setClientes(response.data);
            })
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
        axios
            .get(`${BASE_URL}/Agendamentos`)
            .then((response) => {
                setAgendamentos(response.data);
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
            <Card title='Cadastro de Notificação'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='bs-component'>
                            <FormGroup label='Canal: *' htmlFor='inputCanal'>
                                <select
                                    id='inputCanal'
                                    value={canal}
                                    className='form-select'
                                    name='canal'
                                    onChange={(e) => setCanal(e.target.value)}
                                >
                                    <option value=''>Selecione</option>
                                    <option value='WHATSAPP'>WHATSAPP</option>
                                    <option value='EMAIL'>EMAIL</option>
                                </select>
                            </FormGroup>
                            <FormGroup label='Mensagem: *' htmlFor='inputMensagem'>
                                <textarea
                                    id='inputMensagem'
                                    value={mensagem}
                                    className='form-control'
                                    name='mensagem'
                                    onChange={(e) => setMensagem(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Data e hora: *' htmlFor='inputDataHora'>
                                <input
                                    type='datetime-local'
                                    id='inputDataHora'
                                    value={dataHora}
                                    className='form-control'
                                    name='dataHora'
                                    step='1'
                                    onChange={(e) => setDataHora(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Cliente: *' htmlFor='inputIdCliente'>
                                <select
                                    id='inputIdCliente'
                                    value={idCliente}
                                    className='form-select'
                                    name='idCliente'
                                    onChange={(e) => setIdCliente(e.target.value)}
                                >
                                    <option value=''>Selecione</option>
                                    {clientes.map((dado) => (
                                        <option key={dado.id} value={dado.id}>
                                            {nomeUsuario(dado.idUsuario)}
                                        </option>
                                    ))}
                                </select>
                            </FormGroup>
                            <FormGroup label='Agendamento' htmlFor='inputIdAgendamento'>
                                <select
                                    id='inputIdAgendamento'
                                    value={idAgendamento}
                                    className='form-select'
                                    name='idAgendamento'
                                    onChange={(e) => setIdAgendamento(e.target.value)}
                                >
                                    <option value=''>Selecione</option>
                                    {agendamentos.map((dado) => (
                                        <option key={dado.id} value={dado.id}>
                                            {dado.dataHora}
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
                                    onClick={() => navigate(`/listagem-notificacao`)}
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

export default CadastroNotificacao;
