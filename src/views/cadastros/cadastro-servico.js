import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../../components/card';
import FormGroup from '../../components/form-group';

import { mensagemSucesso, mensagemErro } from '../../components/toastr';

import '../../custom.css';

import axios from 'axios';
import { BASE_URL } from '../../config/axios';

function CadastroServico() {
    const { idParam } = useParams();
    const navigate = useNavigate();
    const baseURL = `${BASE_URL}/Servicos`;


    const [id, setId] = useState('');
    const [nome, setNome] = useState('');
    const [preco, setPreco] = useState('');
    const [pontosGerados, setPontosGerados] = useState('');
    const [tempoDuracao, setTempoDuracao] = useState('');
    const [tempoIntervalo, setTempoIntervalo] = useState('');
    const [vagas, setVagas] = useState('');
    const [descricao, setDescricao] = useState('');
    const [ativo, setAtivo] = useState(false);
    const [idLavaJato, setIdLavaJato] = useState('');
    const [lavaJatos, setLavaJatos] = useState([]);

    async function salvar() {
        if (!nome.trim()) {
            mensagemErro('Informe: Nome');
            return;
        }
        if (preco === '') {
            mensagemErro('Informe: Preço');
            return;
        }
        if (pontosGerados === '') {
            mensagemErro('Informe: Pontos gerados');
            return;
        }
        if (tempoDuracao === '') {
            mensagemErro('Informe: Duração (min)');
            return;
        }
        if (tempoIntervalo === '') {
            mensagemErro('Informe: Intervalo (min)');
            return;
        }
        if (vagas === '') {
            mensagemErro('Informe: Vagas');
            return;
        }
        if (!descricao.trim()) {
            mensagemErro('Informe: Descrição');
            return;
        }
        if (idLavaJato === '') {
            mensagemErro('Informe: Lava-jato');
            return;
        }

        let data = {
            id,
            nome,
            preco: Number(preco),
            pontosGerados: Number(pontosGerados),
            tempoDuracao: Number(tempoDuracao),
            tempoIntervalo: Number(tempoIntervalo),
            vagas: Number(vagas),
            descricao,
            ativo,
            idLavaJato,
        };
        data = JSON.stringify(data);
        if (idParam == null) {
            await axios
                .post(baseURL, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Serviço cadastrado com sucesso!`);
                    navigate(`/listagem-servico`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao cadastrar o serviço');
                });
        } else {
            await axios
                .put(`${baseURL}/${idParam}`, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Serviço alterado com sucesso!`);
                    navigate(`/listagem-servico`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao alterar o serviço');
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
                setPreco(response.data.preco ?? '');
                setPontosGerados(response.data.pontosGerados ?? '');
                setTempoDuracao(response.data.tempoDuracao ?? '');
                setTempoIntervalo(response.data.tempoIntervalo ?? '');
                setVagas(response.data.vagas ?? '');
                setDescricao(response.data.descricao ?? '');
                setAtivo(response.data.ativo);
                setIdLavaJato(response.data.idLavaJato ?? '');
            })
            .catch(function (error) {
                mensagemErro('Serviço não encontrado');
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
            <Card title='Cadastro de Serviço'>
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
                            <FormGroup label='Preço: *' htmlFor='inputPreco'>
                                <input
                                    type='number'
                                    id='inputPreco'
                                    value={preco}
                                    className='form-control'
                                    name='preco'
                                    min='0'
                                    onChange={(e) => setPreco(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Pontos gerados: *' htmlFor='inputPontosGerados'>
                                <input
                                    type='number'
                                    id='inputPontosGerados'
                                    value={pontosGerados}
                                    className='form-control'
                                    name='pontosGerados'
                                    min='0'
                                    onChange={(e) => setPontosGerados(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Duração (min): *' htmlFor='inputTempoDuracao'>
                                <input
                                    type='number'
                                    id='inputTempoDuracao'
                                    value={tempoDuracao}
                                    className='form-control'
                                    name='tempoDuracao'
                                    min='0'
                                    onChange={(e) => setTempoDuracao(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Intervalo (min): *' htmlFor='inputTempoIntervalo'>
                                <input
                                    type='number'
                                    id='inputTempoIntervalo'
                                    value={tempoIntervalo}
                                    className='form-control'
                                    name='tempoIntervalo'
                                    min='0'
                                    onChange={(e) => setTempoIntervalo(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Vagas: *' htmlFor='inputVagas'>
                                <input
                                    type='number'
                                    id='inputVagas'
                                    value={vagas}
                                    className='form-control'
                                    name='vagas'
                                    min='0'
                                    onChange={(e) => setVagas(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Descrição: *' htmlFor='inputDescricao'>
                                <textarea
                                    id='inputDescricao'
                                    value={descricao}
                                    className='form-control'
                                    name='descricao'
                                    onChange={(e) => setDescricao(e.target.value)}
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
                                    onClick={() => navigate(`/listagem-servico`)}
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

export default CadastroServico;
