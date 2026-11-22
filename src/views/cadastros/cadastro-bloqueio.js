import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../../components/card';
import FormGroup from '../../components/form-group';

import { mensagemSucesso, mensagemErro } from '../../components/toastr';

import '../../custom.css';

import axios from 'axios';
import { BASE_URL } from '../../config/axios';

function CadastroBloqueio() {
    const { idParam } = useParams();
    const navigate = useNavigate();
    const baseURL = `${BASE_URL}/Bloqueios`;


    const [id, setId] = useState('');
    const [data, setData] = useState('');
    const [diaInteiro, setDiaInteiro] = useState(false);
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFim, setHoraFim] = useState('');
    const [motivo, setMotivo] = useState('');
    const [ativo, setAtivo] = useState(false);
    const [idServico, setIdServico] = useState('');
    const [servicos, setServicos] = useState([]);

    async function salvar() {
        if (data === '') {
            mensagemErro('Informe: Data');
            return;
        }
        if (!diaInteiro && horaInicio === '') {
            mensagemErro('Informe: Horário de início');
            return;
        }
        if (!diaInteiro && horaFim === '') {
            mensagemErro('Informe: Horário de término');
            return;
        }
        if (!motivo.trim()) {
            mensagemErro('Informe: Motivo');
            return;
        }
        if (idServico === '') {
            mensagemErro('Informe: Serviço');
            return;
        }

        let dados = {
            id,
            data,
            diaInteiro,
            horaInicio: diaInteiro ? null : horaInicio.padEnd(8, ':00'),
            horaFim: diaInteiro ? null : horaFim.padEnd(8, ':00'),
            motivo,
            ativo,
            idServico,
        };
        dados = JSON.stringify(dados);
        if (idParam == null) {
            await axios
                .post(baseURL, dados, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Bloqueio cadastrado com sucesso!`);
                    navigate(`/listagem-bloqueio`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao cadastrar o bloqueio');
                });
        } else {
            await axios
                .put(`${baseURL}/${idParam}`, dados, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Bloqueio alterado com sucesso!`);
                    navigate(`/listagem-bloqueio`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao alterar o bloqueio');
                });
        }
    }

    async function buscar() {
        if (idParam == null) return;

        await axios
            .get(`${baseURL}/${idParam}`)
            .then((response) => {
                setId(response.data.id);
                setData(response.data.data ?? '');
                setDiaInteiro(response.data.diaInteiro);
                setHoraInicio(response.data.horaInicio ?? '');
                setHoraFim(response.data.horaFim ?? '');
                setMotivo(response.data.motivo ?? '');
                setAtivo(response.data.ativo);
                setIdServico(response.data.idServico ?? '');
            })
            .catch(function (error) {
                mensagemErro('Bloqueio não encontrado');
            });
    }

    useEffect(() => {
        buscar();
    }, [idParam]);

    useEffect(() => {
        axios
            .get(`${BASE_URL}/Servicos`)
            .then((response) => {
                setServicos(response.data);
            })
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
    }, []);

    return (
        <div className='container'>
            <Card title='Cadastro de Bloqueio'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='bs-component'>
                            <FormGroup label='Data: *' htmlFor='inputData'>
                                <input
                                    type='date'
                                    id='inputData'
                                    value={data}
                                    className='form-control'
                                    name='data'
                                    onChange={(e) => setData(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Dia inteiro' htmlFor='inputDiaInteiro'>
                                <input
                                    type='checkbox'
                                    id='inputDiaInteiro'
                                    checked={diaInteiro}
                                    className='form-control form-check-input'
                                    name='diaInteiro'
                                    onChange={(e) => setDiaInteiro(e.target.checked)}
                                />
                            </FormGroup>
                            <FormGroup label='Horário de início: *' htmlFor='inputHoraInicio'>
                                <input
                                    type='time'
                                    id='inputHoraInicio'
                                    value={horaInicio}
                                    className='form-control'
                                    name='horaInicio'
                                    step='1'
                                    disabled={diaInteiro}
                                    onChange={(e) => setHoraInicio(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Horário de término: *' htmlFor='inputHoraFim'>
                                <input
                                    type='time'
                                    id='inputHoraFim'
                                    value={horaFim}
                                    className='form-control'
                                    name='horaFim'
                                    step='1'
                                    disabled={diaInteiro}
                                    onChange={(e) => setHoraFim(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Motivo: *' htmlFor='inputMotivo'>
                                <input
                                    type='text'
                                    id='inputMotivo'
                                    value={motivo}
                                    className='form-control'
                                    name='motivo'
                                    onChange={(e) => setMotivo(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Ativo' htmlFor='inputAtivo'>
                                <input
                                    type='checkbox'
                                    id='inputAtivo'
                                    checked={ativo}
                                    className='form-control form-check-input'
                                    name='ativo'
                                    onChange={(e) => setAtivo(e.target.checked)}
                                />
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
                                    onClick={() => navigate(`/listagem-bloqueio`)}
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

export default CadastroBloqueio;
