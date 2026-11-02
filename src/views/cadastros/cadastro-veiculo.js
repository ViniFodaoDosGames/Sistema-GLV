import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../../components/card';
import FormGroup from '../../components/form-group';

import { mensagemSucesso, mensagemErro } from '../../components/toastr';

import '../../custom.css';

import axios from 'axios';
import { BASE_URL } from '../../config/axios';

function CadastroVeiculo() {
    const { idParam } = useParams();
    const navigate = useNavigate();
    const baseURL = `${BASE_URL}/Veiculos`;


    const [id, setId] = useState('');
    const [placa, setPlaca] = useState('');
    const [ano, setAno] = useState('');
    const [ativo, setAtivo] = useState(false);
    const [idCor, setIdCor] = useState('');
    const [idModelo, setIdModelo] = useState('');
    const [idCategoriaVeiculo, setIdCategoriaVeiculo] = useState('');
    const [cores, setCores] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [categorias, setCategorias] = useState([]);

    async function salvar() {
        if (!placa.trim()) {
            mensagemErro('Informe: Placa');
            return;
        }
        if (ano === '') {
            mensagemErro('Informe: Ano');
            return;
        }
        if (idCor === '') {
            mensagemErro('Informe: Cor');
            return;
        }
        if (idModelo === '') {
            mensagemErro('Informe: Modelo');
            return;
        }
        if (idCategoriaVeiculo === '') {
            mensagemErro('Informe: Categoria');
            return;
        }

        let data = {
            id,
            placa,
            ano: Number(ano),
            ativo,
            idCor,
            idModelo,
            idCategoriaVeiculo,
        };
        data = JSON.stringify(data);
        if (idParam == null) {
            await axios
                .post(baseURL, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Veículo cadastrado com sucesso!`);
                    navigate(`/listagem-veiculo`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao cadastrar o veículo');
                });
        } else {
            await axios
                .put(`${baseURL}/${idParam}`, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Veículo alterado com sucesso!`);
                    navigate(`/listagem-veiculo`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao alterar o veículo');
                });
        }
    }

    async function buscar() {
        if (idParam == null) return;

        await axios
            .get(`${baseURL}/${idParam}`)
            .then((response) => {
                setId(response.data.id);
                setPlaca(response.data.placa ?? '');
                setAno(response.data.ano ?? '');
                setAtivo(response.data.ativo);
                setIdCor(response.data.idCor ?? '');
                setIdModelo(response.data.idModelo ?? '');
                setIdCategoriaVeiculo(response.data.idCategoriaVeiculo ?? '');
            })
            .catch(function (error) {
                mensagemErro('Veículo não encontrado');
            });
    }

    useEffect(() => {
        buscar();
    }, [idParam]);

    useEffect(() => {
        axios
            .get(`${BASE_URL}/Cores`)
            .then((response) => {
                setCores(response.data);
            })
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
        axios
            .get(`${BASE_URL}/Modelos`)
            .then((response) => {
                setModelos(response.data);
            })
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
        axios
            .get(`${BASE_URL}/CategoriasVeiculo`)
            .then((response) => {
                setCategorias(response.data);
            })
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
    }, []);

    return (
        <div className='container'>
            <Card title='Cadastro de Veículo'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='bs-component'>
                            <FormGroup label='Placa: *' htmlFor='inputPlaca'>
                                <input
                                    type='text'
                                    id='inputPlaca'
                                    value={placa}
                                    className='form-control'
                                    name='placa'
                                    onChange={(e) => setPlaca(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Ano: *' htmlFor='inputAno'>
                                <input
                                    type='number'
                                    id='inputAno'
                                    value={ano}
                                    className='form-control'
                                    name='ano'
                                    min='0'
                                    onChange={(e) => setAno(e.target.value)}
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
                            <FormGroup label='Cor: *' htmlFor='inputIdCor'>
                                <select
                                    id='inputIdCor'
                                    value={idCor}
                                    className='form-select'
                                    name='idCor'
                                    onChange={(e) => setIdCor(e.target.value)}
                                >
                                    <option value=''>Selecione</option>
                                    {cores.map((dado) => (
                                        <option key={dado.id} value={dado.id}>
                                            {dado.nome}
                                        </option>
                                    ))}
                                </select>
                            </FormGroup>
                            <FormGroup label='Modelo: *' htmlFor='inputIdModelo'>
                                <select
                                    id='inputIdModelo'
                                    value={idModelo}
                                    className='form-select'
                                    name='idModelo'
                                    onChange={(e) => setIdModelo(e.target.value)}
                                >
                                    <option value=''>Selecione</option>
                                    {modelos.map((dado) => (
                                        <option key={dado.id} value={dado.id}>
                                            {dado.nome}
                                        </option>
                                    ))}
                                </select>
                            </FormGroup>
                            <FormGroup label='Categoria: *' htmlFor='inputIdCategoriaVeiculo'>
                                <select
                                    id='inputIdCategoriaVeiculo'
                                    value={idCategoriaVeiculo}
                                    className='form-select'
                                    name='idCategoriaVeiculo'
                                    onChange={(e) => setIdCategoriaVeiculo(e.target.value)}
                                >
                                    <option value=''>Selecione</option>
                                    {categorias.map((dado) => (
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
                                    onClick={() => navigate(`/listagem-veiculo`)}
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

export default CadastroVeiculo;
