import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../../components/card';
import FormGroup from '../../components/form-group';

import { mensagemSucesso, mensagemErro } from '../../components/toastr';

import '../../custom.css';

import axios from 'axios';
import { BASE_URL } from '../../config/axios';

function CadastroHorarioFuncionamento() {
    const { idParam } = useParams();
    const navigate = useNavigate();
    const baseURL = `${BASE_URL}/HorariosFuncionamento`;


    const [id, setId] = useState('');
    const [diaSemana, setDiaSemana] = useState('');
    const [aberto, setAberto] = useState(false);
    const [horaAbertura, setHoraAbertura] = useState('');
    const [horaFechamento, setHoraFechamento] = useState('');
    const [idLavaJato, setIdLavaJato] = useState('');
    const [lavaJatos, setLavaJatos] = useState([]);

    async function salvar() {
        if (diaSemana === '') {
            mensagemErro('Informe: Dia da semana');
            return;
        }
        if (aberto && horaAbertura === '') {
            mensagemErro('Informe: Horário de abertura');
            return;
        }
        if (aberto && horaFechamento === '') {
            mensagemErro('Informe: Horário de fechamento');
            return;
        }
        if (idLavaJato === '') {
            mensagemErro('Informe: Lava-jato');
            return;
        }

        let data = {
            id,
            diaSemana,
            aberto,
            horaAbertura: !aberto ? null : horaAbertura.padEnd(8, ':00'),
            horaFechamento: !aberto ? null : horaFechamento.padEnd(8, ':00'),
            idLavaJato,
        };
        data = JSON.stringify(data);
        if (idParam == null) {
            await axios
                .post(baseURL, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Horário cadastrado com sucesso!`);
                    navigate(`/listagem-horario-funcionamento`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao cadastrar o horário');
                });
        } else {
            await axios
                .put(`${baseURL}/${idParam}`, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Horário alterado com sucesso!`);
                    navigate(`/listagem-horario-funcionamento`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao alterar o horário');
                });
        }
    }

    async function buscar() {
        if (idParam == null) return;

        await axios
            .get(`${baseURL}/${idParam}`)
            .then((response) => {
                setId(response.data.id);
                setDiaSemana(response.data.diaSemana ?? '');
                setAberto(response.data.aberto);
                setHoraAbertura(response.data.horaAbertura ?? '');
                setHoraFechamento(response.data.horaFechamento ?? '');
                setIdLavaJato(response.data.idLavaJato ?? '');
            })
            .catch(function (error) {
                mensagemErro('Horário não encontrado');
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
            <Card title='Cadastro de Horário de Funcionamento'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='bs-component'>
                            <FormGroup label='Dia da semana: *' htmlFor='inputDiaSemana'>
                                <select
                                    id='inputDiaSemana'
                                    value={diaSemana}
                                    className='form-select'
                                    name='diaSemana'
                                    onChange={(e) => setDiaSemana(e.target.value)}
                                >
                                    <option value=''>Selecione</option>
                                    <option value='DOMINGO'>DOMINGO</option>
                                    <option value='SEGUNDA'>SEGUNDA</option>
                                    <option value='TERCA'>TERCA</option>
                                    <option value='QUARTA'>QUARTA</option>
                                    <option value='QUINTA'>QUINTA</option>
                                    <option value='SEXTA'>SEXTA</option>
                                    <option value='SABADO'>SABADO</option>
                                </select>
                            </FormGroup>
                            <FormGroup label='Aberto' htmlFor='inputAberto'>
                                <input
                                    type='checkbox'
                                    id='inputAberto'
                                    checked={aberto}
                                    className='form-control form-check-input'
                                    name='aberto'
                                    onChange={(e) => setAberto(e.target.checked)}
                                />
                            </FormGroup>
                            <FormGroup label='Horário de abertura: *' htmlFor='inputHoraAbertura'>
                                <input
                                    type='time'
                                    id='inputHoraAbertura'
                                    value={horaAbertura}
                                    className='form-control'
                                    name='horaAbertura'
                                    step='1'
                                    disabled={!aberto}
                                    onChange={(e) => setHoraAbertura(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Horário de fechamento: *' htmlFor='inputHoraFechamento'>
                                <input
                                    type='time'
                                    id='inputHoraFechamento'
                                    value={horaFechamento}
                                    className='form-control'
                                    name='horaFechamento'
                                    step='1'
                                    disabled={!aberto}
                                    onChange={(e) => setHoraFechamento(e.target.value)}
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
                                    onClick={() => navigate(`/listagem-horario-funcionamento`)}
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

export default CadastroHorarioFuncionamento;
