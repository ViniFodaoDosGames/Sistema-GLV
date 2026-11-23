import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams, useOutletContext } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../../components/card';
import FormGroup from '../../components/form-group';

import { mensagemSucesso, mensagemErro } from '../../components/toastr';

import '../../custom.css';

import axios from 'axios';
import { BASE_URL } from '../../config/axios';
import { getSession } from '../../auth';
import { mascaraPlaca, normalizarPlaca, placaValida } from '../../config/util';

function CadastroVeiculo() {
    const { idParam } = useParams();
    const navigate = useNavigate();
    const { cancelar } = useOutletContext();
    const baseURL = `${BASE_URL}/Veiculos`;
    const sessao = getSession();


    const [id, setId] = useState('');
    const [placa, setPlaca] = useState('');
    const [ano, setAno] = useState('');
    const [ativo, setAtivo] = useState(false);
    const [idCor, setIdCor] = useState('');
    const [idModelo, setIdModelo] = useState('');
    const [idMarca, setIdMarca] = useState('');
    const [cores, setCores] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [clientesVeiculos, setClientesVeiculos] = useState([]);
    const [donoEscolhido, setDonoEscolhido] = useState(null);
    const [ligacoesCarregadas, setLigacoesCarregadas] = useState(false);

    const ehCliente = sessao?.role === 'CLIENTE';
    const ligacaoAtual = clientesVeiculos.find((dado) => dado.idVeiculo === idParam);
    const dono = donoEscolhido !== null ? donoEscolhido : ligacaoAtual?.idCliente || '';

    function nomeDoCliente(cliente) {
        const usuario = usuarios.find((dado) => dado.id === cliente.idUsuario);
        return usuario ? usuario.nome : cliente.id;
    }

    async function ligarAoDono(idVeiculo) {
        if (ehCliente) {
            if (idParam == null) {
                await axios.post(`${BASE_URL}/ClientesVeiculos`, { idCliente: sessao.idCliente, idVeiculo });
            }
            return;
        }
        if (ligacaoAtual && dono === '') {
            await axios.delete(`${BASE_URL}/ClientesVeiculos/${ligacaoAtual.id}`);
        } else if (ligacaoAtual && dono !== ligacaoAtual.idCliente) {
            await axios.patch(`${BASE_URL}/ClientesVeiculos/${ligacaoAtual.id}`, { idCliente: dono });
        } else if (!ligacaoAtual && dono !== '') {
            await axios.post(`${BASE_URL}/ClientesVeiculos`, { idCliente: dono, idVeiculo });
        }
    }

    const anoAtual = new Date().getFullYear();
    const modeloEscolhido = modelos.find((dado) => dado.id === idModelo);
    const marcaEscolhida = idMarca !== '' ? idMarca : modeloEscolhido?.idMarca || '';
    const modelosDaMarca = modelos.filter(
        (dado) => dado.idMarca === marcaEscolhida && (dado.ativo || dado.id === idModelo)
    );
    const marcasAtivas = marcas.filter((dado) => dado.ativo || dado.id === marcaEscolhida);
    const coresAtivas = cores.filter((dado) => dado.ativo || dado.id === idCor);
    const clientesAtivos = clientes.filter(
        (dado) => usuarios.find((usuario) => usuario.id === dado.idUsuario)?.status || dado.id === dono
    );
    const categoriaDoModelo = categorias.find((dado) => dado.id === modeloEscolhido?.idCategoriaVeiculo);
    const anosDoModelo = [];
    if (modeloEscolhido) {
        const ultimoAno = Math.min(modeloEscolhido.anoFim || anoAtual, anoAtual);
        for (let anoDaLista = ultimoAno; anoDaLista >= modeloEscolhido.anoInicio; anoDaLista--) {
            anosDoModelo.push(anoDaLista);
        }
    }

    async function salvar() {
        if (!placaValida(placa)) {
            mensagemErro('Placa inválida. Use o formato ABC1234 ou ABC1D23');
            return;
        }
        try {
            const { data: todos } = await axios.get(baseURL);
            if (todos.some((dado) => dado.id !== idParam && normalizarPlaca(dado.placa) === normalizarPlaca(placa))) {
                mensagemErro('Placa já cadastrada');
                return;
            }
        } catch (erro) {
            mensagemErro('Erro ao conferir a placa');
            return;
        }
        if (marcaEscolhida === '') {
            mensagemErro('Informe: Marca');
            return;
        }
        if (idModelo === '') {
            mensagemErro('Informe: Modelo');
            return;
        }
        if (!anosDoModelo.includes(Number(ano))) {
            mensagemErro(`Escolha um ano entre ${anosDoModelo[anosDoModelo.length - 1]} e ${anosDoModelo[0]}`);
            return;
        }
        if (idCor === '') {
            mensagemErro('Informe: Cor');
            return;
        }

        let data = {
            id,
            placa: normalizarPlaca(placa),
            ano: Number(ano),
            ativo: ehCliente && idParam == null ? true : ativo,
            idCor,
            idModelo,
            idCategoriaVeiculo: modeloEscolhido.idCategoriaVeiculo,
        };
        data = JSON.stringify(data);
        if (idParam == null) {
            await axios
                .post(baseURL, data, {
                    headers: { 'Content-Type': 'application/json' },
                })
                .then(async function (response) {
                    await ligarAoDono(response.data.id);
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
                .then(async function (response) {
                    await ligarAoDono(idParam);
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
        axios
            .get(`${BASE_URL}/Marcas`)
            .then((response) => {
                setMarcas(response.data);
            })
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
        axios
            .get(`${BASE_URL}/Clientes`)
            .then((response) => {
                setClientes(response.data);
            })
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
        axios
            .get(`${BASE_URL}/Usuarios`)
            .then((response) => {
                setUsuarios(response.data);
            })
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
        axios
            .get(`${BASE_URL}/ClientesVeiculos`)
            .then((response) => {
                setClientesVeiculos(response.data);
                setLigacoesCarregadas(true);
            })
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
    }, []);

    const veiculoDeOutroCliente =
        ehCliente &&
        idParam != null &&
        ligacoesCarregadas &&
        !clientesVeiculos.some((dado) => dado.idVeiculo === idParam && dado.idCliente === sessao.idCliente);

    if (veiculoDeOutroCliente) {
        return <Navigate to='/listagem-veiculo' replace />;
    }

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
                                    placeholder='ABC1D23'
                                    onChange={(e) => setPlaca(mascaraPlaca(e.target.value))}
                                />
                            </FormGroup>
                            {!ehCliente && (
                                <FormGroup label='Cliente (dono)' htmlFor='inputDono'>
                                    <select
                                        id='inputDono'
                                        value={dono}
                                        className='form-select'
                                        onChange={(e) => setDonoEscolhido(e.target.value)}
                                    >
                                        <option value=''>Sem dono</option>
                                        {clientesAtivos.map((dado) => (
                                            <option key={dado.id} value={dado.id}>
                                                {nomeDoCliente(dado)}
                                            </option>
                                        ))}
                                    </select>
                                </FormGroup>
                            )}
                            <FormGroup label='Marca: *' htmlFor='inputIdMarca'>
                                <select
                                    id='inputIdMarca'
                                    value={marcaEscolhida}
                                    className='form-select'
                                    name='idMarca'
                                    onChange={(e) => {
                                        setIdMarca(e.target.value);
                                        setIdModelo('');
                                        setAno('');
                                    }}
                                >
                                    <option value=''>Selecione</option>
                                    {marcasAtivas.map((dado) => (
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
                                    disabled={marcaEscolhida === ''}
                                    onChange={(e) => {
                                        setIdModelo(e.target.value);
                                        setAno('');
                                    }}
                                >
                                    <option value=''>{marcaEscolhida === '' ? 'Escolha a marca primeiro' : 'Selecione'}</option>
                                    {modelosDaMarca.map((dado) => (
                                        <option key={dado.id} value={dado.id}>
                                            {dado.nome}
                                        </option>
                                    ))}
                                </select>
                            </FormGroup>
                            <FormGroup label='Categoria' htmlFor='inputCategoria'>
                                <input
                                    type='text'
                                    id='inputCategoria'
                                    value={categoriaDoModelo ? categoriaDoModelo.nome : ''}
                                    className='form-control'
                                    placeholder='Preenchida pelo modelo'
                                    disabled
                                />
                            </FormGroup>
                            <FormGroup label='Ano: *' htmlFor='inputAno'>
                                <select
                                    id='inputAno'
                                    value={ano}
                                    className='form-select'
                                    name='ano'
                                    disabled={!modeloEscolhido}
                                    onChange={(e) => setAno(e.target.value)}
                                >
                                    <option value=''>{modeloEscolhido ? 'Selecione' : 'Escolha o modelo primeiro'}</option>
                                    {anosDoModelo.map((anoDaLista) => (
                                        <option key={anoDaLista} value={anoDaLista}>
                                            {anoDaLista}
                                        </option>
                                    ))}
                                </select>
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
                                    {coresAtivas.map((dado) => (
                                        <option key={dado.id} value={dado.id}>
                                            {dado.nome}
                                        </option>
                                    ))}
                                </select>
                            </FormGroup>
                            {!ehCliente && (
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
                            )}
                            <Stack spacing={1} padding={1} direction='row'>
                                <button
                                    onClick={salvar}
                                    type='button'
                                    className='btn btn-success'
                                >
                                    Salvar
                                </button>
                                <button
                                    onClick={() => cancelar(`/listagem-veiculo`)}
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
