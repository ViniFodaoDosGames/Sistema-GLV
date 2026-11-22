import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
    const baseURL = `${BASE_URL}/Modelos`;


    const [id, setId] = useState('');
    const [nome, setNome] = useState('');
    const [ativo, setAtivo] = useState(false);
    const [idMarca, setIdMarca] = useState('');
    const [marcas, setMarcas] = useState([]);

    async function salvar() {
        if (!nome.trim()) {
            mensagemErro('Informe: Nome');
            return;
        }
        if (idMarca === '') {
            mensagemErro('Informe: Marca');
            return;
        }

        let data = {
            id,
            nome,
            ativo,
            idMarca,
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
                            <Stack spacing={1} padding={1} direction='row'>
                                <button
                                    onClick={salvar}
                                    type='button'
                                    className='btn btn-success'
                                >
                                    Salvar
                                </button>
                                <button
                                    onClick={() => navigate(`/listagem-modelo`)}
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
