import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../../components/card';
import FormGroup from '../../components/form-group';

import { mensagemSucesso, mensagemErro } from '../../components/toastr';

import '../../custom.css';

import axios from 'axios';
import { BASE_URL } from '../../config/axios';

function CadastroLotePonto() {
    const { idParam } = useParams();
    const navigate = useNavigate();
    const baseURL = `${BASE_URL}/LotesPontos`;


    const [id, setId] = useState('');
    const [tipo, setTipo] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [saldo, setSaldo] = useState('');
    const [geradoEm, setGeradoEm] = useState('');
    const [expiraEm, setExpiraEm] = useState('');
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
        if (tipo === '') {
            mensagemErro('Informe: Tipo');
            return;
        }
        if (quantidade === '') {
            mensagemErro('Informe: Quantidade');
            return;
        }
        if (saldo === '') {
            mensagemErro('Informe: Saldo');
            return;
        }
        if (geradoEm === '') {
            mensagemErro('Informe: Gerado em');
            return;
        }
        if (expiraEm === '') {
            mensagemErro('Informe: Expira em');
            return;
        }
        if (idCliente === '') {
            mensagemErro('Informe: Cliente');
            return;
        }

        let data = {
            id,
            tipo,
            quantidade: Number(quantidade),
            saldo: Number(saldo),
            geradoEm,
            expiraEm,
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
                    mensagemSucesso(`Lote de pontos cadastrado com sucesso!`);
                    navigate(`/listagem-lote-ponto`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao cadastrar o lote de pontos');
                });
        } else {
            await axios
                .put(`${baseURL}/${idParam}`, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Lote de pontos alterado com sucesso!`);
                    navigate(`/listagem-lote-ponto`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao alterar o lote de pontos');
                });
        }
    }

    async function buscar() {
        if (idParam == null) return;

        await axios
            .get(`${baseURL}/${idParam}`)
            .then((response) => {
                setId(response.data.id);
                setTipo(response.data.tipo ?? '');
                setQuantidade(response.data.quantidade ?? '');
                setSaldo(response.data.saldo ?? '');
                setGeradoEm(response.data.geradoEm ?? '');
                setExpiraEm(response.data.expiraEm ?? '');
                setIdCliente(response.data.idCliente ?? '');
                setIdAgendamento(response.data.idAgendamento ?? '');
            })
            .catch(function (error) {
                mensagemErro('Lote de pontos não encontrado');
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
            <Card title='Cadastro de Lote de Pontos'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='bs-component'>
                            <FormGroup label='Tipo: *' htmlFor='inputTipo'>
                                <select
                                    id='inputTipo'
                                    value={tipo}
                                    className='form-select'
                                    name='tipo'
                                    onChange={(e) => setTipo(e.target.value)}
                                >
                                    <option value=''>Selecione</option>
                                    <option value='FIDELIDADE'>FIDELIDADE</option>
                                    <option value='COMPENSACAO'>COMPENSACAO</option>
                                </select>
                            </FormGroup>
                            <FormGroup label='Quantidade: *' htmlFor='inputQuantidade'>
                                <input
                                    type='number'
                                    id='inputQuantidade'
                                    value={quantidade}
                                    className='form-control'
                                    name='quantidade'
                                    min='0'
                                    onChange={(e) => setQuantidade(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Saldo: *' htmlFor='inputSaldo'>
                                <input
                                    type='number'
                                    id='inputSaldo'
                                    value={saldo}
                                    className='form-control'
                                    name='saldo'
                                    min='0'
                                    onChange={(e) => setSaldo(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Gerado em: *' htmlFor='inputGeradoEm'>
                                <input
                                    type='date'
                                    id='inputGeradoEm'
                                    value={geradoEm}
                                    className='form-control'
                                    name='geradoEm'
                                    onChange={(e) => setGeradoEm(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Expira em: *' htmlFor='inputExpiraEm'>
                                <input
                                    type='date'
                                    id='inputExpiraEm'
                                    value={expiraEm}
                                    className='form-control'
                                    name='expiraEm'
                                    onChange={(e) => setExpiraEm(e.target.value)}
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
                                    onClick={() => navigate(`/listagem-lote-ponto`)}
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

export default CadastroLotePonto;
