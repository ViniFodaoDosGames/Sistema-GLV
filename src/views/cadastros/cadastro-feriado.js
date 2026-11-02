import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../../components/card';
import FormGroup from '../../components/form-group';

import { mensagemSucesso, mensagemErro } from '../../components/toastr';

import '../../custom.css';

import axios from 'axios';
import { BASE_URL } from '../../config/axios';

function CadastroFeriado() {
    const { idParam } = useParams();
    const navigate = useNavigate();
    const baseURL = `${BASE_URL}/Feriados`;


    const [id, setId] = useState('');
    const [nome, setNome] = useState('');
    const [data, setData] = useState('');
    const [ativo, setAtivo] = useState(false);
    const [idTipoFeriado, setIdTipoFeriado] = useState('');
    const [idLavaJato, setIdLavaJato] = useState('');
    const [tiposFeriado, setTiposFeriado] = useState([]);
    const [lavaJatos, setLavaJatos] = useState([]);

    async function salvar() {
        if (!nome.trim()) {
            mensagemErro('Informe: Nome');
            return;
        }
        if (data === '') {
            mensagemErro('Informe: Data');
            return;
        }
        if (idTipoFeriado === '') {
            mensagemErro('Informe: Tipo de feriado');
            return;
        }
        if (idLavaJato === '') {
            mensagemErro('Informe: Lava-jato');
            return;
        }

        let dados = {
            id,
            nome,
            data,
            ativo,
            idTipoFeriado,
            idLavaJato,
        };
        dados = JSON.stringify(dados);
        if (idParam == null) {
            await axios
                .post(baseURL, dados, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Feriado cadastrado com sucesso!`);
                    navigate(`/listagem-feriado`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao cadastrar o feriado');
                });
        } else {
            await axios
                .put(`${baseURL}/${idParam}`, dados, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Feriado alterado com sucesso!`);
                    navigate(`/listagem-feriado`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao alterar o feriado');
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
                setData(response.data.data ?? '');
                setAtivo(response.data.ativo);
                setIdTipoFeriado(response.data.idTipoFeriado ?? '');
                setIdLavaJato(response.data.idLavaJato ?? '');
            })
            .catch(function (error) {
                mensagemErro('Feriado não encontrado');
            });
    }

    useEffect(() => {
        buscar();
    }, [idParam]);

    useEffect(() => {
        axios
            .get(`${BASE_URL}/TiposFeriado`)
            .then((response) => {
                setTiposFeriado(response.data);
            })
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
        axios
            .get(`${BASE_URL}/LavaJatos`)
            .then((response) => {
                setLavaJatos(response.data);
            })
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
    }, []);

    return (
        <div className='container'>
            <Card title='Cadastro de Feriado'>
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
                            <FormGroup label='Tipo de feriado: *' htmlFor='inputIdTipoFeriado'>
                                <select
                                    id='inputIdTipoFeriado'
                                    value={idTipoFeriado}
                                    className='form-select'
                                    name='idTipoFeriado'
                                    onChange={(e) => setIdTipoFeriado(e.target.value)}
                                >
                                    <option value=''>Selecione</option>
                                    {tiposFeriado.map((dado) => (
                                        <option key={dado.id} value={dado.id}>
                                            {dado.nome}
                                        </option>
                                    ))}
                                </select>
                            </FormGroup>
                            <FormGroup label='Lava-jato: *' htmlFor='inputIdLavaJato'>
                                <select
                                    id='inputIdLavaJato'
                                    value={idLavaJato}
                                    className='form-select'
                                    name='idLavaJato'
                                    onChange={(e) => setIdLavaJato(e.target.value)}
                                >
                                    <option value=''>Selecione</option>
                                    {lavaJatos.map((dado) => (
                                        <option key={dado.id} value={dado.id}>
                                            {dado.id}
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
                                    onClick={() => navigate(`/listagem-feriado`)}
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

export default CadastroFeriado;
