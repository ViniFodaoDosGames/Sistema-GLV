import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../../components/card';
import FormGroup from '../../components/form-group';

import { mensagemSucesso, mensagemErro } from '../../components/toastr';

import '../../custom.css';

import axios from 'axios';
import { BASE_URL } from '../../config/axios';

function CadastroMarca() {
    const { idParam } = useParams();
    const navigate = useNavigate();
    const baseURL = `${BASE_URL}/Marcas`;


    const [id, setId] = useState('');
    const [nome, setNome] = useState('');
    const [ativo, setAtivo] = useState(false);

    const [dados, setDados] = React.useState([]);

    function inicializar() {
        if (idParam == null) {
            setId('');
            setNome('');
            setAtivo(false);
        } else {
            setId(dados.id);
            setNome(dados.nome);
            setAtivo(dados.ativo);
        }
    }

    async function salvar() {
        let data = {
            id,
            nome,
            ativo,
        };
        data = JSON.stringify(data);
        if (idParam == null) {
            await axios
                .post(baseURL, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Categoria ${nome} cadastrada com sucesso!`);
                    navigate(`/listagem-marcas`);
                })
                .catch(function (error) {
                    mensagemErro(error.response.data);
                });
        } else {
            await axios
                .put(`${baseURL}/${idParam}`, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Categoria ${nome} alterada com sucesso!`);
                    navigate(`/listagem-marcas`);
                })
                .catch(function (error) {
                    mensagemErro(error.response.data);
                });
        }
    }
    async function buscar() {
    if (idParam == null) return;

    await axios
        .get(`${baseURL}/${idParam}`)
        .then((response) => {
            setDados(response.data);
            setId(response.data.id);
            setNome(response.data.nome);
            setAtivo(response.data.ativo);
        })
        .catch(function (error) {
            mensagemErro('Marca não encontrada');
        });
}

useEffect(() => {
    buscar();
}, [idParam]);

useEffect(() => {
    buscar();
}, [idParam]);


    return (
        <div className='container'>
            <Card title='Cadastro de Marca'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='bs-component'>
                            <FormGroup label='Descrição: *' htmlFor='inputNome'>
                                <input
                                    type='text'
                                    id='inputNome'
                                    value={nome}
                                    className='form-control'
                                    name='nome'
                                    onChange={(e) => setNome(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Descrição: *' htmlFor='inputAtivo'>
                                <input
                                    type='checkbox'
                                    id='inputAtivo'
                                    checked={ativo}
                                    className='form-control form-check-input'
                                    name='ativo'
                                    onChange={(e) => setAtivo(e.target.value)}
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
                                    onClick={inicializar}
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

export default CadastroMarca;