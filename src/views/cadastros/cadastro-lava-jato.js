import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../../components/card';
import FormGroup from '../../components/form-group';

import { mensagemSucesso, mensagemErro } from '../../components/toastr';

import '../../custom.css';

import axios from 'axios';
import { BASE_URL } from '../../config/axios';

function CadastroLavaJato() {
    const { idParam } = useParams();
    const navigate = useNavigate();
    const baseURL = `${BASE_URL}/LavaJatos`;


    const [id, setId] = useState('');
    const [totalPosicoes, setTotalPosicoes] = useState('');
    const [fatorFidelidade, setFatorFidelidade] = useState('');
    const [validadePontosFidelidade, setValidadePontosFidelidade] = useState('');
    const [validadePontosCompensacao, setValidadePontosCompensacao] = useState('');
    const [ativo, setAtivo] = useState(false);

    async function salvar() {
        if (totalPosicoes === '') {
            mensagemErro('Informe: Total de posições');
            return;
        }
        if (fatorFidelidade === '') {
            mensagemErro('Informe: Fator de fidelidade');
            return;
        }
        if (validadePontosFidelidade === '') {
            mensagemErro('Informe: Validade dos pontos de fidelidade (dias)');
            return;
        }
        if (validadePontosCompensacao === '') {
            mensagemErro('Informe: Validade dos pontos de compensação (dias)');
            return;
        }

        let data = {
            id,
            totalPosicoes: Number(totalPosicoes),
            fatorFidelidade: Number(fatorFidelidade),
            validadePontosFidelidade: Number(validadePontosFidelidade),
            validadePontosCompensacao: Number(validadePontosCompensacao),
            ativo,
        };
        data = JSON.stringify(data);
        if (idParam == null) {
            await axios
                .post(baseURL, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Parâmetro cadastrado com sucesso!`);
                    navigate(`/listagem-lavajato`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao cadastrar o parâmetro');
                });
        } else {
            await axios
                .put(`${baseURL}/${idParam}`, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(function (response) {
                    mensagemSucesso(`Parâmetro alterado com sucesso!`);
                    navigate(`/listagem-lavajato`);
                })
                .catch(function (error) {
                    mensagemErro('Erro ao alterar o parâmetro');
                });
        }
    }

    async function buscar() {
        if (idParam == null) return;

        await axios
            .get(`${baseURL}/${idParam}`)
            .then((response) => {
                setId(response.data.id);
                setTotalPosicoes(response.data.totalPosicoes ?? '');
                setFatorFidelidade(response.data.fatorFidelidade ?? '');
                setValidadePontosFidelidade(response.data.validadePontosFidelidade ?? '');
                setValidadePontosCompensacao(response.data.validadePontosCompensacao ?? '');
                setAtivo(response.data.ativo);
            })
            .catch(function (error) {
                mensagemErro('Parâmetro não encontrado');
            });
    }

    useEffect(() => {
        buscar();
    }, [idParam]);

    return (
        <div className='container'>
            <Card title='Cadastro de Parâmetros do LavaJato'>
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='bs-component'>
                            <FormGroup label='Total de posições: *' htmlFor='inputTotalPosicoes'>
                                <input
                                    type='number'
                                    id='inputTotalPosicoes'
                                    value={totalPosicoes}
                                    className='form-control'
                                    name='totalPosicoes'
                                    min='0'
                                    onChange={(e) => setTotalPosicoes(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Fator de fidelidade: *' htmlFor='inputFatorFidelidade'>
                                <input
                                    type='number'
                                    id='inputFatorFidelidade'
                                    value={fatorFidelidade}
                                    className='form-control'
                                    name='fatorFidelidade'
                                    min='0'
                                    onChange={(e) => setFatorFidelidade(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Validade dos pontos de fidelidade (dias): *' htmlFor='inputValidadePontosFidelidade'>
                                <input
                                    type='number'
                                    id='inputValidadePontosFidelidade'
                                    value={validadePontosFidelidade}
                                    className='form-control'
                                    name='validadePontosFidelidade'
                                    min='0'
                                    onChange={(e) => setValidadePontosFidelidade(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label='Validade dos pontos de compensação (dias): *' htmlFor='inputValidadePontosCompensacao'>
                                <input
                                    type='number'
                                    id='inputValidadePontosCompensacao'
                                    value={validadePontosCompensacao}
                                    className='form-control'
                                    name='validadePontosCompensacao'
                                    min='0'
                                    onChange={(e) => setValidadePontosCompensacao(e.target.value)}
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
                            <Stack spacing={1} padding={1} direction='row'>
                                <button
                                    onClick={salvar}
                                    type='button'
                                    className='btn btn-success'
                                >
                                    Salvar
                                </button>
                                <button
                                    onClick={() => navigate(`/listagem-lavajato`)}
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

export default CadastroLavaJato;
