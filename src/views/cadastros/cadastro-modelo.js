import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../../components/card';
import FormGroup from '../../components/form-group';

import { mensagemSucesso, mensagemErro } from '../../components/toastr';

import '../../custom.css';

import axios from 'axios';
import { BASE_URL } from '../../config/axios';

function CadastroModelo() {
    const { idParam } = useParams();
    const navigate = useNavigate();
    const { cancelar } = useOutletContext();
    const baseURL = `${BASE_URL}/Modelos`;


    const [id, setId] = useState('');
    const [nome, setNome] = useState('');
    const [ativo, setAtivo] = useState(false);
    const [idMarca, setIdMarca] = useState('');
    const [idCategoriaVeiculo, setIdCategoriaVeiculo] = useState('');
    const [anoInicio, setAnoInicio] = useState('');
    const [anoFim, setAnoFim] = useState('');
    const [marcas, setMarcas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const anoAtual = new Date().getFullYear();

    async function salvar() {
        if (!nome.trim()) {
            mensagemErro('Informe: Nome');
            return;
        }
        if (idMarca === '') {
            mensagemErro('Informe: Marca');
            return;
        }
        if (idCategoriaVeiculo === '') {
            mensagemErro('Informe: Categoria');
            return;
        }
        if (anoInicio === '' || Number(anoInicio) < 1900 || Number(anoInicio) > anoAtual) {
            mensagemErro(`Informe o ano em que o modelo começou a ser fabricado (entre 1900 e ${anoAtual})`);
            return;
        }
        if (anoFim !== '' && (Number(anoFim) < Number(anoInicio) || Number(anoFim) > anoAtual)) {
            mensagemErro(`O ano final deve ficar entre ${anoInicio} e ${anoAtual}, ou vazio se o modelo ainda é fabricado`);
            return;
        }

        let data = {
            id,
            nome,
            ativo,
            idMarca,
            idCategoriaVeiculo,
            anoInicio: Number(anoInicio),
            anoFim: anoFim === '' ? null : Number(anoFim),
        };
        data = JSON.stringify(data);
        if (idParam == null) {
            await axios
                .post(baseURL, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Modelo cadastrado com sucesso!`);
                    navigate(`/listagem-modelo`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao cadastrar o modelo');
                });
        } else {
            await axios
                .put(`${baseURL}/${idParam}`, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Modelo alterado com sucesso!`);
                    navigate(`/listagem-modelo`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao alterar o modelo');
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
                setAtivo(response.data.ativo);
                setIdMarca(response.data.idMarca ?? '');
                setIdCategoriaVeiculo(response.data.idCategoriaVeiculo ?? '');
                setAnoInicio(response.data.anoInicio ?? '');
                setAnoFim(response.data.anoFim ?? '');
            })
            .catch(function (error) {
                mensagemErro('Modelo não encontrado');
            });
    }

    useEffect(() => {
        buscar();
    }, [idParam]);

    useEffect(() => {
        axios
            .get(`${BASE_URL}/Marcas`)
            .then((response) => {
                setMarcas(response.data);
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
            <Card title='Cadastro de Modelo'>
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
                            <FormGroup label='Marca: *' htmlFor='inputIdMarca'>
                                <select
                                    id='inputIdMarca'
                                    value={idMarca}
                                    className='form-select'
                                    name='idMarca'
                                    onChange={(e) => setIdMarca(e.target.value)}
                                >
                                    <option value=''>Selecione</option>
                                    {marcas.map((dado) => (
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
                            <FormGroup label='Fabricado desde (ano): *' htmlFor='inputAnoInicio'>
                                <input
                                    type='number'
                                    id='inputAnoInicio'
                                    value={anoInicio}
                                    className='form-control'
                                    name='anoInicio'
                                    min='1900'
                                    max={anoAtual}
                                    onChange={(e) => setAnoInicio(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Fabricado até (ano, vazio se ainda é fabricado)' htmlFor='inputAnoFim'>
                                <input
                                    type='number'
                                    id='inputAnoFim'
                                    value={anoFim}
                                    className='form-control'
                                    name='anoFim'
                                    min='1900'
                                    max={anoAtual}
                                    onChange={(e) => setAnoFim(e.target.value)}
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
                                    onClick={() => cancelar(`/listagem-modelo`)}
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

export default CadastroModelo;
