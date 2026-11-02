import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../../components/card';
import FormGroup from '../../components/form-group';

import { mensagemSucesso, mensagemErro } from '../../components/toastr';

import '../../custom.css';

import axios from 'axios';
import { BASE_URL } from '../../config/axios';

function CadastroPagamento() {
    const { idParam } = useParams();
    const navigate = useNavigate();
    const baseURL = `${BASE_URL}/Pagamentos`;


    const [id, setId] = useState('');
    const [forma, setForma] = useState('');
    const [status, setStatus] = useState('');
    const [valor, setValor] = useState('');
    const [dataHora, setDataHora] = useState('');
    const [codigoGateway, setCodigoGateway] = useState('');
    const [justificativaEstorno, setJustificativaEstorno] = useState('');
    const [idAgendamento, setIdAgendamento] = useState('');
    const [idFuncionario, setIdFuncionario] = useState('');
    const [agendamentos, setAgendamentos] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [usuarios, setUsuarios] = useState([]);

    function nomeUsuario(idUsuario) {
        const usuario = usuarios.find((dado) => dado.id === idUsuario);
        return usuario ? usuario.nome : idUsuario;
    }

    async function salvar() {
        if (forma === '') {
            mensagemErro('Informe: Forma');
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
        if (dataHora === '') {
            mensagemErro('Informe: Data e hora');
            return;
        }
        if (idAgendamento === '') {
            mensagemErro('Informe: Agendamento');
            return;
        }

        let data = {
            id,
            forma,
            status,
            valor: Number(valor),
            dataHora: dataHora.replace('T', ' ').padEnd(19, ':00'),
            codigoGateway: codigoGateway || null,
            justificativaEstorno: justificativaEstorno || null,
            idAgendamento,
            idFuncionario: idFuncionario || null,
        };
        data = JSON.stringify(data);
        if (idParam == null) {
            await axios
                .post(baseURL, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Pagamento cadastrado com sucesso!`);
                    navigate(`/listagem-pagamento`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao cadastrar o pagamento');
                });
        } else {
            await axios
                .put(`${baseURL}/${idParam}`, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Pagamento alterado com sucesso!`);
                    navigate(`/listagem-pagamento`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao alterar o pagamento');
                });
        }
    }

    async function buscar() {
        if (idParam == null) return;

        await axios
            .get(`${baseURL}/${idParam}`)
            .then((response) => {
                setId(response.data.id);
                setForma(response.data.forma ?? '');
                setStatus(response.data.status ?? '');
                setValor(response.data.valor ?? '');
                setDataHora(response.data.dataHora.replace(' ', 'T'));
                setCodigoGateway(response.data.codigoGateway ?? '');
                setJustificativaEstorno(response.data.justificativaEstorno ?? '');
                setIdAgendamento(response.data.idAgendamento ?? '');
                setIdFuncionario(response.data.idFuncionario ?? '');
            })
            .catch(function (error) {
                mensagemErro('Pagamento não encontrado');
            });
    }

    useEffect(() => {
        buscar();
    }, [idParam]);

    useEffect(() => {
        axios
            .get(`${BASE_URL}/Agendamentos`)
            .then((response) => {
                setAgendamentos(response.data);
            })
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
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
            <Card title='Cadastro de Pagamento'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='bs-component'>
                            <FormGroup label='Forma: *' htmlFor='inputForma'>
                                <select
                                    id='inputForma'
                                    value={forma}
                                    className='form-select'
                                    name='forma'
                                    onChange={(e) => setForma(e.target.value)}
                                >
                                    <option value=''>Selecione</option>
                                    <option value='PIX'>PIX</option>
                                    <option value='CARTAO'>CARTAO</option>
                                    <option value='PONTOS'>PONTOS</option>
                                </select>
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
                                    <option value='PENDENTE'>PENDENTE</option>
                                    <option value='APROVADO'>APROVADO</option>
                                    <option value='ESTORNADO'>ESTORNADO</option>
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
                            <FormGroup label='Código do gateway' htmlFor='inputCodigoGateway'>
                                <input
                                    type='text'
                                    id='inputCodigoGateway'
                                    value={codigoGateway}
                                    className='form-control'
                                    name='codigoGateway'
                                    onChange={(e) => setCodigoGateway(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Justificativa do estorno' htmlFor='inputJustificativaEstorno'>
                                <input
                                    type='text'
                                    id='inputJustificativaEstorno'
                                    value={justificativaEstorno}
                                    className='form-control'
                                    name='justificativaEstorno'
                                    onChange={(e) => setJustificativaEstorno(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Agendamento: *' htmlFor='inputIdAgendamento'>
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
                            <FormGroup label='Funcionário' htmlFor='inputIdFuncionario'>
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
                                    onClick={() => navigate(`/listagem-pagamento`)}
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

export default CadastroPagamento;
