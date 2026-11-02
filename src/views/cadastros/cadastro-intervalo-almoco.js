import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../../components/card';
import FormGroup from '../../components/form-group';

import { mensagemSucesso, mensagemErro } from '../../components/toastr';

import '../../custom.css';

import axios from 'axios';
import { BASE_URL } from '../../config/axios';

function CadastroIntervaloAlmoco() {
    const { idParam } = useParams();
    const navigate = useNavigate();
    const baseURL = `${BASE_URL}/IntervalosAlmoco`;


    const [id, setId] = useState('');
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFim, setHoraFim] = useState('');
    const [idLavaJato, setIdLavaJato] = useState('');
    const [lavaJatos, setLavaJatos] = useState([]);

    async function salvar() {
        if (horaInicio === '') {
            mensagemErro('Informe: Horário de início');
            return;
        }
        if (horaFim === '') {
            mensagemErro('Informe: Horário de término');
            return;
        }
        if (idLavaJato === '') {
            mensagemErro('Informe: Lava-jato');
            return;
        }

        let data = {
            id,
            horaInicio: horaInicio.padEnd(8, ':00'),
            horaFim: horaFim.padEnd(8, ':00'),
            idLavaJato,
        };
        data = JSON.stringify(data);
        if (idParam == null) {
            await axios
                .post(baseURL, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Intervalo cadastrado com sucesso!`);
                    navigate(`/listagem-intervalo-almoço`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao cadastrar o intervalo');
                });
        } else {
            await axios
                .put(`${baseURL}/${idParam}`, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Intervalo alterado com sucesso!`);
                    navigate(`/listagem-intervalo-almoço`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao alterar o intervalo');
                });
        }
    }

    async function buscar() {
        if (idParam == null) return;

        await axios
            .get(`${baseURL}/${idParam}`)
            .then((response) => {
                setId(response.data.id);
                setHoraInicio(response.data.horaInicio ?? '');
                setHoraFim(response.data.horaFim ?? '');
                setIdLavaJato(response.data.idLavaJato ?? '');
            })
            .catch(function (error) {
                mensagemErro('Intervalo não encontrado');
            });
    }

    useEffect(() => {
        buscar();
    }, [idParam]);

    useEffect(() => {
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
            <Card title='Cadastro de Intervalo de Almoço'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='bs-component'>
                            <FormGroup label='Horário de início: *' htmlFor='inputHoraInicio'>
                                <input
                                    type='time'
                                    id='inputHoraInicio'
                                    value={horaInicio}
                                    className='form-control'
                                    name='horaInicio'
                                    step='1'
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
                                    onChange={(e) => setHoraFim(e.target.value)}
                                />
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
                                    onClick={() => navigate(`/listagem-intervalo-almoço`)}
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

export default CadastroIntervaloAlmoco;
