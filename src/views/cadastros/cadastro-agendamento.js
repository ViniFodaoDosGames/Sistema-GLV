import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../../components/card';
import FormGroup from '../../components/form-group';

import { mensagemSucesso, mensagemErro } from '../../components/toastr';

import '../../custom.css';

import axios from 'axios';
import { BASE_URL } from '../../config/axios';

function CadastroAgendamento() {
    const { idParam } = useParams();
    const navigate = useNavigate();
    const baseURL = `${BASE_URL}/Agendamentos`;


    const [id, setId] = useState('');
    const [dataHora, setDataHora] = useState('');
    const [status, setStatus] = useState('');
    const [valor, setValor] = useState('');
    const [walkIn, setWalkIn] = useState(false);
    const [posicaoFila, setPosicaoFila] = useState('');
    const [idCliente, setIdCliente] = useState('');
    const [idVeiculo, setIdVeiculo] = useState('');
    const [idServico, setIdServico] = useState('');
    const [clientes, setClientes] = useState([]);
    const [veiculos, setVeiculos] = useState([]);
    const [servicos, setServicos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);

    function nomeUsuario(idUsuario) {
        const usuario = usuarios.find((dado) => dado.id === idUsuario);
        return usuario ? usuario.nome : idUsuario;
    }

    async function salvar() {
        if (dataHora === '') {
            mensagemErro('Informe: Data e hora');
            return;
        }
        if (status === '') {
            mensagemErro('Informe: Status');
            return;
        }
        if (valor === '') {
            mensagemErro('Informe: Valor');
            return;
        }
        if (posicaoFila === '') {
            mensagemErro('Informe: Posição na fila');
            return;
        }
        if (idCliente === '') {
            mensagemErro('Informe: Cliente');
            return;
        }
        if (idVeiculo === '') {
            mensagemErro('Informe: Veículo');
            return;
        }
        if (idServico === '') {
            mensagemErro('Informe: Serviço');
            return;
        }

        let data = {
            id,
            dataHora: dataHora.replace('T', ' ').padEnd(19, ':00'),
            status,
            valor: Number(valor),
            walkIn,
            posicaoFila: Number(posicaoFila),
            idCliente,
            idVeiculo,
            idServico,
        };
        data = JSON.stringify(data);
        if (idParam == null) {
            await axios
                .post(baseURL, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Agendamento cadastrado com sucesso!`);
                    navigate(`/listagem-agendamento`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao cadastrar o agendamento');
                });
        } else {
            await axios
                .put(`${baseURL}/${idParam}`, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Agendamento alterado com sucesso!`);
                    navigate(`/listagem-agendamento`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao alterar o agendamento');
                });
        }
    }

    async function buscar() {
        if (idParam == null) return;

        await axios
            .get(`${baseURL}/${idParam}`)
            .then((response) => {
                setId(response.data.id);
                setDataHora(response.data.dataHora.replace(' ', 'T'));
                setStatus(response.data.status ?? '');
                setValor(response.data.valor ?? '');
                setWalkIn(response.data.walkIn);
                setPosicaoFila(response.data.posicaoFila ?? '');
                setIdCliente(response.data.idCliente ?? '');
                setIdVeiculo(response.data.idVeiculo ?? '');
                setIdServico(response.data.idServico ?? '');
            })
            .catch(function (error) {
                mensagemErro('Agendamento não encontrado');
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
            .get(`${BASE_URL}/Veiculos`)
            .then((response) => {
                setVeiculos(response.data);
            })
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
        axios
            .get(`${BASE_URL}/Servicos`)
            .then((response) => {
                setServicos(response.data);
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
            <Card title='Cadastro de Agendamento'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='bs-component'>
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
                            <FormGroup label='Status: *' htmlFor='inputStatus'>
                                <select
                                    id='inputStatus'
                                    value={status}
                                    className='form-select'
                                    name='status'
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value=''>Selecione</option>
                                    <option value='AGUARDANDO_PAGAMENTO'>AGUARDANDO_PAGAMENTO</option>
                                    <option value='CONFIRMADO'>CONFIRMADO</option>
                                    <option value='CONCLUIDO'>CONCLUIDO</option>
                                </select>
                            </FormGroup>
                            <FormGroup label='Valor: *' htmlFor='inputValor'>
                                <input
                                    type='number'
                                    id='inputValor'
                                    value={valor}
                                    className='form-control'
                                    name='valor'
                                    min='0'
                                    onChange={(e) => setValor(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Walk-in' htmlFor='inputWalkIn'>
                                <input
                                    type='checkbox'
                                    id='inputWalkIn'
                                    checked={walkIn}
                                    className='form-control form-check-input'
                                    name='walkIn'
                                    onChange={(e) => setWalkIn(e.target.checked)}
                                />
                            </FormGroup>
                            <FormGroup label='Posição na fila: *' htmlFor='inputPosicaoFila'>
                                <input
                                    type='number'
                                    id='inputPosicaoFila'
                                    value={posicaoFila}
                                    className='form-control'
                                    name='posicaoFila'
                                    min='0'
                                    onChange={(e) => setPosicaoFila(e.target.value)}
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
                            <FormGroup label='Veículo: *' htmlFor='inputIdVeiculo'>
                                <select
                                    id='inputIdVeiculo'
                                    value={idVeiculo}
                                    className='form-select'
                                    name='idVeiculo'
                                    onChange={(e) => setIdVeiculo(e.target.value)}
                                >
                                    <option value=''>Selecione</option>
                                    {veiculos.map((dado) => (
                                        <option key={dado.id} value={dado.id}>
                                            {dado.placa}
                                        </option>
                                    ))}
                                </select>
                            </FormGroup>
                            <FormGroup label='Serviço: *' htmlFor='inputIdServico'>
                                <select
                                    id='inputIdServico'
                                    value={idServico}
                                    className='form-select'
                                    name='idServico'
                                    onChange={(e) => setIdServico(e.target.value)}
                                >
                                    <option value=''>Selecione</option>
                                    {servicos.map((dado) => (
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
                                    onClick={() => navigate(`/listagem-agendamento`)}
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

export default CadastroAgendamento;
